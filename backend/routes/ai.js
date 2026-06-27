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

module.exports = router;
