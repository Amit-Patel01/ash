const { sendEmail, emailTemplate } = require("../services/emailService");
const { getActiveEnrolledEmails } = require("../services/firebaseService");
const { logger } = require("../logger");

/**
 * POST /api/admin/broadcast-email
 * Send bulk emails to enrolled students or manual list
 */
const broadcastEmail = async (req, res) => {
  const { targetType, manualEmails, subject, message } = req.body;

  try {
    let emails = [];

    if (targetType === "enrolled") {
      emails = await getActiveEnrolledEmails();
    } else if (targetType === "course" && req.body.courseId) {
      const { getEnrollmentsByCourse } = require("../services/firebaseService");
      const enrolls = await getEnrollmentsByCourse(req.body.courseId);
      emails = enrolls
        .filter(e => !req.body.planId || e.planId === req.body.planId)
        .map(e => e.userEmail)
        .filter(Boolean);
      emails = [...new Set(emails)];
    } else if (targetType === "manual" && manualEmails) {
      emails = manualEmails
        .split(/[\n, ]+/)
        .map((e) => e.trim())
        .filter((e) => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    }

    if (emails.length === 0) {
      return res.status(400).json({ success: false, message: "No valid email addresses found." });
    }

    const results = { sent: 0, failed: 0 };
    for (let i = 0; i < emails.length; i += 50) {
      const batch = emails.slice(i, i + 50);
      await Promise.all(
        batch.map(async (email) => {
          try {
            await sendEmail({
              to: email,
              subject,
              html: emailTemplate(subject, `<div style="white-space: pre-wrap;">${message}</div>`),
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
