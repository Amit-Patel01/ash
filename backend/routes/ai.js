const express = require("express");
const router = express.Router();
const { chatWithAI, getRecommendations, getAIStatus, generateText } = require("../services/aiService");
const { optionalAuth } = require("../middlewares/authMiddleware");
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
router.get("/department/proposals", async (req, res) => {
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
router.post("/department/proposals/resolve", optionalAuth, async (req, res) => {
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

router.post("/department/proposals/clear", optionalAuth, (req, res) => {
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
 */
router.post("/department/email/broadcast", optionalAuth, async (req, res) => {
  const { subject, body } = req.body;
  if (!subject || !body) {
    return res.status(400).json({ success: false, message: "subject and body are required" });
  }

  try {
    const { getDb } = require("../utils/mongo");
    let db = null;
    try { db = getDb(); } catch (e) { db = null; }

    let recipients = [];

    if (db) {
      const users = await db.collection("users").find({ email: { $exists: true } }, { projection: { email: 1 } }).toArray().catch(() => []);
      recipients = users.map(u => u.email).filter(Boolean);
    }

    if (recipients.length === 0) {
      recipients = [process.env.ADMIN_EMAIL || "admin@amitsolutionhub.com"];
    }

    const { sendEmail, emailTemplate } = require("../services/emailService");
    const formattedHtml = emailTemplate(subject, body.replace(/\n/g, '<br/>'), "Visit Amit Solution Hub", "https://www.amitsolutionhub.com");

    let sentCount = 0;
    for (const email of recipients) {
      await sendEmail({
        to: email,
        subject,
        html: formattedHtml
      }).catch(err => logger.warn(`Broadcast fail for ${email}: ${err.message}`));
      sentCount++;
    }

    const { addExecutionLog } = require("../services/aiAgents/departmentConfig");
    addExecutionLog('email', `Dispatched Email Broadcast "${subject}" to ${sentCount} recipient(s)`, 'success');

    res.json({
      success: true,
      message: `Email Broadcast successfully dispatched to ${sentCount} recipient(s)!`,
      sentCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});





/**
 * GET /api/ai/department/config
 * Fetch configurations & metrics of all AI Departments
 */
router.get("/department/config", (req, res) => {
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
router.post("/department/config", optionalAuth, (req, res) => {
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
router.get("/department/logs", (req, res) => {
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

router.post("/department/dispatch", optionalAuth, dispatchRateLimiter, async (req, res) => {
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

module.exports = router;

