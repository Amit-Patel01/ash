const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/contact', async (req, res) => {
  const { firstName, lastName, email, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'amitpatel07029@gmail.com',
        pass: 'qhsszgjvfznvswlf'
      }
    });

    await transporter.sendMail({
      from: email,
      to: 'amitpatel07029@gmail.com',
      subject: 'New Contact Message',
      text: `
        Name: ${firstName} ${lastName}
        Email: ${email}
        Message: ${message}
      `
    });

    res.status(200).json({ success: true, message: "Message Sent" });

  } catch (error) {
    res.status(500).json({ success: false, message: "Error sending message" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));