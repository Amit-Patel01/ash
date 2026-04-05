require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
const { Resend } = require("resend");
const Razorpay = require("razorpay");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const admin = require("firebase-admin");

// Initialize Firebase Admin
const serviceAccount = require("./credentials.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log(`📡 Firebase Admin Initialized (Project: ${serviceAccount.project_id})`);
  if (serviceAccount.project_id !== "solutionhub-81976") {
    console.warn("⚠️  WARNING: Project ID mismatch! Your credentials.json is for", serviceAccount.project_id, "but your frontend uses solutionhub-81976.");
  }
}

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

const projectStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(uploadsDir, 'projects');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = 'project-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const chatStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(uploadsDir, 'chat');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = 'chat-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = /\.(jpeg|jpg|png|webp)$/i.test(path.extname(file.originalname));
    const mime = ALLOWED_MIME_TYPES.includes(file.mimetype);
    if (!ext || !mime) {
      return cb(new Error('Only JPG, PNG, and WebP images are allowed'));
    }
    cb(null, true);
  }
});

const uploadTeam = multer({
  storage: teamStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = /\.(jpeg|jpg|png|webp)$/i.test(path.extname(file.originalname));
    const mime = ALLOWED_MIME_TYPES.includes(file.mimetype);
    if (!ext || !mime) {
      return cb(new Error('Only JPG, PNG, and WebP images are allowed'));
    }
    cb(null, true);
  }
});

const uploadProject = multer({
  storage: projectStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = /\.(jpeg|jpg|png|webp)$/i.test(path.extname(file.originalname));
    const mime = ALLOWED_MIME_TYPES.includes(file.mimetype);
    if (!ext || !mime) {
      return cb(new Error('Only JPG, PNG, and WebP images are allowed'));
    }
    cb(null, true);
  }
});

const uploadChat = multer({
  storage: chatStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Allow up to 10MB for chat images
  fileFilter: (req, file, cb) => {
    const ext = /\.(jpeg|jpg|png|webp|gif)$/i.test(path.extname(file.originalname));
    const mime = [...ALLOWED_MIME_TYPES, 'image/gif'].includes(file.mimetype);
    if (!ext || !mime) {
      return cb(new Error('Only JPG, PNG, GIF, and WebP images are allowed'));
    }
    cb(null, true);
  }
});

app.get("/", (req, res) => {
  res.send("Backend Live 🚀");
});

const getBaseUrl = (req) => {
  const proto = req.headers['x-forwarded-proto'] || req.protocol;
  return `${proto}://${req.get('host')}`;
};

// Upload payment screenshot endpoint
app.post("/api/upload/payment", upload.single('screenshot'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  res.json({
    success: true,
    url: `${getBaseUrl(req)}/uploads/payments/${req.file.filename}`
  });
});

// Upload team photo endpoint
app.post("/api/upload/team", uploadTeam.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  res.json({
    success: true,
    url: `${getBaseUrl(req)}/uploads/team/${req.file.filename}`
  });
});

// Upload project image locally
app.post("/api/upload/project", uploadProject.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  res.json({
    success: true,
    url: `${getBaseUrl(req)}/uploads/projects/${req.file.filename}`
  });
});

// Upload chat image locally (to bypass Firebase Storage CORS)
app.post("/api/upload/chat", uploadChat.single('chat-image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  res.json({
    success: true,
    url: `${getBaseUrl(req)}/uploads/chat/${req.file.filename}`
  });
});

// Multer error handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File too large. Max size is 5MB.' });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err.message === 'Only JPG, PNG, and WebP images are allowed') {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});



const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY) {
  console.warn("⚠️  WARNING: RESEND_API_KEY is not set in .env. Emailing will fail.");
}
const resend = new Resend(RESEND_API_KEY || "re_dummy_key_to_prevent_crash_123456");

/**
 * Premium Email Template Wrapper
 */
const emailTemplate = (subject, content, ctaText = null, ctaUrl = null) => `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <!-- Brand Header -->
    <div style="background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); padding: 40px 20px; text-align: center;">
      <img src="https://www.amitsolutionhub.com/logo.png" alt="Amit Solution Hub" style="height: 60px; margin-bottom: 20px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));" />
      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">${subject}</h1>
    </div>

    <!-- Content Body -->
    <div style="padding: 40px; color: #1e293b; line-height: 1.6;">
      ${content}
      
      ${ctaText && ctaUrl ? `
        <div style="text-align: center; margin: 40px 0;">
          <a href="${ctaUrl}" style="background-color: #2563eb; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);">
            ${ctaText}
          </a>
        </div>
      ` : ''}

      <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #f1f5f9; font-size: 14px; color: #64748b;">
        <p>Best Regards,</p>
        <p style="color: #1e293b; font-weight: bold; margin-bottom: 0;">Amit Patel</p>
        <p style="margin-top: 0;">Founder, Amit Solution Hub</p>
      </div>
    </div>

    <!-- Professional Footer -->
    <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #f1f5f9;">
      <p style="margin: 0; font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
        © 2026 Amit Solution Hub | Registered MSME
      </p>
      <p style="margin: 8px 0 0; font-size: 11px; color: #cbd5e1;">
        Support: support@amitsolutionhub.com | Gujarat, India
      </p>
      <div style="margin-top: 20px; display: flex; justify-content: center; gap: 15px;">
        <span style="font-size: 11px; color: #94a3b8;">Built with Excellence.</span>
      </div>
    </div>
  </div>
`;

// Razorpay config
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.warn("⚠️  WARNING: Razorpay keys are not set in .env. Payment features will fail.");
}
const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID || "rzp_test_dummykey12345",
  key_secret: RAZORPAY_KEY_SECRET || "dummysecret12345",
});

// Create Razorpay Order
app.post("/api/razorpay/create-order", async (req, res) => {
  const { amount, currency = "INR" } = req.body;
  try {
    const options = {
      amount: amount * 100, // format in paise
      currency,
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    res.status(500).json({ success: false, message: "Failed to create order" });
  }
});

// Verify Razorpay Payment & Send Email
app.post("/api/razorpay/verify-payment", async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    customer_email,
    customer_name,
    project_title,
    amount,
    purchase_type
  } = req.body;

  const hmac = crypto.createHmac("sha256", RAZORPAY_KEY_SECRET);
  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const expectedSignature = hmac.digest("hex");

  if (expectedSignature !== razorpay_signature) {
    console.error("❌ Projects Signature Mismatch:", {
      expected: expectedSignature,
      received: razorpay_signature,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id
    });
  }

  if (expectedSignature === razorpay_signature) {
    try {
      // Send Success Email to Client
      await resend.emails.send({
        from: "Amit Solution Hub <support@amitsolutionhub.com>",
        to: customer_email,
        subject: `Payment Successful – ${project_title}`,
        html: emailTemplate(
          "Thank You for Your Purchase!",
          `
          <p>Hello <strong>${customer_name}</strong>,</p>
          <p>We’ve successfully received your payment for <strong>${project_title}</strong>.</p>
          
          <div style="background: #eff6ff; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #dbeafe;">
            <p style="margin: 0; font-weight: bold; color: #1e40af;">Next Steps:</p>
            <p style="margin: 8px 0 0; color: #1e3a8a;">
              Our engineers are preparing your files. <strong>The full source code, setup guide, and documentation will reach this email within 24 hours.</strong>
            </p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-top: 24px; font-size: 14px;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 12px 0; color: #64748b;">Order ID</td>
              <td style="padding: 12px 0; text-align: right; font-weight: 600;">${razorpay_order_id}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 12px 0; color: #64748b;">Amount Paid</td>
              <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #059669;">₹${amount}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #64748b;">Package</td>
              <td style="padding: 12px 0; text-align: right; font-weight: 600;">${purchase_type === 'project_with_source' ? 'Source + Setup' : 'Project Only'}</td>
            </tr>
          </table>
          `,
          "View Orders",
          "https://www.amitsolutionhub.com/customer/orders"
        )
      });

      // Notify Admin
      await resend.emails.send({
        from: "Amit Solution Hub <support@amitsolutionhub.com>",
        to: "amitpatel07029@gmail.com",
        subject: `New Payment Received: ₹${amount}`,
        text: `New order for ${project_title} from ${customer_name} (${customer_email}). Order ID: ${razorpay_order_id}.`
      });

      res.json({ success: true, message: "Payment verified and email sent" });
    } catch (error) {
      console.error("Email Error after success:", error);
      res.json({ success: true, message: "Payment verified but failed to send confirmation email" });
    }
  } else {
    res.status(400).json({ success: false, message: "Invalid signature" });
  }
});

// Verify Razorpay Payment for Trading Mentorship
app.post("/api/trading/verify-payment", async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    userId,
    userName,
    userEmail,
    planId,
    planName,
    amount
  } = req.body;

  const hmac = crypto.createHmac("sha256", RAZORPAY_KEY_SECRET);
  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const expectedSignature = hmac.digest("hex");

  if (expectedSignature !== razorpay_signature) {
    console.error("❌ Trading Signature Mismatch:", {
      expected: expectedSignature,
      received: razorpay_signature,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id
    });
  }

  if (expectedSignature === razorpay_signature) {
    try {
      const db = admin.firestore();

      // 1. Record Payment
      const paymentRef = db.collection('tradingPayments').doc(razorpay_payment_id);
      await paymentRef.set({
        userId,
        userName,
        userEmail,
        courseId: planId,
        courseName: planName,
        amount,
        paymentMethod: 'razorpay',
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        status: 'completed',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 2. Mark Enrollment as Active (use auto-generated ID instead of composite key)
      const enrollmentRef = db.collection('tradingEnrollments').doc();
      await enrollmentRef.set({
        userId,
        userName,
        userEmail,
        courseId: planId,
        courseName: planName,
        status: 'active',
        paymentId: razorpay_payment_id,
        enrolledAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 3. Send Success Email
      await resend.emails.send({
        from: "Amit Solution Hub <support@amitsolutionhub.com>",
        to: userEmail,
        subject: `Welcome to ${planName} Mentorship!`,
        html: emailTemplate(
          "Enrollment Confirmed!",
          `
          <h2>Hello ${userName},</h2>
          <p>Your enrollment in the <strong>${planName} Mentorship Program</strong> is active. We are excited to have you join our next cohort.</p>
          <p>Your payment of <strong>₹${amount}</strong> was successful. You now have full access to:</p>
          <ul style="padding-left: 20px; color: #475569;">
            <li>Daily Live Trading Sessions</li>
            <li>Premium Strategy Blueprints</li>
            <li>Private Community Discord/Telegram</li>
            <li>One-on-One Performance Review</li>
          </ul>
          `,
          "Access Dashboard",
          "https://www.amitsolutionhub.com/customer"
        )
      });

      res.json({ success: true, message: "Payment verified and enrollment activated" });
    } catch (error) {
      console.error("Verification Error:", error);
      res.status(500).json({ success: false, message: "Failed to process enrollment" });
    }
  } else {
    res.status(400).json({ success: false, message: "Invalid signature" });
  }
});

app.post("/api/trading/enrollment-email", async (req, res) => {
  const { userName, userEmail, planName, amount } = req.body;
  try {
    await resend.emails.send({
      from: "Amit Solution Hub <support@amitsolutionhub.com>",
      to: userEmail,
      subject: `Welcome to ${planName} Mentorship!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
          <div style="background: #2563eb; color: white; padding: 40px; text-align: center;">
            <h1>Enrollment Confirmed!</h1>
            <p>You now have access to the ${planName} Mentorship Program.</p>
          </div>
          <div style="padding: 40px;">
            <h2>Hello ${userName},</h2>
            <p>Your enrollment in the <strong>${planName}</strong> plan has been confirmed.</p>
            <p>You can now access live sessions, curriculum, and community resources through your dashboard.</p>
            <div style="text-align: center; margin: 40px 0;">
              <a href="https://amitsolutionhub.com/customer" style="background: #2563eb; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">Go to Dashboard</a>
            </div>
          </div>
        </div>
      `
    });
    res.json({ success: true, message: "Enrollment email sent" });
  } catch (error) {
    console.error("Email Error:", error);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

app.post("/contact", async (req, res) => {
  const { firstName, lastName, email, mobile, github, message } = req.body;

  try {
    // 1️⃣ Mail to YOU (Admin notification)
    await resend.emails.send({
      from: "Amit Solution Hub <support@amitsolutionhub.com>",
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
      from: "Amit Solution Hub <support@amitsolutionhub.com>",
      to: email,
      subject: "Message Received – Amit Solution Hub",
      html: emailTemplate(
        "We've Received Your Message",
        `
        <p>Hello ${firstName},</p>
        <p>Thank you for reaching out to <strong>Amit Solution Hub</strong>. Our team has received your inquiry and we will get back to you within 24 business hours.</p>

        <div style="margin: 30px 0; padding: 24px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #f1f5f9;">
          <p style="margin: 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Your Inquiry:</p>
          <p style="margin-top: 10px; color: #475569; font-style: italic;">"${message}"</p>
        </div>

        <p>While you wait, feel free to explore our latest case studies and source code projects on our official website.</p>
        `,
        "Explore Projects",
        "https://www.amitsolutionhub.com/projects"
      )
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
      from: "Amit Solution Hub <support@amitsolutionhub.com>",
      to: email,
      subject: subject || "Reply from Amit Solution Hub",
      html: emailTemplate(
        subject || "Official Update",
        `
        <p>Hello ${firstName},</p>
        <div style="color: #4b5563; line-height: 1.8; white-space: pre-wrap; font-size: 15px; margin: 25px 0;">${message}</div>
        <p>If you have further questions regarding this matter, please simply reply to this email thread.</p>
        `
      )
    });

    console.log(`✅ Admin reply sent to ${email}`);
    res.json({ success: true });

  } catch (error) {
    console.error("❌ REPLY ERROR:", error.message || error);
    res.status(500).json({ success: false, message: error.message || "Failed to send reply." });
  }
});

// --- Custom Password Reset (Firebase Link + Resend) ---
app.post("/api/auth/forgot-password", async (req, res) => {
  const { email, returnUrl } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  try {
    // 1. Generate the official Firebase Reset Link using Admin SDK
    // This creates the same link that Firebase would send normally
    const actionCodeSettings = {
      url: returnUrl || "http://localhost:5173/login", // Redirect back to this URL after reset
      handleCodeInApp: false, // Use the standard Firebase Reset Page
    };

    const resetLink = await admin.auth().generatePasswordResetLink(email, actionCodeSettings);
    
    // 2. Fetch user to get their name (optional but nice for the UI)
    let displayName = "Member";
    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      displayName = userRecord.displayName || "Member";
    } catch (e) {
      // User might not exist or other error, we'll continue with "Member"
    }

    // 3. Send the custom email via Resend with the Premium Template
    await resend.emails.send({
      from: "Amit Solution Hub <support@amitsolutionhub.com>",
      to: email,
      subject: "🔒 Action Required: Reset Your SolutionHub Password",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em; text-transform: uppercase;">Solution<span style="color: #60a5fa;">Hub</span></h1>
            <p style="color: #bfdbfe; margin-top: 8px; font-size: 14px; font-weight: 500;">Secure Infrastructure & Growth Management</p>
          </div>
          
          <div style="padding: 40px 30px; background-color: white;">
            <h2 style="color: #111827; margin-top: 0; font-size: 22px; font-weight: 700;">Password Recovery</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">Hello <strong>${displayName}</strong>,</p>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">We've received a request to reset your password for your account linked to <strong>${email}</strong>. To complete this action, please use the button below:</p>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">Reset My Password</a>
            </div>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb;">
              <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0;">
                <strong>Security Alert:</strong> If you did not request this reset, please ignore this email or contact support if you have concerns. This link will remain active for 1 hour.
              </p>
            </div>
          </div>
          
          <div style="padding: 20px 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 11px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">&copy; 2026 Amit Solution Hub | Gujarat, India</p>
            <p style="color: #9ca3af; font-size: 11px; margin-top: 4px;">Verified Official Business Communication</p>
          </div>
        </div>
      `
    });

    res.json({ success: true, message: "Reset link sent to your business email." });
  } catch (error) {
    console.error("❌ CUSTOM RESET ERROR:", error);
    let errorMsg = "Failed to process request. Please ensure the email is registered.";
    if (error.code === 'auth/user-not-found') errorMsg = "No account found with this email.";
    
    res.status(500).json({ success: false, message: errorMsg });
  }
});

// --- Certificate Management System ---

/**
 * Generates a unique Certificate ID in the format AP-XXXXXXXX
 */
const generateCertificateId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing chars like O, I, 1, 0
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `AP-${result}`;
};

// Request a certificate
app.post("/api/certificates/request", async (req, res) => {
  const { userId, userName, userEmail, courseName } = req.body;

  if (!userId || !userName || !userEmail || !courseName) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    const certificatesRef = admin.firestore().collection("certificates");

    // Check if a certificate for this course already exists for this user
    const existing = await certificatesRef
      .where("userId", "==", userId)
      .where("courseName", "==", courseName)
      .get();

    if (!existing.empty) {
      return res.status(400).json({ success: false, message: "Certificate already requested/exists for this course" });
    }

    const newCert = {
      userId,
      userName,
      userEmail,
      courseName,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await certificatesRef.add(newCert);
    res.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error("❌ CERT REQUEST ERROR:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Admin: Approve/Reject Certificate
app.patch("/api/certificates/update-status", async (req, res) => {
  const { certId, status, adminId } = req.body;

  if (!certId || !status) {
    return res.status(400).json({ success: false, message: "Missing certificate ID or status" });
  }

  try {
    const certRef = admin.firestore().collection("certificates").doc(certId);
    const certSnap = await certRef.get();

    if (!certSnap.exists) {
      return res.status(404).json({ success: false, message: "Certificate not found" });
    }

    const updates = {
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (status === "approved") {
      // Generate a unique Certificate ID if it doesn't already have one
      const currentData = certSnap.data();
      if (!currentData.certificate_id) {
        let uniqueIdFound = false;
        let newId = "";

        while (!uniqueIdFound) {
          newId = generateCertificateId();
          const dupCheck = await admin.firestore().collection("certificates")
            .where("certificate_id", "==", newId)
            .get();
          if (dupCheck.empty) uniqueIdFound = true;
        }

        updates.certificate_id = newId;
        updates.approval_date = admin.firestore.FieldValue.serverTimestamp();
      }
    }

    await certRef.update(updates);
    res.json({ success: true, certificate_id: updates.certificate_id });
  } catch (error) {
    console.error("❌ CERT STATUS UPDATE ERROR:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Public: Verify Certificate
app.get("/api/certificates/verify/:certId", async (req, res) => {
  const { certId } = req.params;

  try {
    const certificatesRef = admin.firestore().collection("certificates");
    const snapshot = await certificatesRef
      .where("certificate_id", "==", certId)
      .where("status", "==", "approved")
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ success: false, message: "Invalid or unapproved Certificate ID" });
    }

    const certData = snapshot.docs[0].data();
    res.json({
      success: true,
      data: {
        name: certData.userName,
        course: certData.courseName,
        date: certData.approval_date.toDate().toLocaleDateString(),
        certificate_id: certData.certificate_id
      }
    });
  } catch (error) {
    console.error("❌ CERT VERIFY ERROR:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Server setup and listener
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running 🚀");
});
