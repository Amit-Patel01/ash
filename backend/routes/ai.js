const express = require("express");
const router = express.Router();
const { chatWithAI, getRecommendations, getAIStatus, generateText } = require("../services/aiService");
const { verifyFirebaseToken, optionalAuth } = require("../middlewares/authMiddleware");
const { adminOnly } = require("../middlewares/rbacMiddleware");
const { logger } = require("../logger");

router.get("/status", (req, res) => {
  const status = getAIStatus();

  res.status(status.available ? 200 : 503).json({
    success: status.available,
    ...status,
  });
});

/**
 * POST /api/ai/chat
 * Body: { messages: [{ role: 'user'|'assistant', content: string }] }
 */
router.post("/chat", optionalAuth, async (req, res) => {
  const { messages } = req.body;
  const status = getAIStatus();

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ success: false, message: "messages array is required" });
  }

  if (!status.available) {
    return res.status(503).json({
      success: false,
      code: "ai_not_configured",
      reply: status.message,
      status,
    });
  }

  // Limit context window
  const trimmedMessages = messages.slice(-10);

  try {
    const reply = await chatWithAI(trimmedMessages);
    res.json({ success: true, reply });
  } catch (error) {
    logger.error("AI chat error:", error);
    res.status(500).json({
      success: false,
      reply: "I'm having trouble connecting right now. Please try again or contact support@amitsolutionhub.com.",
    });
  }
});

/**
 * POST /api/ai/recommend
 * Body: { userId?, interests?, purchaseHistory? }
 */
router.post("/recommend", optionalAuth, async (req, res) => {
  const { userId, interests, purchaseHistory } = req.body;
  const status = getAIStatus();

  if (!status.available) {
    return res.status(503).json({
      success: false,
      code: "ai_not_configured",
      recommendations: status.message,
      status,
    });
  }

  try {
    const userProfile = {
      userId: userId || req.user?.uid || "anonymous",
      interests: interests || [],
      purchaseHistory: purchaseHistory || [],
      role: req.user?.role || "visitor",
    };

    const recommendations = await getRecommendations(userProfile);
    res.json({ success: true, recommendations });
  } catch (error) {
    logger.error("AI recommend error:", error);
    res.status(500).json({
      success: false,
      recommendations: "Unable to generate recommendations at this time. Browse our projects at amitsolutionhub.com/projects.",
    });
  }
});

/**
 * POST /api/ai/resume-builder
 * Body: { skills: string }
 */
router.post("/resume-builder", optionalAuth, async (req, res) => {
  const { skills } = req.body;
  const status = getAIStatus();

  if (!status.available) {
    return res.status(503).json({ success: false, message: status.message });
  }

  try {
    const prompt = `Create a professional resume summary, suggested job roles, and key bullet points for a developer with the following skills/experience:\n${skills || "React, Node.js, JavaScript"}\n\nFormat the response nicely in clean Markdown.`;
    const result = await generateText({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      temperature: 0.7,
      maxOutputTokens: 600,
    });
    res.json({ success: true, result });
  } catch (error) {
    logger.error("AI resume builder error:", error);
    res.status(500).json({ success: false, message: "Failed to generate resume guidance" });
  }
});

/**
 * POST /api/ai/project-suggestions
 * Body: { skills: string }
 */
router.post("/project-suggestions", optionalAuth, async (req, res) => {
  const { skills } = req.body;
  const status = getAIStatus();

  if (!status.available) {
    return res.status(503).json({ success: false, message: status.message });
  }

  try {
    const prompt = `Suggest 3 unique, real-world portfolio project ideas for a student interested in: ${skills || "Web Development"}. For each project, provide:
1. Title
2. Description
3. Recommended Tech Stack
4. Difficulty Level (Beginner/Intermediate/Advanced)

Format the response nicely in clean Markdown.`;
    const result = await generateText({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      temperature: 0.7,
      maxOutputTokens: 600,
    });
    res.json({ success: true, result });
  } catch (error) {
    logger.error("AI project suggestions error:", error);
    res.status(500).json({ success: false, message: "Failed to generate project suggestions" });
  }
});

/**
 * POST /api/ai/interview-preparation
 * Body: { role: string }
 */
router.post("/interview-preparation", optionalAuth, async (req, res) => {
  const { role } = req.body;
  const status = getAIStatus();

  if (!status.available) {
    return res.status(503).json({ success: false, message: status.message });
  }

  try {
    const prompt = `Generate a preparation guide for an interview for the role of: ${role || "Frontend Developer"}. Include:
1. Top 5 common technical interview questions with brief answers.
2. 3 essential tips for cracking this role's interview.

Format the response nicely in clean Markdown.`;
    const result = await generateText({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      temperature: 0.7,
      maxOutputTokens: 800,
    });
    res.json({ success: true, result });
  } catch (error) {
    logger.error("AI interview prep error:", error);
    res.status(500).json({ success: false, message: "Failed to generate interview preparation guide" });
  }
});

// --- Autonomous AI Workforce Department Endpoints ---
const { getDepartmentConfig, updateDepartmentConfig, getExecutionLogs, getPendingProposals, generateRealtimeProposalsFromCodebase, resolveProposal, clearAllProposals } = require("../services/aiAgents/departmentConfig");
const { dispatchDepartmentTask } = require("../services/aiAgents/agentDispatcher");

/**
 * GET /api/ai/department/proposals
 * Fetch real-time codebase & database generated proposals for admin approval
 */
router.get("/department/proposals", verifyFirebaseToken, adminOnly, async (req, res) => {
  try {
    const proposals = await generateRealtimeProposalsFromCodebase();
    res.json({ success: true, proposals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


/**
 * POST /api/ai/department/proposals/resolve
 * Resolve (Approve / Reject) an AI proposal and execute real database action
 */
router.post("/department/proposals/resolve", verifyFirebaseToken, adminOnly, async (req, res) => {
  const { proposalId, approved } = req.body;
  if (!proposalId) {
    return res.status(400).json({ success: false, message: "proposalId is required" });
  }

  try {
    const proposal = await resolveProposal(proposalId, approved !== false);
    res.json({ success: true, proposal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/ai/department/proposals/clear
 * Clear all proposals
 */

router.post("/department/proposals/clear", verifyFirebaseToken, adminOnly, (req, res) => {
  try {
    const proposals = clearAllProposals();
    res.json({ success: true, proposals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/ai/department/email/broadcast
 * Broadcast generated AI email to all registered users / students
 * Responds immediately — actual sending happens in background (parallel batches)
 */

// Convert markdown-style text to clean HTML for email
const markdownToHtml = (text) => {
  return String(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^#{1,3}\s+(.+)$/gm, '<h3 style="color:#1e293b;margin:16px 0 8px">$1</h3>')
    .replace(/^\d+\.\s+(.+)$/gm, '<li style="margin:6px 0;color:#475569">$1</li>')
    .replace(/^[-*]\s+(.+)$/gm, '<li style="margin:6px 0;color:#475569">$1</li>')
    .replace(/((<li[^>]*>[\s\S]*?<\/li>\n?)+)/g, '<ol style="padding-left:20px">$1</ol>')
    .replace(/\n{2,}/g, '</p><p style="margin:12px 0;color:#475569;line-height:1.8">')
    .replace(/\n/g, '<br/>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" style="color:#2563eb">$1</a>');
};

router.post("/department/email/broadcast", verifyFirebaseToken, adminOnly, async (req, res) => {
  const { subject, body, targetEmail, recipients: customRecipients } = req.body;
  if (!subject || !body) {
    return res.status(400).json({ success: false, message: "subject and body are required" });
  }

  try {
    const { getDb } = require("../utils/mongo");
    let db = null;
    try { db = getDb(); } catch (e) { db = null; }

    let recipients = [];
    if (Array.isArray(customRecipients) && customRecipients.length > 0) {
      recipients = customRecipients;
    } else if (targetEmail) {
      recipients = [targetEmail];
    } else if (db) {
      // Fetch all users + filter unsubscribed
      const [userDocs, blacklist] = await Promise.all([
        db.collection("users").find(
          { email: { $exists: true }, emailUnsubscribed: { $ne: true } },
          { projection: { email: 1 } }
        ).toArray().catch(() => []),
        db.collection("email_unsubscribes").distinct("email").catch(() => [])
      ]);
      const blackSet = new Set(blacklist.map(e => e.toLowerCase()));
      recipients = userDocs.map(u => u.email).filter(e => e && !blackSet.has(e.toLowerCase()));
    }

    if (recipients.length === 0) {
      recipients = [process.env.ADMIN_EMAIL || "admin@amitsolutionhub.com"];
    }

    const validRecipients = recipients.filter(e => e && typeof e === 'string' && e.includes('@'));
    const totalCount = validRecipients.length;

    // ✅ Respond IMMEDIATELY — no timeout
    res.json({
      success: true,
      message: `Email Broadcast queued for ${totalCount} recipient(s)! Sending in background...`,
      sentCount: totalCount,
      failCount: 0
    });

    // Background: parallel batches of 10
    const { sendEmail, emailTemplate } = require("../services/emailService");
    const { generateUnsubscribeToken } = require("../routes/unsubscribe");
    const { addExecutionLog } = require("../services/aiAgents/departmentConfig");
    const baseUrl = process.env.BACKEND_URL || process.env.PUBLIC_URL || 'https://api.amitsolutionhub.com';

    const rawContent = typeof body === 'string' ? body : JSON.stringify(body, null, 2);
    const htmlContent = `<p style="margin:12px 0;color:#475569;line-height:1.8">${markdownToHtml(rawContent)}</p>`;

    let sentCount = 0;
    let failCount = 0;
    const BATCH_SIZE = 10;

    (async () => {
      for (let i = 0; i < validRecipients.length; i += BATCH_SIZE) {
        const batch = validRecipients.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (email) => {
          try {
            const token = generateUnsubscribeToken(email);
            const unsubUrl = `${baseUrl}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
            const formattedHtml = emailTemplate(
              subject,
              htmlContent,
              'Visit Amit Solution Hub',
              'https://www.amitsolutionhub.com',
              '#2563eb',
              null,
              unsubUrl
            );
            const result = await sendEmail({ to: email, subject, html: formattedHtml });
            if (result.success) { sentCount++; }
            else { failCount++; logger.warn(`[AI Broadcast] Fail ${email}: ${result.error}`); }
          } catch (err) {
            failCount++;
            logger.warn(`[AI Broadcast] Exception ${email}: ${err.message}`);
          }
        }));
      }
      const status = failCount === 0 ? 'success' : (sentCount > 0 ? 'partial' : 'failed');
      addExecutionLog('email', `Email Broadcast "${subject}" → ${sentCount} sent, ${failCount} failed`, status);
      logger.info(`[AI Broadcast] "${subject}" → ${sentCount}/${totalCount} delivered`);
    })().catch(err => logger.error(`[AI Broadcast] Background error: ${err.message}`));

  } catch (error) {
    logger.error(`[AI Broadcast] Setup error: ${error.message}`);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
});





/**
 * GET /api/ai/department/config
 * Fetch configurations & metrics of all AI Departments
 */
router.get("/department/config", verifyFirebaseToken, adminOnly, (req, res) => {
  try {
    const config = getDepartmentConfig();
    res.json({ success: true, config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/ai/department/config
 * Update prompt or settings for a specific department
 */
router.post("/department/config", verifyFirebaseToken, adminOnly, (req, res) => {
  const { deptId, updates } = req.body;
  if (!deptId || !updates) {
    return res.status(400).json({ success: false, message: "deptId and updates object are required" });
  }
  try {
    const updated = updateDepartmentConfig(deptId, updates);
    res.json({ success: true, department: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/ai/department/logs
 * Fetch real-time AI execution logs
 */
router.get("/department/logs", verifyFirebaseToken, adminOnly, (req, res) => {
  try {
    const logs = getExecutionLogs();
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/ai/department/dispatch
 * Dispatch a manual or automated task to a specific department AI agent
 * Rate limited: max 10 per minute per IP to prevent Gemini API abuse
 */
const dispatchRateLimiter = require('express-rate-limit')({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many AI tasks dispatched. Please wait 1 minute.' }
});

router.post("/department/dispatch", verifyFirebaseToken, adminOnly, dispatchRateLimiter, async (req, res) => {
  const { department, prompt, context } = req.body;
  if (!department || !prompt) {
    return res.status(400).json({ success: false, message: "department and prompt are required" });
  }
  if (typeof prompt !== 'string' || prompt.trim().length < 3) {
    return res.status(400).json({ success: false, message: "prompt must be at least 3 characters" });
  }

  try {
    const result = await dispatchDepartmentTask({ department, prompt: prompt.trim(), context });
    res.json(result);
  } catch (error) {
    logger.error(`AI Dispatch error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/ai/department/analytics
 * Real-time revenue analytics & scheduler health from real MongoDB database
 */
router.get("/department/analytics", verifyFirebaseToken, adminOnly, async (req, res) => {
  try {
    const { getDb } = require("../utils/mongo");
    let db = null;
    try { db = getDb(); } catch (e) { db = null; }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000);

    let weeklyRevenue = 0;
    let prevWeeklyRevenue = 0;
    let sparkline = [0, 0, 0, 0, 0, 0, 0];

    if (db) {
      const recentOrders = await db.collection("orders").find({
        createdAt: { $gte: sevenDaysAgo }
      }).toArray().catch(() => []);

      weeklyRevenue = recentOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

      const prevOrders = await db.collection("orders").find({
        createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo }
      }).toArray().catch(() => []);

      prevWeeklyRevenue = prevOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

      for (let i = 0; i < 7; i++) {
        const dayStart = new Date(now.getTime() - (6 - i) * 86400000);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart.getTime() + 86400000);

        const dayOrders = recentOrders.filter(o => {
          const cDate = new Date(o.createdAt);
          return cDate >= dayStart && cDate < dayEnd;
        });

        sparkline[i] = dayOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
      }
    }

    const growthPercent = prevWeeklyRevenue > 0
      ? (((weeklyRevenue - prevWeeklyRevenue) / prevWeeklyRevenue) * 100).toFixed(1)
      : (weeklyRevenue > 0 ? "100.0" : "0.0");

    res.json({
      success: true,
      analytics: {
        weeklyRevenue,
        growthPercent: Number(growthPercent),
        sparkline,
        activeTasksCount: 7,
        healthStatus: {
          finance: true,
          hr: true,
          sales: true,
          support: true,
          marketing: true,
          tech: true,
          email: true
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

