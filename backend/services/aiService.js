const { GoogleGenerativeAI } = require("@google/generative-ai");
const { logger } = require("../logger");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  logger.warn("⚠️  GEMINI_API_KEY not set. AI features will not work.");
}

let genAI = null;
let model = null;

if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
}

const SYSTEM_CONTEXT = `You are a helpful assistant for Amit Solution Hub — a professional platform offering:
1. Source Code Marketplace: Ready-to-deploy software projects
2. Trading Mentorship: Professional trading courses and live sessions
3. Enterprise Admin: Business management for clients and employees

Be concise, professional, and friendly. Help users with:
- Finding the right project or course
- Understanding pricing and features
- Technical support guidance
- Navigation and account help

If asked something outside your scope, politely redirect to support@amitsolutionhub.com.
Always respond in the same language the user uses.`;

/**
 * Chat with Gemini AI
 * @param {Array} messages - Array of { role: 'user'|'assistant', content: string }
 * @returns {string} Assistant reply
 */
const chatWithAI = async (messages) => {
  if (!model) {
    return "AI features are currently unavailable. Please contact support@amitsolutionhub.com for assistance.";
  }

  try {
    // Build chat history from messages (excluding last user message)
    const history = [];
    const allMessages = [
      { role: "user", parts: [{ text: SYSTEM_CONTEXT }] },
      { role: "model", parts: [{ text: "Understood! I'm ready to help Amit Solution Hub users." }] },
      ...messages.slice(0, -1).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    ];

    const chat = model.startChat({ history: allMessages });
    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const response = result.response.text();

    logger.info(`[AI] Chat response generated (${response.length} chars)`);
    return response;
  } catch (err) {
    logger.error(`[AI] Chat error: ${err.message}`);
    throw err;
  }
};

/**
 * Get course/project recommendations for a user
 * @param {Object} userProfile - { interests, purchaseHistory, role }
 * @returns {string} Recommendation text
 */
const getRecommendations = async (userProfile) => {
  if (!model) {
    return "Recommendations unavailable. Please browse our projects at amitsolutionhub.com/projects.";
  }

  const prompt = `Based on this user profile, recommend 2-3 Amit Solution Hub products:
Profile: ${JSON.stringify(userProfile)}

Available categories:
- Source Code Projects: E-commerce, Admin Panels, Trading Tools, Portfolio Sites, Hospital Management
- Trading Courses: Basic, Advanced, Pro Mentorship
- Services: Web Development, Technical Support, Editing

Respond with a concise, bulleted list of specific recommendations with brief reasons. Keep it under 100 words.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    logger.error(`[AI] Recommendations error: ${err.message}`);
    throw err;
  }
};

module.exports = { chatWithAI, getRecommendations };
