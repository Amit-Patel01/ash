const { sendEmail, emailTemplate } = require("../services/emailService");
const { getActiveEnrolledEmails, db } = require("../services/firebaseService");
const { logger } = require("../logger");

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
  const snap = await db()
    .collection("enrollments")
    .where("status", "==", "active")
    .get();

  return dedupeEmails(snap.docs.map((doc) => doc.data().userEmail));
};

const getGenericCourseEnrollments = async (courseId, courseTitle) => {
  const enrollmentsByIdSnap = await db()
    .collection("enrollments")
    .where("courseId", "==", courseId)
    .where("status", "==", "active")
    .get();

  const enrollments = enrollmentsByIdSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  if (!courseTitle) {
    return enrollments;
  }

  const legacyTitleSnap = await db()
    .collection("enrollments")
    .where("courseTitle", "==", courseTitle)
    .where("status", "==", "active")
    .get();

  const legacyEnrollments = legacyTitleSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  return [...new Map([...enrollments, ...legacyEnrollments].map((enrollment) => [enrollment.id, enrollment])).values()];
};

const getAuthorizedCourse = async (requestUser, courseId) => {
  const courseSnap = await db().collection("courses").doc(courseId).get();

  if (!courseSnap.exists) {
    return {
      error: {
        status: 404,
        message: "Course not found.",
      },
    };
  }

  const course = { id: courseSnap.id, ...courseSnap.data() };

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

module.exports = { broadcastEmail, notifyAccountApproval };
