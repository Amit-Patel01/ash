const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
const fs = require("fs");
const { connectDB } = require("./utils/mongo");
const cron = require("node-cron");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const multer = require("multer");

// ─── Logger (first so everything can log) ───────────────────────────────────
const { logger } = require("./logger");

// ─── ENV Validation ──────────────────────────────────────────────────────────
const REQUIRED_ENV = ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"];
const missingEnv = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missingEnv.length > 0) {
  logger.warn(`Missing environment variables: ${missingEnv.join(", ")}. Some features may not work.`);
}

const geminiEnvKey =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
  process.env.GOOGLE_GENAI_API_KEY;

if (!geminiEnvKey) {
  logger.warn("Gemini API key not set; AI chatbot features are disabled.");
}

// ─── Maintenance Mode State ──────────────────────────────────────────────────
let isMaintenanceModeEnabled = false;
let maintenanceMessage = "";
let lastMaintenanceCheck = 0;
const MAINTENANCE_CACHE_TTL_MS = 15000; // Cache maintenance status for 15 seconds

// ─── Express App ─────────────────────────────────────────────────────────────
const app = express();
app.disable("x-powered-by");
app.set('trust proxy', 1);

const passport = require("./services/passport");
app.use(passport.initialize());

// Maintenance middleware moved below webhooks to allow webhooks to bypass automatically

// ─── Webhook route FIRST (needs raw body before express.json) ────────────────
app.use("/api/webhook", require("./routes/webhook"));

// ─── Dynamic Maintenance Middleware ──────────────────────────────────────────
app.use(async (req, res, next) => {
  const now = Date.now();
  if (now - lastMaintenanceCheck > MAINTENANCE_CACHE_TTL_MS) {
    try {
      const db = require("./utils/mongo").getDb();
      const data = await db.collection("settings").findOne({ _id: "maintenance" });
      if (data) {
        isMaintenanceModeEnabled = false;
        maintenanceMessage = "";
      } else {
        isMaintenanceModeEnabled = false;
        maintenanceMessage = "";
      }
      lastMaintenanceCheck = now;
    } catch (err) {
      isMaintenanceModeEnabled = false;
      maintenanceMessage = "";
    }
  }

  if (!isMaintenanceModeEnabled) {
    return next();
  }

  const path = req.path;

  // Bypass rules:
  // 1. Allow Static Assets & Uploads
  const isStaticAsset = 
    path.startsWith("/uploads") || 
    path.startsWith("/assets") ||
    path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|json|txt|pdf)$/i);
    
  if (isStaticAsset) {
    return next();
  }

  // 2. Allow Admin/Login UI pages
  if (path.startsWith("/admin") || path.startsWith("/login")) {
    return next();
  }

  // 3. Allow Admin and Auth APIs, profile check, or maintenance status check
  if (
    path.startsWith("/api/auth") ||
    path.startsWith("/api/admin") ||
    path === "/api/users/me" ||
    path.startsWith("/api/db/settings")
  ) {
    return next();
  }

  // 4. Allow Admin and Employees to bypass maintenance mode entirely via token check
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split("Bearer ")[1];
    try {
      const jwt = require("jsonwebtoken");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded && ["admin", "employee"].includes(decoded.role)) {
        return next();
      }
    } catch (e) {
      // Ignore token verification errors here; normal routing will handle it if needed
    }
  }

  // If it's any other API request during maintenance, return 503
  if (path.startsWith("/api")) {
    return res.status(503).json({
      success: false,
      message: "We are currently under maintenance. Please check back soon!"
    });
  }

  // Otherwise, render the Maintenance HTML page
  const displayMessage = maintenanceMessage || "We are currently upgrading our systems with exciting new features to bring you a better experience. We'll be back online shortly. Thank you for your patience!";

  res.status(503).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Under Maintenance | Amit Solution Hub</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
          color: #ffffff;
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          overflow: hidden;
        }
        .container {
          max-width: 600px;
          padding: 50px 30px;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        h1 {
          font-size: 3rem;
          margin-bottom: 1rem;
          background: linear-gradient(to right, #38bdf8, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 800;
        }
        p {
          font-size: 1.1rem;
          color: #94a3b8;
          line-height: 1.8;
          margin-bottom: 2rem;
        }
        .contact {
          font-size: 1rem;
          color: #38bdf8;
          text-decoration: none;
          font-weight: 600;
          border: 1px solid rgba(56, 189, 248, 0.2);
          padding: 10px 20px;
          border-radius: 50px;
          background: rgba(56, 189, 248, 0.05);
          transition: all 0.3s ease;
        }
        .contact:hover {
          background: rgba(56, 189, 248, 0.15);
          border-color: rgba(56, 189, 248, 0.4);
          box-shadow: 0 0 20px rgba(56, 189, 248, 0.2);
        }
        .loader {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 2.5rem;
        }
        .dot {
          width: 14px;
          height: 14px;
          background: #818cf8;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
          box-shadow: 0 0 10px rgba(129, 140, 248, 0.5);
        }
        .dot:nth-child(1) { animation-delay: -0.32s; }
        .dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Under Maintenance</h1>
        <p>\${displayMessage.replace(/\\n/g, "<br>")}</p>
        <p style="margin-bottom: 2.5rem;">For any urgent issues, please contact us at:</p>
        <a href="mailto:support@amitsolutionhub.com" class="contact">support@amitsolutionhub.com</a>
        <div class="loader">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>
    </body>
    </html>
  `);
});

// ─── Security Middleware ─────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled to avoid breaking existing frontend
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);
const DEFAULT_ALLOWED_ORIGINS = [
  "https://www.amitsolutionhub.com",
  "https://amitsolutionhub.com",
  "https://amitsolutionhub.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
];

const allowedOrigins = Array.from(
  new Set(
    (process.env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
      .concat(DEFAULT_ALLOWED_ORIGINS)
  )
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      // Suffix matching & dynamic tunnel origin helper
      const isAllowed = 
        allowedOrigins.some(allowed => allowed.replace(/\/$/, "") === origin.replace(/\/$/, "")) ||
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".amitsolutionhub.com") ||
        origin.endsWith(".onrender.com") ||
        origin.includes("devtunnels.ms") ||
        origin.includes("ngrok") ||
        origin.includes("loca.lt") ||
        /^https?:\/\/(localhost|127\.0\.0\.1|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(origin);

      if (isAllowed) {
        callback(null, true);
      } else {
        logger.warn(`[CORS] Request from disallowed origin: ${origin}`);
        callback(null, false);
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400,
  })
);
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." },
  skip: (req) => process.env.NODE_ENV !== "production" || req.path === "/" || req.path.startsWith("/uploads"),
});
app.use("/api/", apiLimiter);

// ─── Strict Auth Rate Limiter (login / forgot-password) ──────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15, // 15 attempts per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts. Please try again in 15 minutes.", code: "rate_limit_exceeded" },
});

// ─── Static File Serving (Uploads) ───────────────────────────────────────────
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
// /uploads must send CORS headers so html2canvas can fetch images crossOrigin without tainting the canvas
app.use("/uploads", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
}, express.static(uploadsDir));
// ─── Frontend Static Files (optional) ────────────────────────────────────────
const frontendDistDir = path.join(__dirname, "..", "frontend", "dist");
const frontendIndexPath = path.join(frontendDistDir, "index.html");
const sendFrontendIndex = (res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(frontendIndexPath);
};

if (fs.existsSync(frontendDistDir)) {
  // Serve static files from the React frontend build directory
  app.use(express.static(path.join(__dirname, '../frontend/dist'), {
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        // Never cache index.html to ensure users always get the latest bundle hashes
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      } else if (filePath.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$/)) {
        // Cache assets with hashes for 1 year
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }
  }));
}
// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    status: "Backend is running",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    features: ["trading", "admin", "auth", "users", "certificates", "ai-chat", "webhook"],
  });
});

// ─── Multer Configurations (moved to middleware) ─────────────────────────────
const {
  uploadPayment: upload,
  uploadTeam,
  uploadProject,
  uploadBroadcast,
  uploadCertificateAsset,
  uploadChat,
  ALLOWED_MIME_TYPES,
  imageFilter,
} = require("./middlewares/uploadMiddleware");

const getBaseUrl = (req) => {
  const proto = req.headers["x-forwarded-proto"] || req.protocol;
  return `${proto}://${req.get("host")}`;
};

// Upload endpoints (v1 — preserved exactly)
app.post("/api/upload/payment", upload.single("screenshot"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
  res.json({ success: true, url: `${getBaseUrl(req)}/uploads/payments/${req.file.filename}` });
});

app.post("/api/upload/team", uploadTeam.single("photo"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
  res.json({ success: true, url: `${getBaseUrl(req)}/uploads/team/${req.file.filename}` });
});

app.post("/api/upload/project", uploadProject.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
  res.json({ success: true, url: `${getBaseUrl(req)}/uploads/projects/${req.file.filename}` });
});

app.post("/api/upload/broadcast", uploadBroadcast.single("broadcast-image"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
  res.json({ success: true, url: `${getBaseUrl(req)}/uploads/broadcasts/${req.file.filename}` });
});

app.post("/api/upload/chat", uploadChat.single("chat-image"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
  res.json({ success: true, url: `${getBaseUrl(req)}/uploads/chat/${req.file.filename}` });
});

app.post("/api/upload/certificate-asset", uploadCertificateAsset.single("asset"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
  res.json({ success: true, url: `/uploads/certificates/${req.file.filename}` });
});

// Multer error handler
app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "The uploaded file is too large. Maximum allowed size is 5 MB unless the endpoint specifies otherwise.",
    });
  }
  if (err.message?.includes("Only JPG")) {
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err.message?.includes("Only PDF")) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});

// ─── Modular Routes (v2) ──────────────────────────────────────────────────────
app.use("/api/trading", require("./routes/trading"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/certificates", require("./routes/certificates"));
app.use("/api/razorpay", require("./routes/razorpay"));
app.use("/api/coupons", require("./routes/coupons"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/notify", require("./routes/notify"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/db", require("./routes/db"));
app.use("/api/unsubscribe", require("./routes/unsubscribe").router);

if (fs.existsSync(frontendDistDir)) {
  app.get("/{*path}", (req, res) => {
    // Exclude /api routes just in case, though they are defined above
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ success: false, message: "API endpoint not found" });
    }
    sendFrontendIndex(res);
  });
}

// ─── Legacy Contact & Reply Routes (kept at root for backward compat) ─────────
const { sendEmail, emailTemplate } = require("./services/emailService");
const { verifyFirebaseToken } = require("./middlewares/authMiddleware");

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 contact form submissions per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many messages sent. Please try again later." },
});

app.post("/contact", contactLimiter, async (req, res) => {
  const { firstName, lastName, email, mobile, github, message } = req.body;

  // ── Input Validation ──
  if (!firstName || String(firstName).trim().length < 1) {
    return res.status(400).json({ success: false, message: "First name is required." });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
    return res.status(400).json({ success: false, message: "A valid email address is required." });
  }
  if (!message || String(message).trim().length < 10) {
    return res.status(400).json({ success: false, message: "Message must be at least 10 characters." });
  }
  if (String(message).length > 3000) {
    return res.status(400).json({ success: false, message: "Message must not exceed 3000 characters." });
  }

  const safeFirst = String(firstName).trim().substring(0, 100);
  const safeLast = String(lastName || "").trim().substring(0, 100);
  const safeEmail = String(email).trim().toLowerCase();
  const safeMessage = String(message).trim();

  try {
    await sendEmail({
      to: "amitpatel07029@gmail.com",
      subject: `New Contact from ${safeFirst}`,
      text: `Name: ${safeFirst} ${safeLast}\nEmail: ${safeEmail}\nMobile: ${mobile || "N/A"}\nGitHub: ${github || "N/A"}\nMessage: ${safeMessage}`,
    });

    await sendEmail({
      to: safeEmail,
      subject: "Message Received – Amit Solution Hub",
      html: emailTemplate(
        "We've Received Your Message",
        `
        <p>Hello ${safeFirst},</p>
        <p>Thank you for reaching out. Our team has received your inquiry and will respond within 24 business hours.</p>
        <div style="margin: 30px 0; padding: 24px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #f1f5f9;">
          <p style="margin: 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Your Inquiry:</p>
          <p style="margin-top: 10px; color: #475569; font-style: italic;">&quot;${safeMessage.substring(0, 500)}${safeMessage.length > 500 ? '...' : ''}&quot;</p>
        </div>
        `,
        "Explore Projects",
        "https://www.amitsolutionhub.com/projects"
      ),
    });

    logger.info(`Contact form submitted by ${safeEmail}`);
    res.json({ success: true });
  } catch (error) {
    logger.error("Contact form error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to send email." });
  }
});

// Protected: Only authenticated admin/employee users can send reply emails
app.post("/reply", verifyFirebaseToken, async (req, res) => {
  // Only admin or employee can use this endpoint
  if (!req.user || !["admin", "employee"].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Forbidden: Admin only." });
  }

  const { email, firstName, message, subject } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
    return res.status(400).json({ success: false, message: "Valid recipient email is required." });
  }
  if (!message || String(message).trim().length < 1) {
    return res.status(400).json({ success: false, message: "Message is required." });
  }

  try {
    await sendEmail({
      to: String(email).trim(),
      subject: subject || "Reply from Amit Solution Hub",
      html: emailTemplate(
        subject || "Official Update",
        `
        <p>Hello ${firstName || "there"},</p>
        <div style="color: #4b5563; line-height: 1.8; white-space: pre-wrap; font-size: 15px; margin: 25px 0;">${String(message).trim()}</div>
        <p>If you have further questions, please reply to this email thread.</p>
        `
      ),
    });
    logger.info(`Admin reply sent to ${email} by ${req.user.email}`);
    res.json({ success: true });
  } catch (error) {
    logger.error("Reply error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to send reply." });
  }
});

// ─── Cron Job: Session + Course Plan Reminders (every 5 min) ──────────────────
const {
  sendSessionNotification,
  sendCoursePlanNotification,
} = require("./services/notificationService");
const {
  getSessionsForReminder,
  getCoursesWithPlanMeetings,
  getActiveCourseEnrollments,
  updateCoursePlans,
} = require("./services/firebaseService");

cron.schedule("*/5 * * * *", async () => {
  try {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const sessions = await getSessionsForReminder(todayStr);

    for (const session of sessions) {
      if (!session.time) continue;
      const sessionDate = new Date(`${session.date}T${session.time}`);
      const diffMins = (sessionDate - now) / (1000 * 60);

      if (diffMins > 50 && diffMins <= 70) {
        await sendSessionNotification(session.id, "REMINDER");
      }
    }

    const [courses, enrollments] = await Promise.all([
      getCoursesWithPlanMeetings(),
      getActiveCourseEnrollments(),
    ]);

    for (const course of courses) {
      if (!Array.isArray(course.plans) || course.plans.length === 0) continue;

      const nextPlans = [...course.plans];
      let plansChanged = false;

      for (let index = 0; index < nextPlans.length; index += 1) {
        const plan = nextPlans[index];
        if (!plan?.meetingStartsAt) continue;

        const meetingStartsAt = new Date(plan.meetingStartsAt);
        if (Number.isNaN(meetingStartsAt.getTime())) continue;

        const diffMins = (meetingStartsAt.getTime() - now.getTime()) / (1000 * 60);

        if (!plan.meetingReminderSentAt && diffMins > 55 && diffMins <= 65) {
          const reminderSentCount = await sendCoursePlanNotification(
            course,
            plan,
            enrollments,
            "REMINDER"
          );

          if (reminderSentCount > 0) {
            nextPlans[index] = {
              ...nextPlans[index],
              meetingReminderSentAt: new Date().toISOString(),
            };
            plansChanged = true;
          }
        }

        if (!nextPlans[index].meetingLiveSentAt && diffMins <= 5 && diffMins >= -5) {
          const liveSentCount = await sendCoursePlanNotification(
            course,
            nextPlans[index],
            enrollments,
            "LIVE_NOW"
          );

          if (liveSentCount > 0) {
            nextPlans[index] = {
              ...nextPlans[index],
              meetingLiveSentAt: new Date().toISOString(),
            };
            plansChanged = true;
          }
        }
      }

      if (plansChanged) {
        await updateCoursePlans(course.id, nextPlans);
      }
    }
  } catch (error) {
    logger.error("Cron job error:", error);
  }
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error(`Unhandled error on ${req.method} ${req.path}: ${err.message}`);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    logger.info(`SolutionHub backend listening on 0.0.0.0:${PORT}`);
    logger.info("Modules: trading | admin | auth | users | certificates | razorpay | ai | webhook");

    // ─── Start AI Workforce Scheduled Tasks ─────────────────────────────────────
    const { startScheduledTasks } = require("./services/aiAgents/scheduledTasks");
    startScheduledTasks();
  });
}).catch(err => {
  logger.error("Failed to connect to database, server not started:", err);
});
