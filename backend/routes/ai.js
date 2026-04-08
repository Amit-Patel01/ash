const express = require("express");
const router = express.Router();
const { chatWithAI, getRecommendations, getAIStatus } = require("../services/aiService");
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

module.exports = router;
