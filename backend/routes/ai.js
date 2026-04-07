const express = require("express");
const router = express.Router();
const { chatWithAI, getRecommendations } = require("../services/aiService");
const { optionalAuth } = require("../middlewares/authMiddleware");
const { logger } = require("../logger");

/**
 * POST /api/ai/chat
 * Body: { messages: [{ role: 'user'|'assistant', content: string }] }
 */
router.post("/chat", optionalAuth, async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ success: false, message: "messages array is required" });
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
