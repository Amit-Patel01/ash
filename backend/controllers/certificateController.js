const {
  getCertificateByUserAndCourse,
  addCertificate,
  getCertificateById,
  updateCertificate,
  getCertificateByPublicId,
  findCertificateByPublicId,
  createCertificateRecord,
  deleteCertificate,
} = require("../services/firebaseService");
const { sendEmail, emailTemplate } = require("../services/emailService");
const { logger } = require("../logger");
const admin = require("firebase-admin");

const QR_CERTIFICATE_TYPES = {
  LOR: "Letter of Recommendation",
  LOA: "Letter of Achievement",
  Appreciation: "Appreciation Certificate",
};
const QR_RECORD_SOURCE = "qr";
const QR_RECORD_ACTIVE = "active";
const QR_RECORD_REVOKED = "revoked";
const QR_ID_PATTERN = /^QR-[A-Z0-9]{5,32}$/;
const PUBLIC_CERTIFICATE_ID_PATTERN = /^[A-Z0-9]{2,10}-[A-Z0-9]{4,32}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

const normalizeCertificateId = (value) => String(value || "").trim().toUpperCase();

const isValidPublicCertificateId = (value) =>
  PUBLIC_CERTIFICATE_ID_PATTERN.test(normalizeCertificateId(value));

const isQrCertificateId = (value) => QR_ID_PATTERN.test(normalizeCertificateId(value));

const serializeCertificateDate = (value) => {
  if (!value) return "N/A";

  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString("en-IN");
  }

  if (typeof value?.toDate === "function") {
    return value.toDate().toLocaleDateString("en-IN");
  }

  if (value instanceof Date) {
    return value.toLocaleDateString("en-IN");
  }

  return "N/A";
};

const getFrontendUrl = (req) => {
  // Priority: env FRONTEND_URL -> APP_URL -> production default -> localhost fallback
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL.replace(/\/$/, ''); // Remove trailing slash
  }
  
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, '');
  }
  
  // Production default
  return 'https://www.amitsolutionhub.com';
};

const buildVerifyUrl = (req, certId) => {
  const baseUrl = getFrontendUrl(req);
  return `${baseUrl}/verify/${encodeURIComponent(certId)}`;
};

const normalizeQrCertificateType = (value) => {
  const normalized = String(value || "").trim();
  return Object.keys(QR_CERTIFICATE_TYPES).find((type) => type.toLowerCase() === normalized.toLowerCase()) || "";
};

const normalizeCertificateDateInput = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toISOString().slice(0, 10);
};

const normalizeOptionalText = (value) => String(value || "").trim();

const validateQrCertificateInput = (payload = {}, { partial = false } = {}) => {
  const errors = [];
  const updates = {};

  if (!partial || Object.prototype.hasOwnProperty.call(payload, "name")) {
    const name = String(payload.name || "").trim();
    if (!name) {
      errors.push("Name is required.");
    } else if (name.length > 120) {
      errors.push("Name must be 120 characters or fewer.");
    } else {
      updates.name = name;
      updates.userName = name;
    }
  }

  if (!partial || Object.prototype.hasOwnProperty.call(payload, "certificateType")) {
    const certificateType = normalizeQrCertificateType(payload.certificateType);
    if (!certificateType) {
      errors.push("Certificate type must be LOR, LOA, or Appreciation.");
    } else {
      updates.certificateType = certificateType;
      updates.certificateTypeLabel = QR_CERTIFICATE_TYPES[certificateType];
      updates.documentLabel = QR_CERTIFICATE_TYPES[certificateType];
    }
  }

  if (!partial || Object.prototype.hasOwnProperty.call(payload, "date")) {
    const date = normalizeCertificateDateInput(payload.date);
    if (!date) {
      errors.push("Date must be a valid certificate date.");
    } else {
      updates.date = date;
      updates.approval_date = admin.firestore.Timestamp.fromDate(new Date(`${date}T00:00:00.000Z`));
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, "status")) {
    const status = String(payload.status || "").trim().toLowerCase();
    if (![QR_RECORD_ACTIVE, QR_RECORD_REVOKED].includes(status)) {
      errors.push("Status must be either active or revoked.");
    } else {
      updates.status = status;
    }
  }

  if (!partial || Object.prototype.hasOwnProperty.call(payload, "certificateText")) {
    const certificateText = String(payload.certificateText || "").trim();
    if (!certificateText) {
      errors.push("Certificate text is required.");
    } else if (certificateText.length > 5000) {
      errors.push("Certificate text must be 5000 characters or fewer.");
    } else {
      updates.certificateText = certificateText;
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, "signatureImageUrl")) {
    const signatureImageUrl = String(payload.signatureImageUrl || "").trim();
    if (signatureImageUrl && signatureImageUrl.length > 1000) {
      errors.push("Signature image URL is too long.");
    } else {
      updates.signatureImageUrl = signatureImageUrl;
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, "stampImageUrl")) {
    const stampImageUrl = String(payload.stampImageUrl || "").trim();
    if (stampImageUrl && stampImageUrl.length > 1000) {
      errors.push("Stamp image URL is too long.");
    } else {
      updates.stampImageUrl = stampImageUrl;
    }
  }

  const assignmentFieldsTouched =
    !partial ||
    ["assignedEmployeeUid", "assignedEmployeeId", "assignedEmployeeName", "assignedEmployeeEmail"].some((key) =>
      Object.prototype.hasOwnProperty.call(payload, key)
    );

  if (assignmentFieldsTouched) {
    const assignedEmployeeUid = normalizeOptionalText(payload.assignedEmployeeUid);
    const assignedEmployeeId = normalizeOptionalText(payload.assignedEmployeeId);
    const assignedEmployeeName = normalizeOptionalText(payload.assignedEmployeeName);
    const assignedEmployeeEmail = normalizeOptionalText(payload.assignedEmployeeEmail).toLowerCase();

    if (assignedEmployeeUid.length > 160) {
      errors.push("Assigned employee UID is too long.");
    } else {
      updates.assignedEmployeeUid = assignedEmployeeUid;
    }

    if (assignedEmployeeId.length > 160) {
      errors.push("Assigned employee ID is too long.");
    } else {
      updates.assignedEmployeeId = assignedEmployeeId;
    }

    if (assignedEmployeeName.length > 160) {
      errors.push("Assigned employee name is too long.");
    } else {
      updates.assignedEmployeeName = assignedEmployeeName;
    }

    if (assignedEmployeeEmail.length > 320) {
      errors.push("Assigned employee email is too long.");
    } else if (assignedEmployeeEmail && !EMAIL_PATTERN.test(assignedEmployeeEmail)) {
      errors.push("Assigned employee email must be valid.");
    } else {
      updates.assignedEmployeeEmail = assignedEmployeeEmail;
    }

    updates.assignedEmployeeRef = assignedEmployeeUid || assignedEmployeeId || assignedEmployeeEmail || "";
  }

  return { errors, updates };
};

const generateUniqueCertificateId = async (prefix = "AP") => {
  const normalizedPrefix = String(prefix || "AP")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8) || "AP";

  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  while (true) {
    let result = "";
    for (let i = 0; i < 8; i += 1) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const nextId = `${normalizedPrefix}-${result}`;
    const existing = await findCertificateByPublicId(nextId);
    if (!existing) return nextId;
  }
};

const buildVerifyResponseData = (certificate, req) => {
  const certificateId = normalizeCertificateId(certificate?.certificate_id);
  const source = certificate?.source || "manual";
  const qrVerified = source === QR_RECORD_SOURCE || isQrCertificateId(certificateId);
  const rawStatus = String(certificate?.status || "").trim().toLowerCase();
  const isValid = qrVerified ? rawStatus === QR_RECORD_ACTIVE : rawStatus === "approved";
  const statusDisplay = qrVerified
    ? (rawStatus === QR_RECORD_REVOKED ? "Revoked" : "Active")
    : (rawStatus === "approved" ? "Approved" : rawStatus || "Unknown");

  return {
    id: certificate?.id || "",
    certificate_id: certificateId,
    name: certificate?.userName || certificate?.name || "N/A",
    userName: certificate?.userName || certificate?.name || "N/A",
    course: certificate?.courseName || certificate?.course || certificate?.certificateType || certificate?.documentLabel || "Certificate",
    courseName: certificate?.courseName || certificate?.course || "",
    certificateType: certificate?.certificateType || certificate?.documentLabel || certificate?.documentType || "Certificate",
    certificateTypeLabel:
      certificate?.certificateTypeLabel ||
      QR_CERTIFICATE_TYPES[certificate?.certificateType] ||
      certificate?.documentLabel ||
      certificate?.certificateType ||
      certificate?.documentType ||
      "Certificate",
    documentLabel:
      certificate?.documentLabel ||
      certificate?.certificateTypeLabel ||
      QR_CERTIFICATE_TYPES[certificate?.certificateType] ||
      certificate?.certificateType ||
      certificate?.documentType ||
      "Certificate",
    documentType: certificate?.documentType || (qrVerified ? "qr_certificate" : "certificate"),
    date: serializeCertificateDate(certificate?.date || certificate?.approval_date || certificate?.createdAt),
    rawDate: certificate?.date || null,
    certificateText: certificate?.certificateText || "",
    signatureImageUrl: certificate?.signatureImageUrl || "",
    stampImageUrl: certificate?.stampImageUrl || "",
    assignedEmployeeUid: certificate?.assignedEmployeeUid || "",
    assignedEmployeeId: certificate?.assignedEmployeeId || "",
    assignedEmployeeRef: certificate?.assignedEmployeeRef || "",
    assignedEmployeeName: certificate?.assignedEmployeeName || "",
    assignedEmployeeEmail: certificate?.assignedEmployeeEmail || "",
    status: rawStatus || "unknown",
    statusDisplay,
    source,
    qrVerified,
    isValid,
    verifyUrl: buildVerifyUrl(req, certificateId),
  };
};

const sendAssignedCertificateEmail = async (certificate, req, { updated = false } = {}) => {
  const assignedEmployeeEmail = normalizeOptionalText(certificate?.assignedEmployeeEmail).toLowerCase();

  if (!assignedEmployeeEmail || !EMAIL_PATTERN.test(assignedEmployeeEmail)) {
    return false;
  }

  const certificateView = buildVerifyResponseData(certificate, req);
  const employeeName =
    certificate?.assignedEmployeeName ||
    certificateView.name ||
    "Team Member";
  const subject = updated
    ? `Certificate updated for ${employeeName}`
    : `New certificate assigned to ${employeeName}`;
  const content = `
    <p>Hello ${employeeName},</p>
    <p>${updated ? "Your QR certificate has been updated." : "A new QR certificate has been assigned to you."}</p>
    <div style="margin: 24px 0; padding: 20px; border: 1px solid #e2e8f0; border-radius: 14px; background: #f8fafc;">
      <p style="margin: 0 0 10px;"><strong>Certificate ID:</strong> ${certificateView.certificate_id}</p>
      <p style="margin: 0 0 10px;"><strong>Certificate Type:</strong> ${certificateView.certificateTypeLabel}</p>
      <p style="margin: 0 0 10px;"><strong>Date:</strong> ${certificateView.date}</p>
      <p style="margin: 0;"><strong>Status:</strong> ${certificateView.statusDisplay}</p>
    </div>
    <p>You can open the certificate preview, verify it online, and download it from your employee dashboard or the verification page.</p>
  `;

  try {
    const emailResult = await sendEmail({
      to: assignedEmployeeEmail,
      subject,
      html: emailTemplate(subject, content, "Open Certificate", certificateView.verifyUrl),
    });
    
    if (!emailResult.success) {
      logger.error("QR certificate assignment email failed:", {
        email: assignedEmployeeEmail,
        certificateId: certificateView.certificate_id,
        error: emailResult.error,
      });
      return false;
    }
    
    logger.info("QR certificate assignment email sent:", {
      email: assignedEmployeeEmail,
      certificateId: certificateView.certificate_id,
      emailId: emailResult.id,
    });
    return true;
  } catch (error) {
    logger.error("QR certificate assignment email exception:", error);
    return false;
  }
};

/**
 * Generates a unique Certificate ID in the format AP-XXXXXXXX
 */
const generateCertificateId = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `AP-${result}`;
};

/**
 * POST /api/certificates/request
 */
const requestCertificate = async (req, res) => {
  const { userId, userName, userEmail, courseName } = req.body;

  if (!userId || !userName || !userEmail || !courseName) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    const existing = await getCertificateByUserAndCourse(userId, courseName);
    if (existing) {
      return res.status(400).json({ success: false, message: "Certificate already requested/exists for this course" });
    }

    const id = await addCertificate({
      userId,
      userName,
      userEmail,
      courseName,
      status: "pending",
    });

    res.json({ success: true, id });
  } catch (error) {
    logger.error("Certificate request error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * PATCH /api/certificates/update-status
 */
const updateCertificateStatus = async (req, res) => {
  const { certId, status, adminId } = req.body;

  if (!certId || !status) {
    return res.status(400).json({ success: false, message: "Missing certificate ID or status" });
  }

  try {
    const cert = await getCertificateById(certId);
    if (!cert) {
      return res.status(404).json({ success: false, message: "Certificate not found" });
    }

    const updates = { status };

    if (status === "approved" && !cert.certificate_id) {
      let newId = "";
      let uniqueIdFound = false;

      while (!uniqueIdFound) {
        newId = generateCertificateId();
        const existing = await getCertificateByPublicId(newId);
        if (!existing) uniqueIdFound = true;
      }

      updates.certificate_id = newId;
      updates.approval_date = admin.firestore.FieldValue.serverTimestamp();
    }

    await updateCertificate(certId, updates);
    res.json({ success: true, certificate_id: updates.certificate_id });
  } catch (error) {
    logger.error("Certificate status update error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/certificates/verify/:certId
 */
const verifyCertificate = async (req, res) => {
  const certId = normalizeCertificateId(req.params.certId);
  
  logger.info("Certificate verification started:", { certId });

  if (!isValidPublicCertificateId(certId)) {
    logger.warn("Invalid certificate ID format:", { certId });
    return res.status(400).json({ success: false, message: "Invalid certificate ID format" });
  }

  try {
    logger.info("Searching for certificate:", { certId });
    const certData = await findCertificateByPublicId(certId);

    if (!certData) {
      logger.warn("Certificate not found:", { certId });
      return res.status(404).json({ success: false, message: "Certificate not found" });
    }
    
    logger.info("Certificate found successfully:", { 
      certId, 
      certificateType: certData.certificateType,
      status: certData.status 
    });

    res.json({
      success: true,
      data: buildVerifyResponseData(certData, req),
    });
  } catch (error) {
    logger.error("Certificate verify error:", { certId, error: error.message });
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const createQrCertificate = async (req, res) => {
  const { errors, updates } = validateQrCertificateInput(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(" ") });
  }

  try {
    const certificateId = await generateUniqueCertificateId("QR");
    const record = {
      ...updates,
      source: QR_RECORD_SOURCE,
      status: QR_RECORD_ACTIVE,
      certificate_id: certificateId,
      createdByUid: req.user?.uid || "",
      createdByEmail: req.user?.email || "",
      verifyUrl: buildVerifyUrl(req, certificateId),
    };

    const id = await createCertificateRecord(record);
    const created = await getCertificateById(id);
    const assignmentEmailSent = await sendAssignedCertificateEmail(created, req);

    return res.status(201).json({
      success: true,
      certificate: {
        ...buildVerifyResponseData(created, req),
        assignmentEmailSent,
      },
    });
  } catch (error) {
    logger.error("QR certificate create error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateQrCertificate = async (req, res) => {
  const { docId } = req.params;
  const { errors, updates } = validateQrCertificateInput(req.body, { partial: true });

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(" ") });
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: "No valid updates supplied." });
  }

  try {
    const certificate = await getCertificateById(docId);

    if (!certificate || certificate.source !== QR_RECORD_SOURCE) {
      return res.status(404).json({ success: false, message: "QR certificate not found" });
    }

    await updateCertificate(docId, {
      ...updates,
      verifyUrl: buildVerifyUrl(req, certificate.certificate_id),
      updatedByUid: req.user?.uid || "",
      updatedByEmail: req.user?.email || "",
    });

    const updated = await getCertificateById(docId);
    const assignmentEmailSent = await sendAssignedCertificateEmail(updated, req, { updated: true });

    return res.json({
      success: true,
      certificate: {
        ...buildVerifyResponseData(updated, req),
        assignmentEmailSent,
      },
    });
  } catch (error) {
    logger.error("QR certificate update error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateQrCertificateStatus = async (req, res) => {
  const { docId } = req.params;
  const status = String(req.body?.status || "").trim().toLowerCase();

  if (![QR_RECORD_ACTIVE, QR_RECORD_REVOKED].includes(status)) {
    return res.status(400).json({ success: false, message: "Status must be active or revoked." });
  }

  try {
    const certificate = await getCertificateById(docId);

    if (!certificate || certificate.source !== QR_RECORD_SOURCE) {
      return res.status(404).json({ success: false, message: "QR certificate not found" });
    }

    await updateCertificate(docId, {
      status,
      updatedByUid: req.user?.uid || "",
      updatedByEmail: req.user?.email || "",
    });

    const updated = await getCertificateById(docId);

    return res.json({
      success: true,
      certificate: buildVerifyResponseData(updated, req),
    });
  } catch (error) {
    logger.error("QR certificate status update error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const removeQrCertificate = async (req, res) => {
  const { docId } = req.params;

  try {
    const certificate = await getCertificateById(docId);

    if (!certificate || certificate.source !== QR_RECORD_SOURCE) {
      return res.status(404).json({ success: false, message: "QR certificate not found" });
    }

    await deleteCertificate(docId);

    return res.json({
      success: true,
      certificate: {
        id: docId,
        certificate_id: certificate.certificate_id,
      },
    });
  } catch (error) {
    logger.error("QR certificate delete error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  requestCertificate,
  updateCertificateStatus,
  verifyCertificate,
  createQrCertificate,
  updateQrCertificate,
  updateQrCertificateStatus,
  removeQrCertificate,
};
