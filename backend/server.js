const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend Live 🚀");
});

const resend = new Resend(process.env.RESEND_API_KEY);

app.post("/contact", async (req, res) => {
  const { firstName, lastName, email, message } = req.body;

  try {
    // 1️⃣ Mail to YOU (Admin notification)
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "amitpatel07029@gmail.com",
      subject: `New Contact from ${firstName}`,
      text: `
Name: ${firstName} ${lastName}
Email: ${email}
Message: ${message}
      `
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
    res.json({ success: true });

  } catch (error) {
    console.error("MAIL ERROR:", error);
    res.status(500).json({ success: false });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running 🚀");
});