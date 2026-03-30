require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded files
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Multer config for payment screenshots
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(uploadsDir, 'payments');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const teamStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(uploadsDir, 'team');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = 'team-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  }
});

const uploadTeam = multer({
  storage: teamStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  }
});

app.get("/", (req, res) => {
  res.send("Backend Live 🚀");
});

// Upload payment screenshot endpoint
app.post("/api/upload/payment", upload.single('screenshot'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  res.json({
    success: true,
    url: `/uploads/payments/${req.file.filename}`
  });
});

// Upload team photo endpoint
app.post("/api/upload/team", uploadTeam.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  res.json({
    success: true,
    url: `/uploads/team/${req.file.filename}`
  });
});

// Project routes
try {
  const projectRoutes = require('./routes/projects');
  app.use('/api/projects', projectRoutes);
} catch (e) {
  console.log('Project routes not loaded:', e.message);
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY) {
  console.warn("⚠️  WARNING: RESEND_API_KEY is not set in .env. Emailing will fail.");
}
const resend = new Resend(RESEND_API_KEY);

app.post("/contact", async (req, res) => {
  const { firstName, lastName, email, mobile, github, message } = req.body;

  try {
    // 1️⃣ Mail to YOU (Admin notification)
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "amitpatel07029@gmail.com",
      subject: `New Contact from ${firstName}`,
      text: `Name: ${firstName} ${lastName}
Email: ${email}
Mobile: ${mobile || 'Not provided'}
GitHub: ${github || 'Not provided'}
Message: ${message}`
    });

    // 2️⃣ Auto reply to CLIENT
    await resend.emails.send({
      from: "Amit Solution Hub <contact@amitsolutionhub.com>",
      to: email,
      subject: "We Received Your Message – Amit Solution Hub",
      html: `
  <div style="font-family: Arial, sans-serif; background-color:#f4f6f8; padding:40px 0;">
    <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 5px 15px rgba(0,0,0,0.08);">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#2563eb,#1e40af); padding:30px; text-align:center;">
        <h1 style="color:#ffffff; margin:0;">Amit Solution Hub</h1>
        <p style="color:#cbd5e1; margin-top:8px;">Professional Web & Software Solutions</p>
      </div>

      <!-- Body -->
      <div style="padding:30px;">
        <h2 style="color:#111827;">Hello ${firstName},</h2>
        <p style="color:#4b5563; line-height:1.6;">
          Thank you for contacting <strong>Amit Solution Hub</strong>.
          We have successfully received your message and our team will respond shortly.
        </p>

        <div style="margin:25px 0; padding:15px; background:#f9fafb; border-left:4px solid #2563eb;">
          <p style="margin:0; color:#374151;"><strong>Your Message:</strong></p>
          <p style="margin-top:8px; color:#6b7280;">${message}</p>
        </div>

        <div style="margin:25px 0; padding:15px; background:#f9fafb; border-left:4px solid #10b981;">
          <p style="margin:0; color:#374151;"><strong>Mobile:</strong></p>
          <p style="margin-top:8px; color:#6b7280;"><a href="tel:${mobile}" style="color:#10b981; font-weight:500; text-decoration:none;">📞 ${mobile}</a></p>
        </div>

        <div style="margin:25px 0; padding:15px; background:#f9fafb; border-left:4px solid #3b82f6;">
          <p style="margin:0; color:#374151;"><strong>GitHub:</strong></p>
          <a href="${github}" target="_blank" rel="noopener noreferrer" style="color:#3b82f6; text-decoration:none; display:inline-block; padding:10px 16px; background:#eff6ff; border-radius:8px; margin-top:8px; font-weight:500;">🔗 View GitHub Profile</a>
        </div>

        <p style="color:#4b5563;">
          If your inquiry is urgent, feel free to reply directly to this email.
        </p>

        <div style="margin-top:30px;">
          <a href="https://amitsolutionhub.com" 
             style="background:#2563eb; color:#ffffff; padding:12px 20px; text-decoration:none; border-radius:6px; display:inline-block;">
            Visit Our Website
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="background:#111827; padding:20px; text-align:center;">
        <p style="color:#9ca3af; font-size:13px; margin:0;">
          © 2026 Amit Solution Hub. All rights reserved.
        </p>
      </div>

    </div>
  </div>
  `
    });
    console.log(`✅ Mail process completed for ${email}`);
    res.json({ success: true });

  } catch (error) {
    console.error("❌ MAIL ERROR:", error.message || error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to send email. Ensure RESEND_API_KEY is valid and domain is verified." 
    });
  }
});

app.post("/reply", async (req, res) => {
  const { email, firstName, message, subject } = req.body;

  try {
    // ONLY send the email to the client
    await resend.emails.send({
      from: "Amit Solution Hub <contact@amitsolutionhub.com>",
      to: email,
      subject: subject || "Reply from Amit Solution Hub",
      html: `
        <div style="font-family: Arial, sans-serif; background-color:#f4f6f8; padding:40px 0;">
          <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 5px 15px rgba(0,0,0,0.08);">
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#2563eb,#1e40af); padding:30px; text-align:center;">
              <h1 style="color:#ffffff; margin:0;">Amit Solution Hub</h1>
              <p style="color:#cbd5e1; margin-top:8px;">Professional Web & Software Solutions</p>
            </div>

            <!-- Body -->
            <div style="padding:30px;">
              <h2 style="color:#111827;">Hello ${firstName},</h2>
              <p style="color:#4b5563; line-height:1.6; white-space: pre-wrap;">
                ${message}
              </p>
              
              <div style="margin-top:30px;">
                <p style="color:#6b7280; font-size:14px;">Regards,</p>
                <p style="color:#111827; font-weight:bold; margin:0;">Amit Patel</p>
                <p style="color:#6b7280; font-size:12px; margin:0;">Founder, Amit Solution Hub</p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background:#111827; padding:20px; text-align:center;">
              <p style="color:#9ca3af; font-size:13px; margin:0;">
                © 2026 Amit Solution Hub. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `
    });

    console.log(`✅ Admin reply sent to ${email}`);
    res.json({ success: true });

  } catch (error) {
    console.error("❌ REPLY ERROR:", error.message || error);
    res.status(500).json({ success: false, message: error.message || "Failed to send reply." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running 🚀");
});
