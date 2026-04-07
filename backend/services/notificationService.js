const { sendEmail, emailTemplate } = require("./emailService");
const {
  getSession,
  getEnrollmentsByCourse,
  updateSession,
} = require("./firebaseService");
const { logger } = require("../logger");

/**
 * Send session notifications (LIVE_NOW or REMINDER) to all enrolled users
 * @param {string} sessionId
 * @param {'LIVE_NOW'|'REMINDER'} type
 */
const sendSessionNotification = async (sessionId, type) => {
  try {
    const session = await getSession(sessionId);
    if (!session) return;

    const enrollments = await getEnrollmentsByCourse(session.course_id || session.courseId);
    const emails = [...new Set(enrollments.map((e) => e.userEmail).filter(Boolean))];
    if (emails.length === 0) return;

    const subject =
      type === "LIVE_NOW"
        ? `🔴 WE ARE LIVE: ${session.topic}`
        : `⏳ Reminder: Meeting Starting in 60 Mins - ${session.topic}`;

    const content =
      type === "LIVE_NOW"
        ? `
        <p>Hello Trader,</p>
        <p>We are <strong>LIVE NOW</strong> for our session: <strong>${session.topic}</strong>.</p>
        <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 8px;">
          <p style="margin: 0; color: #991b1b; font-weight: bold;">Topic: ${session.topic}</p>
          <p style="margin: 4px 0 0; color: #b91c1c; font-size: 13px;">Don't miss out on the live market analysis!</p>
        </div>
      `
        : `
        <p>Hello Trader,</p>
        <p>Your trading session <strong>${session.topic}</strong> is starting in about 60 minutes.</p>
        <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0; border-radius: 8px;">
          <p style="margin: 0; color: #1e40af; font-weight: bold;">Scheduled Time: ${session.time}</p>
          <p style="margin: 4px 0 0; color: #1e3a8a; font-size: 13px;">Please be ready with your charts and questions.</p>
        </div>
      `;

    const ctaText = type === "LIVE_NOW" ? "Join Live Stream" : "Go to Dashboard";
    const ctaUrl =
      type === "LIVE_NOW"
        ? session.meeting_link || "https://www.amitsolutionhub.com/customer"
        : "https://www.amitsolutionhub.com/customer";

    for (let i = 0; i < emails.length; i += 50) {
      const batch = emails.slice(i, i + 50);
      await Promise.all(
        batch.map((email) =>
          sendEmail({
            to: email,
            subject,
            html: emailTemplate(subject, content, ctaText, ctaUrl),
          })
        )
      );
    }

    if (type === "REMINDER") {
      await updateSession(sessionId, { reminderSent: true });
    }

    logger.info(`${type} notification sent to ${emails.length} users for: ${session.topic}`);
  } catch (error) {
    logger.error(`Notification error (${type}): ${error.message}`);
  }
};

module.exports = { sendSessionNotification };
