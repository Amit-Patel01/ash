require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const admin = require("firebase-admin");
const cron = require("node-cron");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const multer = require("multer");

// ─── Logger (first so everything can log) ───────────────────────────────────
const { logger } = require("./logger");

// ─── ENV Validation ──────────────────────────────────────────────────────────
const REQUIRED_ENV = ["RESEND_API_KEY", "RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"];
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

// ─── Firebase Admin ──────────────────────────────────────────────────────────
const normalizeServiceAccount = (serviceAccount) => {
  if (!serviceAccount || typeof serviceAccount !== "object") {
    return serviceAccount;
  }

  const normalized = { ...serviceAccount };

  if (typeof normalized.private_key === "string") {
    normalized.private_key = normalized.private_key
      .trim()
      .replace(/^"(.*)"$/, "$1")
      .replace(/\r/g, "")
      .replace(/\\n/g, "\n");
  }

  return normalized;
};

const loadServiceAccount = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      return normalizeServiceAccount(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON));
    } catch (error) {
      logger.error("Invalid FIREBASE_SERVICE_ACCOUNT_JSON value. Expected valid JSON.");
      throw error;
    }
  }

  const credentialsPath = path.join(__dirname, "credentials.json");
  if (fs.existsSync(credentialsPath)) {
    return normalizeServiceAccount(require("./credentials.json"));
  }

  throw new Error(
    "Firebase credentials missing. Set FIREBASE_SERVICE_ACCOUNT_JSON or provide backend/credentials.json."
  );
};

const serviceAccount = loadServiceAccount();
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  logger.info(`Firebase Admin initialized (project: ${serviceAccount.project_id})`);
  if (serviceAccount.project_id !== "solutionhub-81976") {
    logger.warn(`Project ID mismatch: credentials are for ${serviceAccount.project_id}.`);
  }
}

// ─── Express App ─────────────────────────────────────────────────────────────
const app = express();
app.disable("x-powered-by");
app.set('trust proxy', 1);

// ─── Webhook route FIRST (needs raw body before express.json) ────────────────
app.use("/api/webhook", require("./routes/webhook"));

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
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      logger.warn(`Blocked CORS origin: ${origin}`);
      return callback(new Error("Origin not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
    maxAge: 86400,
  })
);
app.use(express.json({ limit: "1mb" }));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." },
  skip: (req) => req.path === "/" || req.path.startsWith("/uploads"),
});
app.use("/api/", apiLimiter);

// ─── Static File Serving (Uploads) ───────────────────────────────────────────
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    status: "Backend is running",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    features: ["trading", "admin", "auth", "users", "certificates", "ai-chat", "webhook"],
  });
});

// ─── Multer Configurations (preserved from v1) ───────────────────────────────
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

const makeStorage = (folder, prefix = "") =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(uploadsDir, folder);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${prefix}${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  });

const imageFilter = (req, file, cb) => {
  const ext = /\.(jpeg|jpg|png|webp)$/i.test(path.extname(file.originalname));
  const mime = ALLOWED_MIME_TYPES.includes(file.mimetype);
  cb(ext && mime ? null : new Error("Only JPG, PNG, and WebP images are allowed"), ext && mime);
};

const upload = multer({ storage: makeStorage("payments"), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: imageFilter });
const uploadTeam = multer({ storage: makeStorage("team", "team-"), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: imageFilter });
const uploadProject = multer({ storage: makeStorage("projects", "project-"), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: imageFilter });
const uploadBroadcast = multer({ storage: makeStorage("broadcasts", "broadcast-"), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: imageFilter });
const uploadChat = multer({
  storage: makeStorage("chat", "chat-"),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = /\.(jpeg|jpg|png|webp|gif)$/i.test(path.extname(file.originalname));
    const mime = [...ALLOWED_MIME_TYPES, "image/gif"].includes(file.mimetype);
    cb(ext && mime ? null : new Error("Only JPG, PNG, GIF, and WebP images are allowed"), ext && mime);
  },
});

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
app.use("/api/ai", require("./routes/ai"));
app.use("/api/notify", require("./routes/notify"));

// ─── Legacy Contact & Reply Routes (kept at root for backward compat) ─────────
const { sendEmail, emailTemplate } = require("./services/emailService");

app.post("/contact", async (req, res) => {
  const { firstName, lastName, email, mobile, github, message } = req.body;
  try {
    await sendEmail({
      to: "amitpatel07029@gmail.com",
      subject: `New Contact from ${firstName}`,
      text: `Name: ${firstName} ${lastName}\nEmail: ${email}\nMobile: ${mobile || "N/A"}\nGitHub: ${github || "N/A"}\nMessage: ${message}`,
    });

    await sendEmail({
      to: email,
      subject: "Message Received – Amit Solution Hub",
      html: emailTemplate(
        "We've Received Your Message",
        `
        <p>Hello ${firstName},</p>
        <p>Thank you for reaching out. Our team has received your inquiry and will respond within 24 business hours.</p>
        <div style="margin: 30px 0; padding: 24px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #f1f5f9;">
          <p style="margin: 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Your Inquiry:</p>
          <p style="margin-top: 10px; color: #475569; font-style: italic;">"${message}"</p>
        </div>
        `,
        "Explore Projects",
        "https://www.amitsolutionhub.com/projects"
      ),
    });

    logger.info(`Contact form submitted by ${email}`);
    res.json({ success: true });
  } catch (error) {
    logger.error("Contact form error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to send email." });
  }
});

app.post("/reply", async (req, res) => {
  const { email, firstName, message, subject } = req.body;
  try {
    await sendEmail({
      to: email,
      subject: subject || "Reply from Amit Solution Hub",
      html: emailTemplate(
        subject || "Official Update",
        `
        <p>Hello ${firstName},</p>
        <div style="color: #4b5563; line-height: 1.8; white-space: pre-wrap; font-size: 15px; margin: 25px 0;">${message}</div>
        <p>If you have further questions, please reply to this email thread.</p>
        `
      ),
    });
    logger.info(`Admin reply sent to ${email}`);
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
app.listen(PORT, () => {
  logger.info(`SolutionHub backend v2.0 listening on port ${PORT}`);
  logger.info("Modules: trading | admin | auth | users | certificates | razorpay | ai | webhook");
});
