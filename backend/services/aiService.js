const https = require("https");
const { logger } = require("../logger");

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_API_VERSION = process.env.GEMINI_API_VERSION || "v1beta";
const GEMINI_API_BASE = process.env.GEMINI_API_BASE || "https://generativelanguage.googleapis.com";
const MAX_HISTORY_MESSAGES = 10;
const MAX_MESSAGE_CHARS = 4000;

const AI_KEY_SOURCES = [
  ["GEMINI_API_KEY", process.env.GEMINI_API_KEY],
  ["GOOGLE_API_KEY", process.env.GOOGLE_API_KEY],
  ["GOOGLE_GENERATIVE_AI_API_KEY", process.env.GOOGLE_GENERATIVE_AI_API_KEY],
  ["GOOGLE_GENAI_API_KEY", process.env.GOOGLE_GENAI_API_KEY],
];

const keySourceEntry = AI_KEY_SOURCES.find(([, value]) => Boolean(value));
const GEMINI_API_KEY = keySourceEntry?.[1] || "";
const GEMINI_KEY_SOURCE = keySourceEntry?.[0] || null;

if (!GEMINI_API_KEY) {
  logger.warn("⚠️  Gemini API key not set. AI features will not work.");
} else {
  logger.info(`[AI] Gemini configured with model ${GEMINI_MODEL} using ${GEMINI_KEY_SOURCE}.`);
}

const SYSTEM_CONTEXT = `You are a helpful assistant for Amit Solution Hub — a professional technology platform founded by Amit Patel.

COMPANY LEADERSHIP:
- Founder, CEO & Head: Amit Patel
- Company: Amit Solution Hub Technology Pvt Ltd
- Contact: support@amitsolutionhub.com
- Website: amitsolutionhub.com

PLATFORM OFFERINGS:
1. Source Code Marketplace: Ready-to-deploy software projects
2. Trading Mentorship: Professional trading courses and live sessions
3. LMS & Internship Programs: AICTE-approved internship with certificates
4. Enterprise Admin: Business management for clients and employees
5. Technical Support & Web Services

Be concise, professional, and friendly. Help users with:
- Finding the right project or course
- Understanding pricing and features
- Technical support guidance
- Navigation and account help
- Information about the company and its leadership

If asked about the founder, CEO, head, or owner — always answer: Amit Patel is the Founder, CEO & Head of Amit Solution Hub.
If asked something outside your scope, politely redirect to support@amitsolutionhub.com.
Always respond in the same language the user uses.`;

const AI_UNAVAILABLE_MESSAGE =
  "AI assistant is currently unavailable. Please try again later or contact support@amitsolutionhub.com.";

const getAIStatus = () => ({
  available: Boolean(GEMINI_API_KEY),
  provider: "gemini",
  model: GEMINI_MODEL,
  keySource: GEMINI_KEY_SOURCE,
  message: GEMINI_API_KEY
    ? `Gemini is ready on ${GEMINI_MODEL}.`
    : "Gemini is not configured on the backend. Set GEMINI_API_KEY before using the chatbot.",
});

const normalizeMessage = (message) => {
  if (!message || typeof message.content !== "string") return null;

  const role = message.role === "assistant" ? "model" : "user";
  const content = message.content.trim().slice(0, MAX_MESSAGE_CHARS);

  if (!content) return null;

  return { role, parts: [{ text: content }] };
};

const buildChatContents = (messages = []) => {
  const normalized = messages
    .map(normalizeMessage)
    .filter(Boolean)
    .slice(-MAX_HISTORY_MESSAGES);

  while (normalized.length && normalized[0].role !== "user") {
    normalized.shift();
  }

  return normalized;
};

const extractTextFromResponse = (payload) => {
  const candidate = payload?.candidates?.find((item) => item?.content?.parts?.length);
  const text = candidate?.content?.parts
    ?.map((part) => (typeof part?.text === "string" ? part.text : ""))
    .filter(Boolean)
    .join("\n")
    .trim();

  return text || "";
};

const postJson = (url, payload) =>
  new Promise((resolve, reject) => {
    const requestBody = JSON.stringify(payload);
    const requestUrl = new URL(url);

    const req = https.request(
      {
        protocol: requestUrl.protocol,
        hostname: requestUrl.hostname,
        port: requestUrl.port || 443,
        path: `${requestUrl.pathname}${requestUrl.search}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(requestBody),
          "x-goog-api-key": GEMINI_API_KEY,
        },
      },
      (res) => {
        let raw = "";

        res.on("data", (chunk) => {
          raw += chunk;
        });

        res.on("end", () => {
          let parsed = {};

          try {
            parsed = raw ? JSON.parse(raw) : {};
          } catch (error) {
            reject(new Error(`Gemini returned invalid JSON (${res.statusCode || "unknown"})`));
            return;
          }

          if ((res.statusCode || 500) >= 200 && (res.statusCode || 500) < 300) {
            resolve(parsed);
            return;
          }

          reject(new Error(parsed?.error?.message || `Gemini request failed (${res.statusCode || 500})`));
        });
      }
    );

    req.on("error", reject);
    req.write(requestBody);
    req.end();
  });

const generateText = async ({
  contents,
  systemInstruction = SYSTEM_CONTEXT,
  temperature = 0.7,
  topP = 0.9,
  maxOutputTokens = 700,
  thinkingBudget = 0,
}) => {
  if (!GEMINI_API_KEY) {
    return AI_UNAVAILABLE_MESSAGE;
  }

  const payload = {
    system_instruction: {
      parts: [{ text: systemInstruction }],
    },
    contents,
    generationConfig: {
      temperature,
      topP,
      maxOutputTokens,
      responseMimeType: "text/plain",
      thinkingConfig: {
        thinkingBudget,
      },
    },
  };

  const response = await postJson(
    `${GEMINI_API_BASE}/${GEMINI_API_VERSION}/models/${GEMINI_MODEL}:generateContent`,
    payload
  );

  return extractTextFromResponse(response) || AI_UNAVAILABLE_MESSAGE;
};

/**
 * Chat with Gemini AI
 * @param {Array} messages - Array of { role: 'user'|'assistant', content: string }
 * @returns {string} Assistant reply
 */
const chatWithAI = async (messages) => {
  if (!GEMINI_API_KEY) {
    return AI_UNAVAILABLE_MESSAGE;
  }

  try {
    const contents = buildChatContents(messages);

    if (!contents.length) {
      return "Please send your question and I will help you.";
    }

    const response = await generateText({
      contents,
      temperature: 0.65,
      maxOutputTokens: 600,
      thinkingBudget: 0,
    });

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
  if (!GEMINI_API_KEY) {
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
    return await generateText({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      temperature: 0.5,
      maxOutputTokens: 250,
      thinkingBudget: 0,
    });
  } catch (err) {
    logger.error(`[AI] Recommendations error: ${err.message}`);
    throw err;
  }
};

module.exports = { chatWithAI, getRecommendations, getAIStatus, generateText };
