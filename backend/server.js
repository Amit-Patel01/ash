const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send("Backend Live 🚀");
});

// ✅ Transporter OUTSIDE route (better performance)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

app.post('/contact', async (req, res) => {
  const { firstName, lastName, email, message } = req.body;

  try {
    await transporter.sendMail({
      from: `"AmitSolutionHub" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: email,
      subject: `New Contact from ${firstName}`,
      text: `
Name: ${firstName} ${lastName}
Email: ${email}
Message: ${message}
      `
    });

    res.status(200).json({ success: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});