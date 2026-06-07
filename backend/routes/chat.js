const express = require("express");
const router = express.Router();
const { chatWithAI } = require("../services/aiService");
const { logger } = require("../logger");

// Global in-memory chat storage
// Room Schema:
// chatId -> { id, participants, participantInfo: { uid -> { name, email, role } }, messages: [], lastMessage, lastMessageAt, assignedRole, isTakenOver, assignedTo }
const inMemoryChats = new Map();

// Helper to generate a random chat ID
const generateChatId = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CHAT-${result}`;
};

// Create a new in-memory chat room
router.post("/create", (req, res) => {
  const { userId, userName, userEmail, userRole, otherUserId, otherUserName, otherUserEmail, otherUserRole } = req.body;

  if (!userId || !otherUserId) {
    return res.status(400).json({ success: false, message: "userId and otherUserId are required" });
  }

  // Check if a direct chat between these two already exists
  const existingChat = Array.from(inMemoryChats.values()).find(
    (c) =>
      !c.isGroup &&
      c.participants.includes(userId) &&
      c.participants.includes(otherUserId)
  );

  if (existingChat) {
    return res.json({ success: true, chatId: existingChat.id, chat: existingChat });
  }

  const chatId = generateChatId();
  
  const currentRole = String(userRole || "Customer").toLowerCase();
  const otherRole = String(otherUserRole || "Support").toLowerCase();
  
  const chat = {
    id: chatId,
    participants: [userId, otherUserId],
    participantInfo: {
      [userId]: { name: userName || "User", email: userEmail || "", role: userRole || "Customer" },
      [otherUserId]: { name: otherUserName || "Support", email: otherUserEmail || "", role: otherUserRole || "Support" },
    },
    messages: [],
    lastMessage: "",
    lastMessageAt: new Date().toISOString(),
    assignedRole: "Support",
    isTakenOver: false,
    assignedTo: null,
  };

  // AUTOMATIC WELCOME MESSAGE
  if (currentRole === "customer" && (otherRole === "admin" || otherRole === "employee" || otherRole === "support")) {
    const welcomeText = `Hello! 👋 Thanks for reaching out. A member of our support team will be with you shortly. How can we help you today?`;
    const welcomeMessage = {
      id: `msg_welcome_${Date.now()}`,
      senderId: otherUserId,
      senderName: otherUserName || "Support",
      senderEmail: otherUserEmail || "",
      text: welcomeText,
      timestamp: new Date().toISOString(),
      status: "sent",
    };
    chat.messages.push(welcomeMessage);
    chat.lastMessage = welcomeText;
    chat.lastMessageAt = welcomeMessage.timestamp;
  }

  inMemoryChats.set(chatId, chat);
  logger.info(`[MemoryChat] Created chat ${chatId} between ${userEmail} and ${otherUserEmail}`);

  res.json({ success: true, chatId, chat });
});

// Create a new in-memory group chat room
router.post("/create-group", (req, res) => {
  const { participants, participantInfo, groupName, createdBy } = req.body;

  if (!participants || !Array.isArray(participants) || participants.length === 0) {
    return res.status(400).json({ success: false, message: "participants array is required" });
  }

  const chatId = generateChatId();
  const chat = {
    id: chatId,
    participants,
    participantInfo: participantInfo || {},
    groupName: groupName || "New Team Group",
    isGroup: true,
    messages: [],
    lastMessage: "Group created",
    lastMessageAt: new Date().toISOString(),
    assignedRole: "Support",
    isTakenOver: true,
    assignedTo: null,
    createdBy,
  };

  inMemoryChats.set(chatId, chat);
  logger.info(`[MemoryChat] Created group chat ${chatId} with ${participants.length} participants`);

  res.json({ success: true, chatId, chat });
});

// Send a message
router.post("/send", async (req, res) => {
  const { chatId, senderId, senderName, senderEmail, text, imageUrl } = req.body;

  if (!chatId || !senderId) {
    return res.status(400).json({ success: false, message: "chatId and senderId are required" });
  }

  const chat = inMemoryChats.get(chatId);
  if (!chat) {
    return res.status(404).json({ success: false, message: "Chat not found" });
  }

  const message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    senderId,
    senderName: senderName || "User",
    senderEmail: senderEmail || "",
    text: text || "",
    imageUrl: imageUrl || null,
    timestamp: new Date().toISOString(),
    status: "sent",
    ...req.body, // Include custom fields like type and callUrl
  };

  chat.messages.push(message);
  chat.lastMessage = text || (imageUrl ? "📷 Image" : "");
  chat.lastMessageAt = message.timestamp;

  res.json({ success: true, message });

  // AI Intent classification and response logic
  // Trigger only if sent by the customer and NOT yet taken over by an employee
  const senderInfo = chat.participantInfo[senderId] || {};
  const isCustomer = String(senderInfo.role || "").toLowerCase() === "customer";
  if (isCustomer && !chat.isTakenOver) {
    try {
      // 1. If it's the first client message, classify intent using AI to assign the correct role
      const userMsgs = chat.messages.filter(m => m.senderId === senderId);
      if (userMsgs.length === 1) {
        const classificationPrompt = `You are an automated support router for SolutionHub. Your task is to analyze the user inquiry and output the exact department role that should handle it.
Select ONLY one of the following exact strings:
- "HR & Recruitment Executive": if the query is about job openings, hiring, internships joining process, attendance, CV uploads, interviews, or hr portal.
- "Business Development Executive (BDE)": if it is about partnerships, college contracts, sponsorships, bulk sales, collaborations, or client lead generation.
- "Technical Support": if it is about code bugs, project setup errors, installation problems, downloads, databases, git errors, or server issues.
- "Student Support": if it is about course pricing, syllabus details, WhatsApp support, webinars, general training queries, or refund queries.

User Query: "${text}"

Respond with ONLY the selected role name string in quotation marks. Do not write explanations.`;

        const classifiedRole = await chatWithAI([{ role: "user", content: classificationPrompt }]);
        const cleanRole = classifiedRole.replace(/["']/g, "").trim();
        const validRoles = [
          "HR & Recruitment Executive",
          "Business Development Executive (BDE)",
          "Technical Support",
          "Student Support"
        ];
        
        const matched = validRoles.find(r => r.toLowerCase() === cleanRole.toLowerCase()) || validRoles.find(r => cleanRole.toLowerCase().includes(r.toLowerCase()));
        if (matched) {
          chat.assignedRole = matched;
          logger.info(`[MemoryChat] Classifying chat ${chatId} intent. Assigned department: ${matched}`);
        }
      }

      // 2. Fallback AI response
      const recentHistory = chat.messages.slice(-8).map(m => ({
        role: m.senderId === senderId ? "user" : "assistant",
        content: m.text || "",
      }));

      // Let AI reply in real-time
      const aiReplyText = await chatWithAI(recentHistory);
      const aiMessage = {
        id: `msg_ai_${Date.now()}`,
        senderId: "solutionhub-ai",
        senderName: "SolutionHub AI",
        senderEmail: "support@amitsolutionhub.com",
        text: aiReplyText,
        imageUrl: null,
        timestamp: new Date().toISOString(),
        status: "sent",
        type: "ai-assistant",
        generatedByAi: true,
      };

      chat.messages.push(aiMessage);
      chat.lastMessage = aiReplyText;
      chat.lastMessageAt = aiMessage.timestamp;
      logger.info(`[MemoryChat] AI auto-replied in chat ${chatId}`);
    } catch (err) {
      logger.error("[MemoryChat] AI Routing/Response error:", err);
    }
  }
});

// Get messages in a room
router.get("/messages", (req, res) => {
  const { chatId } = req.query;

  if (!chatId) {
    return res.status(400).json({ success: false, message: "chatId is required" });
  }

  const chat = inMemoryChats.get(chatId);
  if (!chat) {
    return res.status(404).json({ success: false, message: "Chat not found" });
  }

  res.json({ success: true, messages: chat.messages });
});

// Mark messages as read
router.post("/read", (req, res) => {
  const { chatId, readerId } = req.body;
  const chat = inMemoryChats.get(chatId);
  if (chat) {
    chat.messages.forEach((msg) => {
      if (msg.senderId !== readerId) {
        msg.status = "read";
      }
    });
  }
  res.json({ success: true });
});

// List all chat rooms (for employee dashboard support queue)
router.get("/rooms", (req, res) => {
  const { role, userId } = req.query;
  let rooms = Array.from(inMemoryChats.values());

  // Employees can filter by their assigned role
  if (role) {
    rooms = rooms.filter((r) => r.assignedRole === role || r.assignedTo === role);
  }

  // Map to exclude full messages list for bandwidth saving
  const roomSummaries = rooms.map((r) => {
    let unreadCount = 0;
    if (userId) {
      unreadCount = r.messages.filter(msg => msg.senderId !== userId && msg.status !== 'read').length;
    }
    return {
      id: r.id,
      participants: r.participants,
      participantInfo: r.participantInfo,
      lastMessage: r.lastMessage,
      lastMessageAt: r.lastMessageAt,
      assignedRole: r.assignedRole,
      isTakenOver: r.isTakenOver,
      assignedTo: r.assignedTo,
      unreadCount,
    };
  });

  res.json({ success: true, rooms: roomSummaries });
});

// Takeover a chat room
router.post("/takeover", (req, res) => {
  const { chatId, employeeId, employeeName } = req.body;

  const chat = inMemoryChats.get(chatId);
  if (!chat) {
    return res.status(404).json({ success: false, message: "Chat not found" });
  }

  chat.isTakenOver = true;
  chat.assignedTo = employeeName;

  logger.info(`[MemoryChat] Employee ${employeeName} took over chat ${chatId}`);

  res.json({ success: true, chat });
});

// Clear/Reset a chat room
router.post("/clear", (req, res) => {
  const { chatId } = req.body;
  const chat = inMemoryChats.get(chatId);
  if (chat) {
    chat.messages = [];
    chat.lastMessage = "Chat cleared";
    chat.lastMessageAt = new Date().toISOString();
  }
  res.json({ success: true });
});

// Delete specific messages in a chat room
router.post("/delete-messages", (req, res) => {
  const { chatId, messageIds } = req.body;
  const chat = inMemoryChats.get(chatId);
  if (chat && Array.isArray(messageIds)) {
    chat.messages = chat.messages.filter(msg => !messageIds.includes(msg.id));
    
    // Update last message preview
    let lastMsg = "Chat cleared";
    if (chat.messages.length > 0) {
      const last = chat.messages[chat.messages.length - 1];
      lastMsg = last.text || (last.imageUrl ? "📷 Image" : "Message deleted");
    }
    chat.lastMessage = lastMsg;
    chat.lastMessageAt = new Date().toISOString();
  }
  res.json({ success: true });
});

module.exports = router;
