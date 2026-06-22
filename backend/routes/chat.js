const express = require("express");
const router = express.Router();
const { chatWithAI } = require("../services/aiService");
const { logger } = require("../logger");
const { getDb } = require("../utils/mongo");

// Helper to generate a random chat ID
const generateChatId = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CHAT-${result}`;
};

// Create a new chat room
router.post("/create", async (req, res) => {
  try {
    const { userId, userName, userEmail, userRole, otherUserId, otherUserName, otherUserEmail, otherUserRole } = req.body;

    if (!userId || !otherUserId) {
      return res.status(400).json({ success: false, message: "userId and otherUserId are required" });
    }

    // Check if a direct chat between these two already exists
    const chatDocs = await getDb().collection("chats")
      .find({ isGroup: false, participants: userId })
      .toArray();

    let existingChat = chatDocs
      .map(d => ({ id: d._id.toString(), ...d }))
      .find(c => c.participants.includes(otherUserId));

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
      lastMessage: "",
      lastMessageAt: new Date().toISOString(),
      assignedRole: "Support",
      isTakenOver: false,
      assignedTo: null,
      isGroup: false,
      createdAt: new Date().toISOString(),
    };

    await getDb().collection("chats").insertOne({ _id: chatId, ...chat });

    // AUTOMATIC WELCOME MESSAGE
    if (currentRole === "customer" && (otherRole === "admin" || otherRole === "employee" || otherRole === "support")) {
      const welcomeText = `Hello! 👋 Thanks for reaching out. A member of our support team will be with you shortly. How can we help you today?`;
      const welcomeMessageId = `msg_welcome_${Date.now()}`;
      const welcomeMessage = {
        id: welcomeMessageId,
        senderId: otherUserId,
        senderName: otherUserName || "Support",
        senderEmail: otherUserEmail || "",
        text: welcomeText,
        timestamp: new Date().toISOString(),
        status: "sent",
      };
      
      await getDb().collection("messages").insertOne({ _id: welcomeMessageId, chatId, ...welcomeMessage });
      
      await getDb().collection("chats").updateOne(
        { _id: chatId },
        { $set: { lastMessage: welcomeText, lastMessageAt: welcomeMessage.timestamp } }
      );

      chat.lastMessage = welcomeText;
      chat.lastMessageAt = welcomeMessage.timestamp;
    }

    logger.info(`[MemoryChat] Created chat ${chatId} between ${userEmail} and ${otherUserEmail}`);
    res.json({ success: true, chatId, chat });
  } catch (error) {
    logger.error("Error creating chat:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create a new group chat room
router.post("/create-group", async (req, res) => {
  try {
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
      lastMessage: "Group created",
      lastMessageAt: new Date().toISOString(),
      assignedRole: "Support",
      isTakenOver: true,
      assignedTo: null,
      createdBy,
      createdAt: new Date().toISOString(),
    };

    await getDb().collection("chats").insertOne({ _id: chatId, ...chat });
    logger.info(`[MemoryChat] Created group chat ${chatId} with ${participants.length} participants`);

    res.json({ success: true, chatId, chat });
  } catch (error) {
    logger.error("Error creating group chat:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send a message
router.post("/send", async (req, res) => {
  try {
    const { chatId, senderId, senderName, senderEmail, text, imageUrl } = req.body;

    if (!chatId || !senderId) {
      return res.status(400).json({ success: false, message: "chatId and senderId are required" });
    }

    const chat = await getDb().collection("chats").findOne({ _id: chatId });
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const message = {
      id: messageId,
      senderId,
      senderName: senderName || "User",
      senderEmail: senderEmail || "",
      text: text || "",
      imageUrl: imageUrl || null,
      timestamp: new Date().toISOString(),
      status: "sent",
      ...req.body,
    };

    await getDb().collection("messages").insertOne({ _id: messageId, chatId, ...message });

    const lastMsgText = text || (imageUrl ? "📷 Image" : "");
    await getDb().collection("chats").updateOne(
      { _id: chatId },
      { $set: { lastMessage: lastMsgText, lastMessageAt: message.timestamp, lastSenderId: senderId, lastSenderName: senderName || "User" } }
    );

    res.json({ success: true, message });

    // AI Intent classification and response logic
    // Trigger only if sent by the customer and NOT yet taken over by an employee
    const senderInfo = chat.participantInfo[senderId] || {};
    const isCustomer = String(senderInfo.role || "").toLowerCase() === "customer";
    if (isCustomer && !chat.isTakenOver) {
      try {
        // Fetch all messages to count user messages
        const allMessages = await getDb().collection("messages").find({ chatId }).sort({ timestamp: 1 }).toArray();
        const userMsgs = allMessages.filter(m => m.senderId === senderId);

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
            await getDb().collection("chats").updateOne(
              { _id: chatId },
              { $set: { assignedRole: matched } }
            );
            logger.info(`[MemoryChat] Classifying chat ${chatId} intent. Assigned department: ${matched}`);
          }
        }

        // 2. Fallback AI response
        const recentHistory = allMessages.slice(-8).map(m => ({
          role: m.senderId === senderId ? "user" : "assistant",
          content: m.text || "",
        }));

        // Let AI reply in real-time
        const aiReplyText = await chatWithAI(recentHistory);
        const aiMessageId = `msg_ai_${Date.now()}`;
        const aiMessage = {
          id: aiMessageId,
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

        await getDb().collection("messages").insertOne({ _id: aiMessageId, chatId, ...aiMessage });
        
        await getDb().collection("chats").updateOne(
          { _id: chatId },
          { $set: { lastMessage: aiReplyText, lastMessageAt: aiMessage.timestamp, lastSenderId: "solutionhub-ai", lastSenderName: "SolutionHub AI" } }
        );
        logger.info(`[MemoryChat] AI auto-replied in chat ${chatId}`);
      } catch (err) {
        logger.error("[MemoryChat] AI Routing/Response error:", err);
      }
    }
  } catch (error) {
    logger.error("Error sending message:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get messages in a room
router.get("/messages", async (req, res) => {
  try {
    const { chatId } = req.query;

    if (!chatId) {
      return res.status(400).json({ success: false, message: "chatId is required" });
    }

    const messages = await getDb().collection("messages").find({ chatId }).sort({ timestamp: 1 }).toArray();

    res.json({ success: true, messages });
  } catch (error) {
    logger.error("Error getting messages:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark messages as read
router.post("/read", async (req, res) => {
  try {
    const { chatId, readerId } = req.body;
    await getDb().collection("messages").updateMany(
      { chatId, senderId: { $ne: readerId }, status: { $ne: "read" } },
      { $set: { status: "read" } }
    );

    res.json({ success: true });
  } catch (error) {
    logger.error("Error marking messages as read:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// List all chat rooms (for employee dashboard support queue)
router.get("/rooms", async (req, res) => {
  try {
    const { role, userId } = req.query;
    let rooms = await getDb().collection("chats").find({}).toArray();
    rooms = rooms.map(d => ({ id: d._id.toString(), ...d }));

    // Employees can filter by their assigned role
    if (role) {
      rooms = rooms.filter((r) => r.assignedRole === role || r.assignedTo === role);
    }

    // Map to exclude full messages list for bandwidth saving
    const roomSummaries = [];
    for (const r of rooms) {
      let unreadCount = 0;
      if (userId) {
        const unreadMessages = await getDb().collection("messages")
          .find({ chatId: r.id, senderId: { $ne: userId }, status: "sent" })
          .toArray();
        unreadCount = unreadMessages.length;
      }
      roomSummaries.push({
        id: r.id,
        participants: r.participants,
        participantInfo: r.participantInfo,
        lastMessage: r.lastMessage,
        lastMessageAt: r.lastMessageAt,
        assignedRole: r.assignedRole,
        isTakenOver: r.isTakenOver,
        assignedTo: r.assignedTo,
        unreadCount,
      });
    }

    res.json({ success: true, rooms: roomSummaries });
  } catch (error) {
    logger.error("Error listing rooms:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Takeover a chat room
router.post("/takeover", async (req, res) => {
  try {
    const { chatId, employeeId, employeeName } = req.body;

    const chat = await getDb().collection("chats").findOne({ _id: chatId });
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    await getDb().collection("chats").updateOne(
      { _id: chatId },
      { $set: { isTakenOver: true, assignedTo: employeeName } }
    );

    logger.info(`[MemoryChat] Employee ${employeeName} took over chat ${chatId}`);

    res.json({ success: true });
  } catch (error) {
    logger.error("Error taking over chat:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Clear/Reset a chat room
router.post("/clear", async (req, res) => {
  try {
    const { chatId } = req.body;
    await getDb().collection("messages").deleteMany({ chatId });

    await getDb().collection("chats").updateOne(
      { _id: chatId },
      { $set: { lastMessage: "Chat cleared", lastMessageAt: new Date().toISOString() } }
    );

    res.json({ success: true });
  } catch (error) {
    logger.error("Error clearing chat:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete specific messages in a chat room
router.post("/delete-messages", async (req, res) => {
  try {
    const { chatId, messageIds } = req.body;
    if (Array.isArray(messageIds)) {
      await getDb().collection("messages").deleteMany({ _id: { $in: messageIds }, chatId });

      // Update last message preview
      const allMessages = await getDb().collection("messages").find({ chatId }).sort({ timestamp: 1 }).toArray();
      
      let lastMsg = "Chat cleared";
      if (allMessages.length > 0) {
        const last = allMessages[allMessages.length - 1];
        lastMsg = last.text || (last.imageUrl ? "📷 Image" : "Message deleted");
      }

      await getDb().collection("chats").updateOne(
        { _id: chatId },
        { $set: { lastMessage: lastMsg, lastMessageAt: new Date().toISOString() } }
      );
    }
    res.json({ success: true });
  } catch (error) {
    logger.error("Error deleting messages:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
