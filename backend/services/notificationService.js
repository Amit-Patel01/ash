const { sendEmail, emailTemplate } = require("./emailService");
const {
  getSession,
  getEnrollmentsByCourse,
  updateSession,
} = require("./firebaseService");
const { logger } = require("../logger");

const CUSTOMER_DASHBOARD_URL = "https://www.amitsolutionhub.com/customer";

const normalizeText = (value) => String(value || "").trim().toLowerCase();
const compactText = (value) => normalizeText(value).replace(/[^a-z0-9]/g, "");

const splitIntoBatches = (items, size = 50) => {
  const batches = [];
  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }
  return batches;
};

const formatMeetingDateTime = (meetingStartsAt, meetingTimezone = "Asia/Kolkata") => {
  if (!meetingStartsAt) return "Scheduled soon";
  const parsed = new Date(meetingStartsAt);
  if (Number.isNaN(parsed.getTime())) return "Scheduled soon";

  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: meetingTimezone || "Asia/Kolkata",
    }).format(parsed);
  } catch {
    return parsed.toLocaleString("en-IN");
  }
};

const isEnrollmentForCoursePlan = (enrollment, course, plan) => {
  const courseMatches =
    enrollment.courseId === course.id ||
    normalizeText(enrollment.courseTitle) === normalizeText(course.title) ||
    normalizeText(enrollment.courseName) === normalizeText(course.title);

  if (!courseMatches) return false;

  const planKeys = [enrollment.planId, enrollment.planLabel, enrollment.planName]
    .map(normalizeText)
    .filter(Boolean);
  const compactPlanKeys = [enrollment.planId, enrollment.planLabel, enrollment.planName]
    .map(compactText)
    .filter(Boolean);
  const enrollmentAmount = Number(enrollment.amount);

  if (planKeys.length === 0) {
    if (!Number.isNaN(enrollmentAmount)) {
      const amountMatches = (course.plans || []).filter((item) => {
        const planAmount = Number(item?.price || 0);
        const freePlan = item?.isFree || planAmount === 0;
        return freePlan ? enrollmentAmount === 0 : planAmount === enrollmentAmount;
      });
      if (amountMatches.length === 1) return amountMatches[0]?.id === plan?.id;
    }
    return (course.plans || []).length <= 1;
  }

  const directMatch = (
    planKeys.includes(normalizeText(plan.id)) ||
    planKeys.includes(normalizeText(plan.label)) ||
    planKeys.includes(String((course.plans || []).findIndex((item) => item?.id === plan?.id))) ||
    compactPlanKeys.includes(compactText(plan.id)) ||
    compactPlanKeys.includes(compactText(plan.label))
  );

  if (directMatch) return true;

  if (!Number.isNaN(enrollmentAmount)) {
    const amountMatches = (course.plans || []).filter((item) => {
      const planAmount = Number(item?.price || 0);
      const freePlan = item?.isFree || planAmount === 0;
      return freePlan ? enrollmentAmount === 0 : planAmount === enrollmentAmount;
    });
    if (amountMatches.length === 1) return amountMatches[0]?.id === plan?.id;
  }

  return false;
};

const resolveCoursePlanMeetingLink = (course, plan) => {
  if (plan?.meetingLink) return plan.meetingLink;
  const plans = Array.isArray(course?.plans) ? course.plans : [];
  return plans.length <= 1 ? (course?.meetingLink || "") : "";
};

const sendBatchedEmails = async (emails, subject, html) => {
  const batches = splitIntoBatches(emails, 50);
  for (const batch of batches) {
    await Promise.all(
      batch.map((email) =>
        sendEmail({
          to: email,
          subject,
          html,
        })
      )
    );
  }
};

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
        ? session.meeting_link || CUSTOMER_DASHBOARD_URL
        : CUSTOMER_DASHBOARD_URL;

    await sendBatchedEmails(emails, subject, emailTemplate(subject, content, ctaText, ctaUrl));

    if (type === "REMINDER") {
      await updateSession(sessionId, { reminderSent: true });
    }

    logger.info(`${type} notification sent to ${emails.length} users for: ${session.topic}`);
  } catch (error) {
    logger.error(`Notification error (${type}): ${error.message}`);
  }
};

const sendCoursePlanNotification = async (course, plan, enrollments, type) => {
  try {
    if (!course || !plan) return 0;

    const recipients = (enrollments || [])
      .filter((enrollment) => isEnrollmentForCoursePlan(enrollment, course, plan))
      .map((enrollment) => enrollment.userEmail)
      .filter(Boolean);

    const emails = [...new Set(recipients)];
    if (emails.length === 0) return 0;

    const meetingDateTime = formatMeetingDateTime(
      plan.meetingStartsAt,
      plan.meetingTimezone
    );
    const planLabel = plan.label || "Selected plan";
    const directJoinUrl = resolveCoursePlanMeetingLink(course, plan);
    const joinUrl = directJoinUrl || CUSTOMER_DASHBOARD_URL;
    const subject =
      type === "LIVE_NOW"
        ? `🔴 Live Now: ${course.title} (${planLabel})`
        : `⏳ Reminder: ${course.title} (${planLabel}) starts in 60 mins`;

    const content =
      type === "LIVE_NOW"
        ? `
          <p>Hello Student,</p>
          <p>Your <strong>${course.title}</strong> session for the <strong>${planLabel}</strong> plan is <strong>live right now</strong>.</p>
          <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 8px;">
            <p style="margin: 0; color: #991b1b; font-weight: bold;">Meeting Time: ${meetingDateTime}</p>
            <p style="margin: 4px 0 0; color: #b91c1c; font-size: 13px;">Use the button below to join your live class immediately.</p>
          </div>
        `
        : `
          <p>Hello Student,</p>
          <p>Your <strong>${course.title}</strong> session for the <strong>${planLabel}</strong> plan will start in about 60 minutes.</p>
          <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0; border-radius: 8px;">
            <p style="margin: 0; color: #1e40af; font-weight: bold;">Meeting Time: ${meetingDateTime}</p>
            <p style="margin: 4px 0 0; color: #1e3a8a; font-size: 13px;">Keep your device ready. You can also open the session directly from your customer panel.</p>
          </div>
        `;

    await sendBatchedEmails(
      emails,
      subject,
      emailTemplate(subject, content, "Join Meeting", joinUrl)
    );

    logger.info(
      `${type} notification sent to ${emails.length} users for generic course ${course.title} (${planLabel})`
    );
    return emails.length;
  } catch (error) {
    logger.error(`Generic course notification error (${type}): ${error.message}`);
    return 0;
  }
};

module.exports = { sendSessionNotification, sendCoursePlanNotification };
