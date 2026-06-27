const fs = require("fs");
const path = require("path");
const { sendEmail, emailTemplate } = require("../services/emailService");
const { getActiveEnrolledEmails } = require("../services/firebaseService");
const { getDb } = require("../utils/mongo");
const { ObjectId } = require("mongodb");
const { logger } = require("../logger");
const {
  listUsersFromSql,
  createManagedUser,
  updateManagedUser,
  deleteManagedUser,
  mergeManagedUsers,
  approveAccountRequest,
  rejectAccountRequest,
  deleteAccountRequest,
  listEmployeeCvRecords,
  getManagedUser,
} = require("../services/userService");

const dedupeEmails = (emails) => [...new Set(emails.filter(Boolean))];
const HTML_ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char] || char);

const formatMessageHtml = (message = "") =>
  escapeHtml(message)
    .split(/\r?\n\r?\n/)
    .map((block) => `<p style="margin: 0 0 18px;">${block.replace(/\r?\n/g, "<br />")}</p>`)
    .join("");

const guessImageContentType = (imageUrl = "") => {
  const lowered = String(imageUrl).toLowerCase();
  if (lowered.endsWith(".png")) return "image/png";
  if (lowered.endsWith(".webp")) return "image/webp";
  if (lowered.endsWith(".jpg") || lowered.endsWith(".jpeg")) return "image/jpeg";
  if (lowered.endsWith(".gif")) return "image/gif";
  return "image/png";
};

const getAttachmentFilename = (imageUrl = "", imageLabel = "") => {
  const fallbackBase = String(imageLabel || "broadcast-image")
    .replace(/[^\w.-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  try {
    const pathname = new URL(imageUrl).pathname || "";
    const remoteName = pathname.split("/").pop();
    if (remoteName) return remoteName;
  } catch (error) {
    logger.warn(`Unable to parse broadcast image URL for filename: ${error.message}`);
  }

  const extension = guessImageContentType(imageUrl).split("/")[1] || "png";
  return `${fallbackBase || "broadcast-image"}.${extension}`;
};

const buildBroadcastContent = ({ message, imageUrl, imageLabel }) => {
  const safeImageUrl = imageUrl ? escapeHtml(imageUrl) : "";
  const safeImageLabel = escapeHtml(imageLabel || "Broadcast image");
  const imageBlock = safeImageUrl
    ? `
      <div style="margin: 0 0 24px; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 18px;">
        <img src="${safeImageUrl}" alt="${safeImageLabel}" style="display: block; width: 100%; max-height: 320px; object-fit: contain; border-radius: 14px; background: #ffffff;" />
        <p style="margin: 12px 0 0; font-size: 12px; color: #64748b; text-align: center;">${safeImageLabel}</p>
      </div>
    `
    : "";

  return `
    ${imageBlock}
    <div style="font-size: 15px; color: #334155; line-height: 1.8;">
      ${formatMessageHtml(message)}
    </div>
  `;
};

const getActiveGenericEnrolledEmails = async () => {
  const docs = await getDb()
    .collection("enrollments")
    .find({ status: "active" })
    .toArray();

  return dedupeEmails(docs.map((d) => d.userEmail));
};

const getGenericCourseEnrollments = async (courseId, courseTitle) => {
  const enrollments = await getDb()
    .collection("enrollments")
    .find({ courseId, status: "active" })
    .toArray();

  if (!courseTitle) {
    return enrollments;
  }

  const legacyEnrollments = await getDb()
    .collection("enrollments")
    .find({ courseTitle, status: "active" })
    .toArray();

  return [...new Map([...enrollments, ...legacyEnrollments].map((enrollment) => [enrollment._id, enrollment])).values()];
};

const getAuthorizedCourse = async (requestUser, courseId) => {
  const course = await getDb().collection("courses").findOne({
    _id: ObjectId.isValid(courseId) ? new ObjectId(courseId) : courseId,
  });

  if (!course) {
    return {
      error: {
        status: 404,
        message: "Course not found.",
      },
    };
  }

  course.id = course._id;

  if (requestUser?.role === "admin") {
    return { course };
  }

  const assignedIds = [course.assignedEmployeeId, course.assignedEmployeeRef].filter(Boolean);
  const requesterIds = [requestUser?.uid, requestUser?.employeeId].filter(Boolean);
  const hasAccess = requesterIds.some((id) => assignedIds.includes(id));

  if (!hasAccess) {
    return {
      error: {
        status: 403,
        message: "You can only message students from courses assigned to you.",
      },
    };
  }

  return { course };
};

const handleAdminError = (res, error, fallbackMessage) => {
  logger.error(error);
  return res.status(error.status || 500).json({
    success: false,
    message: error.message || fallbackMessage,
    code: error.code || "internal_error",
  });
};

/**
 * POST /api/admin/broadcast-email
 * Send bulk emails to enrolled students or manual list
 */
const broadcastEmail = async (req, res) => {
  const { targetType, manualEmails, subject, message, imageUrl, imageLabel, attachImage } = req.body;

  try {
    if (!subject?.trim() || !message?.trim()) {
      return res.status(400).json({ success: false, message: "Subject and message are required." });
    }

    const requesterRole = req.user?.role;
    let authorizedCourse = null;

    if (requesterRole !== "admin") {
      if (targetType !== "course" || !req.body.courseId) {
        return res.status(403).json({
          success: false,
          message: "Employees can only send broadcasts for their assigned courses.",
        });
      }

      const { course, error } = await getAuthorizedCourse(req.user, req.body.courseId);
      if (error) {
        return res.status(error.status).json({ success: false, message: error.message });
      }

      authorizedCourse = course;
    }

    let emails = [];

    if (targetType === "enrolled") {
      const [genericEmails, tradingEmails] = await Promise.all([
        getActiveGenericEnrolledEmails(),
        getActiveEnrolledEmails(),
      ]);
      emails = dedupeEmails([...genericEmails, ...tradingEmails]);
    } else if (targetType === "course" && req.body.courseId) {
      const course = authorizedCourse || (await getAuthorizedCourse(req.user, req.body.courseId)).course;
      const enrolls = await getGenericCourseEnrollments(req.body.courseId, course?.title);
      emails = enrolls
        .filter((enrollment) => !req.body.planId || enrollment.planId === req.body.planId)
        .map((enrollment) => enrollment.userEmail)
        .filter(Boolean);
      emails = dedupeEmails(emails);
    } else if (targetType === "manual" && manualEmails) {
      emails = manualEmails
        .split(/[\n, ]+/)
        .map((e) => e.trim())
        .filter((e) => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    }

    if (emails.length === 0) {
      return res.status(400).json({ success: false, message: "No valid email addresses found." });
    }

    const normalizedImageUrl =
      typeof imageUrl === "string" && imageUrl.trim()
        ? imageUrl.trim().startsWith("http")
          ? imageUrl.trim()
          : `${req.protocol}://${req.get("host")}${imageUrl.trim().startsWith("/") ? imageUrl.trim() : `/${imageUrl.trim()}`}`
        : "";

    const attachments =
      attachImage && normalizedImageUrl
        ? [
            {
              filename: getAttachmentFilename(normalizedImageUrl, imageLabel),
              path: normalizedImageUrl,
              contentType: guessImageContentType(normalizedImageUrl),
            },
          ]
        : undefined;

    const html = emailTemplate(escapeHtml(subject.trim()), buildBroadcastContent({
      message: message.trim(),
      imageUrl: normalizedImageUrl,
      imageLabel: imageLabel || "Broadcast image",
    }));

    const results = { sent: 0, failed: 0 };
    for (let i = 0; i < emails.length; i += 50) {
      const batch = emails.slice(i, i + 50);
      await Promise.all(
        batch.map(async (email) => {
          try {
            await sendEmail({
              to: email,
              subject: subject.trim(),
              html,
              attachments,
            });
            results.sent++;
          } catch (e) {
            logger.error(`Broadcast failed for ${email}: ${e.message}`);
            results.failed++;
          }
        })
      );
    }

    res.json({
      success: true,
      message: `Broadcast complete. Sent: ${results.sent}, Failed: ${results.failed}`,
      count: results.sent,
    });
  } catch (error) {
    logger.error("Broadcast email error:", error);
    res.status(500).json({ success: false, message: "Internal server error during broadcast." });
  }
};

/**
 * POST /api/admin/notify-account-approval
 * Notify user their account was approved
 */
const notifyAccountApproval = async (req, res) => {
  const { email, name, role } = req.body;

  if (!email || !name) {
    return res.status(400).json({ success: false, message: "Email and Name are required." });
  }

  const welcomeContent = `
    <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <h2 style="color: #1e40af; margin-top: 0;">Welcome to the Team, ${name}!</h2>
      <p style="color: #475569; font-size: 16px;">Your account request for <strong>Amit Solution Hub</strong> has been <strong>APPROVED</strong>.</p>
      <div style="margin: 20px 0; padding: 15px; background: #ffffff; border-left: 4px solid #2563eb; border-radius: 4px;">
        <p style="margin: 4px 0;"><strong>Role:</strong> ${role || "Employee"}</p>
        <p style="margin: 4px 0;"><strong>Status:</strong> Active</p>
      </div>
    </div>
  `;

  try {
    await sendEmail({
      to: email,
      subject: "Account Approved - Welcome to Amit Solution Hub",
      html: emailTemplate("Account Approved!", welcomeContent, "Access Dashboard", "https://www.amitsolutionhub.com/login"),
    });

    logger.info(`Account approval notification sent to ${email}`);
    res.json({ success: true, message: "Notification sent successfully" });
  } catch (error) {
    logger.error("Notify account approval error:", error);
    res.status(500).json({ success: false, message: "Failed to send notification email." });
  }
};

const listUsers = async (req, res) => {
  try {
    const users = await listUsersFromSql({
      role: req.query.role,
      status: req.query.status,
    });
    return res.json({ success: true, users });
  } catch (error) {
    return handleAdminError(res, error, "Unable to load users.");
  }
};

const lookupUserByEmail = async (req, res) => {
  const email = String(req.query.email || "").trim().toLowerCase();
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email query is required.",
      code: "email_required",
    });
  }

  try {
    const user = await getManagedUser(email);
    return res.json({
      success: true,
      exists: Boolean(user),
      email,
      user: user || null,
    });
  } catch (error) {
    return handleAdminError(res, error, "Unable to look up the user.");
  }
};

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();

const createUser = async (req, res) => {
  try {
    const role = req.body.role || "customer";
    const user = await createManagedUser(
      {
        ...req.body,
        role,
      },
      {
        sendActivationEmail: true,
        activationFrom: role === "employee" ? "employee" : "customer",
        requestIp: req.ip,
        createdBy: req.user,
      }
    );

    if (ADMIN_EMAIL) {
      const label = role === "employee" ? "Employee" : "Student";
      sendEmail({
        to: ADMIN_EMAIL,
        subject: `New ${label} account created: ${user.displayName || user.email}`,
        html: emailTemplate(
          `New ${label} Account`,
          `
          <p>A new ${label.toLowerCase()} account has been created:</p>
          <div style="margin: 24px 0; padding: 20px; border: 1px solid #e2e8f0; border-radius: 14px; background: #f8fafc;">
            <p style="margin: 0 0 8px;"><strong>Name:</strong> ${user.displayName || "—"}</p>
            <p style="margin: 0 0 8px;"><strong>Email:</strong> ${user.email}</p>
            <p style="margin: 0 0 8px;"><strong>Role:</strong> ${role}</p>
            <p style="margin: 0;"><strong>Phone:</strong> ${user.phone || "—"}</p>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">Created by ${req.user?.email || "admin"} from the admin panel.</p>
          `,
          "Open Admin Panel",
          process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/admin/students` : "https://www.amitsolutionhub.com/admin/students"
        ),
      }).catch(err => logger.warn("Admin notification email failed:", err.message));
    }

    return res.status(201).json({
      success: true,
      message:
        role === "customer"
          ? "Customer account created. A password setup email has been sent to the registered address."
          : "Employee account created. A password setup email has been sent to the registered address.",
      user,
    });
  } catch (error) {
    return handleAdminError(res, error, "Unable to create the user.");
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await updateManagedUser(req.params.userId, req.body, { updatedBy: req.user });
    return res.json({
      success: true,
      message: "User updated successfully.",
      user,
    });
  } catch (error) {
    return handleAdminError(res, error, "Unable to update the user.");
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await deleteManagedUser(req.params.userId, { deletedBy: req.user });
    return res.json({
      success: true,
      message: "User deleted successfully.",
      user,
    });
  } catch (error) {
    return handleAdminError(res, error, "Unable to delete the user.");
  }
};

const deleteUserByEmail = async (req, res) => {
  const email = String(req.query.email || "").trim().toLowerCase();
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email query is required.",
      code: "email_required",
    });
  }

  try {
    const existingUser = await getManagedUser(email);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
        code: "user_not_found",
      });
    }

    const user = await deleteManagedUser(email, { deletedBy: req.user });
    return res.json({
      success: true,
      message: "User deleted successfully.",
      email,
      user,
    });
  } catch (error) {
    return handleAdminError(res, error, "Unable to delete the user.");
  }
};

const mergeUsers = async (req, res) => {
  try {
    const result = await mergeManagedUsers({
      primaryIdentifier: req.body.primaryUserId,
      duplicateIdentifier: req.body.duplicateUserId,
      mergeReason: req.body.reason,
      mergedBy: req.user,
    });
    return res.json({
      success: true,
      message: "Accounts merged successfully.",
      ...result,
    });
  } catch (error) {
    return handleAdminError(res, error, "Unable to merge the accounts.");
  }
};

const approveRequest = async (req, res) => {
  try {
    const result = await approveAccountRequest(req.params.requestId, req.user);
    return res.json({
      success: true,
      message: result.alreadyExists
        ? "Account already exists. Please reset your password."
        : "The account request has been approved successfully.",
      ...result,
    });
  } catch (error) {
    return handleAdminError(res, error, "Unable to approve the account request.");
  }
};

const rejectRequest = async (req, res) => {
  try {
    const request = await rejectAccountRequest(req.params.requestId, req.user);
    return res.json({
      success: true,
      message: "Account request rejected successfully.",
      request,
    });
  } catch (error) {
    return handleAdminError(res, error, "Unable to reject the account request.");
  }
};

const removeRequest = async (req, res) => {
  try {
    const request = await deleteAccountRequest(req.params.requestId);
    return res.json({
      success: true,
      message: "Account request deleted successfully.",
      request,
    });
  } catch (error) {
    return handleAdminError(res, error, "Unable to delete the account request.");
  }
};

const listEmployeeCvs = async (req, res) => {
  try {
    const cvs = await listEmployeeCvRecords();
    return res.json({ success: true, cvs });
  } catch (error) {
    return handleAdminError(res, error, "Unable to load employee CV records.");
  }
};

/**
 * GET /api/admin/employee-cvs/:userId/download
 * Secure download (admin only); file is stored under uploads/cv/
 */
const downloadEmployeeCv = async (req, res) => {
  try {
    const user = await getManagedUser(req.params.userId);
    if (!user || user.role !== "employee") {
      return res.status(404).json({ success: false, message: "Employee not found." });
    }
    if (!user.cvFilePath) {
      return res.status(404).json({ success: false, message: "No CV file is available for this employee." });
    }

    const baseName = path.basename(String(user.cvFilePath));
    if (!baseName || baseName === "." || baseName === "..") {
      return res.status(400).json({ success: false, message: "Invalid file reference." });
    }

    const cvDir = path.resolve(path.join(__dirname, "..", "uploads", "cv"));
    const absolute = path.resolve(cvDir, baseName);
    if (!absolute.startsWith(cvDir)) {
      return res.status(400).json({ success: false, message: "Invalid file path." });
    }
    if (!fs.existsSync(absolute)) {
      return res.status(404).json({ success: false, message: "The file could not be found on the server." });
    }

    return res.download(absolute, user.cvFileName || baseName);
  } catch (error) {
    return handleAdminError(res, error, "Unable to download the CV file.");
  }
};

module.exports = {
  broadcastEmail,
  notifyAccountApproval,
  listUsers,
  lookupUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  deleteUserByEmail,
  mergeUsers,
  approveRequest,
  rejectRequest,
  removeRequest,
  listEmployeeCvs,
  downloadEmployeeCv,
};
