/**
 * Scheduled AI Tasks Service
 * Runs autonomous AI agent tasks on a daily/periodic cron schedule.
 * No manual dispatch required — agents auto-generate proposals for Admin approval.
 */
const cron = require('node-cron');
const { dispatchDepartmentTask } = require('./agentDispatcher');
const { addPendingProposal, addExecutionLog } = require('./departmentConfig');
const { logger } = require('../../logger');
const { generateUnsubscribeToken } = require('../../routes/unsubscribe');
const { sendEmail, emailTemplate } = require('../emailService');

let schedulerStarted = false;

const safeGetDb = () => {
  try {
    const { getDb } = require('../../utils/mongo');
    return getDb();
  } catch (e) {
    return null;
  }
};

/**
 * Get only subscribed users' emails (filters out emailUnsubscribed=true)
 */
const getSubscribedEmails = async (db) => {
  if (!db) return [];
  try {
    // Also load the unsubscribe blacklist collection
    const [users, blacklist] = await Promise.all([
      db.collection('users').find(
        { email: { $exists: true }, emailUnsubscribed: { $ne: true } },
        { projection: { email: 1 } }
      ).toArray().catch(() => []),
      db.collection('email_unsubscribes').distinct('email').catch(() => [])
    ]);
    const blackSet = new Set(blacklist.map(e => e.toLowerCase()));
    return users.map(u => u.email).filter(e => e && !blackSet.has(e.toLowerCase()));
  } catch {
    return [];
  }
};

/**
 * Build a secure personalized unsubscribe URL for each recipient
 */
const buildUnsubscribeUrl = (email) => {
  const baseUrl = process.env.BACKEND_URL || process.env.PUBLIC_URL || 'https://api.amitsolutionhub.com';
  const token = generateUnsubscribeToken(email);
  return `${baseUrl}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
};

/**
 * TASK 1 — FinanceAgent: Daily Revenue Report (runs 9 AM every day)
 */
const runFinanceDailyReport = async () => {
  logger.info('[Scheduler] FinanceAgent: Running daily revenue analysis...');
  const db = safeGetDb();
  if (!db) return;

  try {
    const since = new Date(Date.now() - 86400000); // last 24 hours
    const orders = await db.collection('orders').find({
      createdAt: { $gte: since },
      status: { $in: ['completed', 'paid', 'success'] }
    }).toArray().catch(() => []);

    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
    const pendingOrders = await db.collection('orders').countDocuments({ status: 'pending' }).catch(() => 0);
    const totalUsers = await db.collection('users').countDocuments().catch(() => 0);

    addPendingProposal(
      'finance',
      `📊 Daily Revenue Report — ₹${totalRevenue.toLocaleString('en-IN')} in last 24 hours`,
      'finance_daily_report',
      `FinanceAgent auto-analyzed ${orders.length} completed orders. Total revenue: ₹${totalRevenue.toLocaleString('en-IN')}. Pending orders: ${pendingOrders}. Total users: ${totalUsers}. Click Approve to acknowledge and log this report.`,
      {
        date: new Date().toISOString().split('T')[0],
        totalRevenue,
        completedOrders: orders.length,
        pendingOrders,
        totalUsers,
        reportType: 'daily'
      }
    );

    addExecutionLog('finance', `Auto Daily Revenue Report generated: ₹${totalRevenue}`, 'success');
    logger.info(`[Scheduler] FinanceAgent: Report generated — ₹${totalRevenue} revenue from ${orders.length} orders.`);
  } catch (err) {
    logger.error(`[Scheduler] FinanceAgent error: ${err.message}`);
  }
};

/**
 * TASK 2 — HRAgent: Auto-Certificate Issuance for completed enrollments (runs 10 AM every day)
 */
const runAutoCertificate = async () => {
  logger.info('[Scheduler] HRAgent: Checking for completed enrollments...');
  const db = safeGetDb();
  if (!db) return;

  try {
    // Find enrollments marked as completed but no certificate issued yet
    const completedEnrollments = await db.collection('enrollments').find({
      status: { $in: ['completed', 'passed'] },
      certificateIssued: { $ne: true }
    }).limit(10).toArray().catch(() => []);

    for (const enrollment of completedEnrollments) {
      const certId = `QR-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
      const studentName = enrollment.studentName || enrollment.userName || 'Student';
      const courseName = enrollment.courseName || enrollment.courseTitle || 'Course';

      addPendingProposal(
        'hr',
        `📜 Auto-Issue Certificate for ${studentName} — ${courseName}`,
        'issue_certificate',
        `HRAgent detected ${studentName} completed "${courseName}". Certificate ID: ${certId}. Click Approve to write to 'certificates' collection and mark enrollment as certified.`,
        {
          studentName,
          courseName,
          certificateId: certId,
          enrollmentId: enrollment._id?.toString(),
          userId: enrollment.userId,
          issueDate: new Date().toISOString().split('T')[0]
        }
      );
    }

    if (completedEnrollments.length > 0) {
      addExecutionLog('hr', `Auto-detected ${completedEnrollments.length} completed enrollments for certificate issuance`, 'success');
      logger.info(`[Scheduler] HRAgent: Created ${completedEnrollments.length} certificate proposals.`);
    }
  } catch (err) {
    logger.error(`[Scheduler] HRAgent error: ${err.message}`);
  }
};

/**
 * TASK 3 — SupportAgent: Scan unread contact messages & draft replies (runs every 2 hours)
 */
const runSupportScan = async () => {
  logger.info('[Scheduler] SupportAgent: Scanning unread support messages...');
  const db = safeGetDb();
  if (!db) return;

  try {
    // Check unread contact messages
    const unreadMessages = await db.collection('contacts').find({
      replied: { $ne: true },
      aiDrafted: { $ne: true }
    }).limit(5).toArray().catch(() => []);

    for (const msg of unreadMessages) {
      const aiDraft = await dispatchDepartmentTask({
        department: 'support',
        prompt: `Draft a professional, empathetic reply to this student message:\n\nFrom: ${msg.firstName || msg.name || 'Student'}\nMessage: "${msg.message || msg.content || 'No message'}"\n\nWrite a helpful response from the AmitSolutionHub team.`
      }).catch(() => null);

      if (aiDraft) {
        // Mark as AI drafted to avoid duplicate processing
        await db.collection('contacts').updateOne(
          { _id: msg._id },
          { $set: { aiDrafted: true } }
        ).catch(() => {});
      }
    }

    if (unreadMessages.length > 0) {
      logger.info(`[Scheduler] SupportAgent: Drafted replies for ${unreadMessages.length} unread messages.`);
    }
  } catch (err) {
    logger.error(`[Scheduler] SupportAgent error: ${err.message}`);
  }
};

/**
 * TASK 4 — EmailAgent: Abandoned Cart Recovery (runs 11 AM every day)
 */
const runAbandonedCartRecovery = async () => {
  logger.info('[Scheduler] EmailAgent: Scanning for abandoned cart users...');
  const db = safeGetDb();
  if (!db) return;

  try {
    // Users who registered but made no orders in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
    const allUsers = await db.collection('users').find({
      createdAt: { $gte: sevenDaysAgo },
      email: { $exists: true }
    }).limit(50).toArray().catch(() => []);

    const orderedUserIds = await db.collection('orders').distinct('userId').catch(() => []);
    const abandonedUsers = allUsers.filter(u => !orderedUserIds.includes(u.uid || u._id?.toString()));

    if (abandonedUsers.length > 0) {
      addPendingProposal(
        'email',
        `📧 Cart Recovery: Send Re-Engagement Email to ${abandonedUsers.length} New Users`,
        'marketing_email_broadcast',
        `EmailAgent detected ${abandonedUsers.length} users registered in the last 7 days but made no purchase. Draft a compelling re-engagement email campaign to convert them.`,
        {
          emailSubject: '🎓 Your Learning Journey Awaits — Exclusive Offer Inside!',
          targetUserCount: abandonedUsers.length,
          targetEmails: abandonedUsers.map(u => u.email).filter(Boolean),
          aiResponse: `Dear Student,\n\nWe noticed you haven't explored our courses yet. Get started today with an exclusive 20% discount using code: WELCOME20.\n\nVisit AmitSolutionHub.com to discover 50+ premium projects and courses.\n\nWarm regards,\nThe AmitSolutionHub Team`
        }
      );

      addExecutionLog('email', `Cart Recovery: ${abandonedUsers.length} users identified for re-engagement`, 'success');
      logger.info(`[Scheduler] EmailAgent: Created cart recovery proposal for ${abandonedUsers.length} users.`);
    }
  } catch (err) {
    logger.error(`[Scheduler] EmailAgent cart recovery error: ${err.message}`);
  }
};

/**
 * Core Newsletter Send Function — Fully Real, No Approval Needed
 * @param {'morning'|'evening'} session - determines tone and content focus
 */
const runDailyNewsletter = async (session = 'evening') => {
  const label = session === 'morning' ? '🌅 Morning Newsletter' : '🌙 Evening Newsletter';
  logger.info(`[Scheduler] EmailAgent: Generating ${label}...`);
  const db = safeGetDb();
  if (!db) return;

  try {
    // 1. Get only subscribed emails (filter unsubscribed users)
    const recipients = await getSubscribedEmails(db);
    if (recipients.length === 0) {
      logger.info('[Scheduler] EmailAgent: No subscribed users — skipping newsletter.');
      return;
    }

    // 2. Fetch real live data from MongoDB
    const [courses, projects, activeCoupons] = await Promise.all([
      db.collection('courses').find({ isPublished: true }).sort({ createdAt: -1 }).limit(4).toArray().catch(() => []),
      db.collection('projects').find({ isPublished: true }).sort({ createdAt: -1 }).limit(4).toArray().catch(() => []),
      db.collection('coupons').find({ is_active: true }).limit(2).toArray().catch(() => [])
    ]);

    const courseList = courses.map(c => `• ${c.title} — ₹${c.price}`).join('\n') || '• AI & ML Internship — ₹2999';
    const projectList = projects.map(p => `• ${p.title} — ₹${p.price}`).join('\n') || '• MERN Stack E-commerce — ₹1499';
    const offerLine = activeCoupons.length > 0
      ? `Active Offer: Use code <strong>${activeCoupons[0].code}</strong> for ${activeCoupons[0].discountValue}% OFF!`
      : '';

    // 3. Generate real AI content via Gemini — direct call, no approval
    const { generateText } = require('../aiService');
    const tone = session === 'morning'
      ? 'energetic good morning tone, motivate them to start learning today'
      : 'warm evening recap tone, celebrate their progress and tease tomorrow';

    const aiContent = await generateText({
      contents: [{ role: 'user', parts: [{ text:
        `Write a daily ${session} newsletter email for AmitSolutionHub — India's premium tech learning platform.

Tone: ${tone}
Date: ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}

Real Courses Available:
${courseList}

Real Projects Available:
${projectList}

${offerLine ? `Current Offer: ${offerLine}` : ''}

Write a short, powerful email (150-200 words) with:
1. Personalized greeting (use "Dear Student" or "Hello Learner")
2. One practical coding/career tip relevant to today
3. Highlight one course or project with its real benefit
${offerLine ? '4. Mention the active discount offer' : '4. Encourage visiting amitsolutionhub.com'}
5. Motivational sign-off from Amit Patel (Founder)

Format ONLY with HTML <p> tags. NO markdown. Professional yet warm.`
      }] }],
      temperature: 0.75,
      maxOutputTokens: 600
    }).catch(() => `<p>Dear Student,</p><p>Your learning journey continues today! Explore our latest courses and projects at <a href="https://www.amitsolutionhub.com" style="color:#2563eb;font-weight:700;">AmitSolutionHub.com</a>.</p><p>${offerLine}</p><p>Keep building. Keep growing.</p><p><strong>— Amit Patel, Founder</strong></p>`);

    // 4. Build subject based on session
    const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });
    const subject = session === 'morning'
      ? `🌅 Good Morning! Your Daily Learning Boost — ${dateStr}`
      : `🚀 AmitSolutionHub Evening Update — ${dateStr}`;

    // 5. Send to every subscribed user with personalized unsubscribe link
    let sentCount = 0, failCount = 0;
    for (const email of recipients) {
      const unsubUrl = buildUnsubscribeUrl(email);
      const contentWithOffer = offerLine
        ? `${aiContent}<div style="margin:20px 0;padding:16px;background:#eff6ff;border-left:4px solid #2563eb;border-radius:8px;"><strong>🏷️ Exclusive Offer:</strong> ${offerLine}</div>`
        : aiContent;

      const html = emailTemplate(
        subject,
        contentWithOffer.replace(/\n/g, '<br/>'),
        session === 'morning' ? 'Start Learning Today →' : 'Explore All Courses →',
        'https://www.amitsolutionhub.com/courses',
        session === 'morning' ? '#f59e0b' : '#2563eb',
        session === 'morning' ? '🌅 Morning Edition' : '🌙 Evening Edition',
        unsubUrl
      );
      const result = await sendEmail({ to: email, subject, html });
      if (result.success) { sentCount++; } else { failCount++; }
    }

    addExecutionLog('email', `${label} sent to ${sentCount}/${recipients.length} subscribers (${failCount} failed)`, 'success');
    logger.info(`[Scheduler] EmailAgent: ${label} sent to ${sentCount}/${recipients.length} subscribers.`);

  } catch (err) {
    logger.error(`[Scheduler] EmailAgent newsletter error: ${err.message}`);
  }
};

/**
 * TASK 6 — MarketingAgent: Weekly Marketing Analysis (runs Monday 9 AM)
 */
const runMarketingAnalysis = async () => {
  logger.info('[Scheduler] MarketingAgent: Running weekly marketing analysis...');
  const db = safeGetDb();
  if (!db) return;

  try {
    const projectCount = await db.collection('projects').countDocuments().catch(() => 0);
    const courseCount = await db.collection('courses').countDocuments().catch(() => 0);
    const userCount = await db.collection('users').countDocuments().catch(() => 0);

    await dispatchDepartmentTask({
      department: 'marketing',
      prompt: `Generate a weekly marketing strategy for AmitSolutionHub with ${userCount} users, ${projectCount} source code projects, and ${courseCount} courses. Suggest 3 specific email broadcast topics, 2 new project ideas to list, and 1 promotional campaign for this week.`
    }).catch(() => {});

    logger.info('[Scheduler] MarketingAgent: Weekly marketing analysis completed.');
  } catch (err) {
    logger.error(`[Scheduler] MarketingAgent error: ${err.message}`);
  }
};

/**
 * Start all scheduled tasks
 */
const startScheduledTasks = () => {
  if (schedulerStarted) return;
  schedulerStarted = true;

  // Daily revenue report — 9:00 AM every day
  cron.schedule('0 9 * * *', runFinanceDailyReport, { timezone: 'Asia/Kolkata' });

  // Auto-certificate check — 10:00 AM every day
  cron.schedule('0 10 * * *', runAutoCertificate, { timezone: 'Asia/Kolkata' });

  // Abandoned cart recovery — 11:00 AM every day
  cron.schedule('0 11 * * *', runAbandonedCartRecovery, { timezone: 'Asia/Kolkata' });

  // Support message scan — every 2 hours
  cron.schedule('0 */2 * * *', runSupportScan, { timezone: 'Asia/Kolkata' });

  // 🌅 Morning Newsletter — 7:00 AM every day (direct send, no approval)
  cron.schedule('0 7 * * *', () => runDailyNewsletter('morning'), { timezone: 'Asia/Kolkata' });

  // 🌙 Evening Newsletter — 8:00 PM every day (direct send, no approval)
  cron.schedule('0 20 * * *', () => runDailyNewsletter('evening'), { timezone: 'Asia/Kolkata' });

  // Weekly marketing analysis — Monday 9 AM
  cron.schedule('0 9 * * 1', runMarketingAnalysis, { timezone: 'Asia/Kolkata' });

  logger.info('[Scheduler] ✅ AI Workforce started | Newsletter: 7AM 🌅 + 8PM 🌙 | Finance: 9AM | HR: 10AM | CartRecovery: 11AM | Support: every 2h | Marketing: Mon 9AM');
};

module.exports = {
  startScheduledTasks,
  runFinanceDailyReport,
  runAutoCertificate,
  runAbandonedCartRecovery,
  runSupportScan,
  runDailyNewsletter,
  runMarketingAnalysis
};
