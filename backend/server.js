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
      from: "onboarding@resend.dev",
      to: email,
      subject: "Thank you for contacting Amit Solution Hub",
      text: `
Hello ${firstName},

Thank you for contacting Amit Solution Hub.
We have received your message and will get back to you shortly.

Best Regards,
Amit Patel
AmitSolutionHub.com
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