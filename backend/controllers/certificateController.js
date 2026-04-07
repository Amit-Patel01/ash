const {
  getCertificateByUserAndCourse,
  addCertificate,
  getCertificateById,
  updateCertificate,
  getCertificateByPublicId,
} = require("../services/firebaseService");
const { logger } = require("../logger");

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
      const admin = require("firebase-admin");
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
  const { certId } = req.params;

  try {
    const certData = await getCertificateByPublicId(certId);

    if (!certData) {
      return res.status(404).json({ success: false, message: "Invalid or unapproved Certificate ID" });
    }

    res.json({
      success: true,
      data: {
        name: certData.userName,
        course: certData.courseName,
        date: certData.approval_date?.toDate?.()?.toLocaleDateString() || "N/A",
        certificate_id: certData.certificate_id,
      },
    });
  } catch (error) {
    logger.error("Certificate verify error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { requestCertificate, updateCertificateStatus, verifyCertificate };
