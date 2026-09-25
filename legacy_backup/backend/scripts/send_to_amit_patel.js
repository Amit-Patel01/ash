require('dotenv').config();
const { sendEmail, emailTemplate } = require('../services/emailService');

async function sendToAmitPatel() {
  const targetEmails = [
    'amitpatel07029@gmail.com',
    'amitpatel02754@gmail.com'
  ];

  const emailSubject = "Important Update: Company System Upgrade & Account Notice";
  const emailBody = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #2563eb;">Important Notice for Team Members</h2>
      <p>Dear Amit Patel,</p>
      <p>Company me ek naya aur bada system update aane wala hai. Is upgrade process ke karan system maintenance & account update notice bheja ja raha hai.</p>
      <p><strong>Aage ka process:</strong></p>
      <ul>
        <li>Jaise hi system upgrade complete ho jayega, hum aapko email dwara ek naya registration/login link bhejenge.</li>
        <li>Uss link se aap fir se apna account join aur activate kar sakenge.</li>
      </ul>
      <p>Aapke sahyog aur samarthan ke liye dhanyawad!</p>
      <br/>
      <p>Best regards,<br/><strong>Ashnexa Systems Pvt Ltd</strong></p>
    </div>
  `;

  console.log('\n--- Sending Notice to Amit Patel ---');
  for (const email of targetEmails) {
    console.log(`Sending email to: ${email}...`);
    const result = await sendEmail({
      to: email,
      subject: emailSubject,
      html: emailTemplate(
        emailSubject,
        emailBody,
        null,
        null,
        '#2563eb',
        'SYSTEM UPGRADE NOTICE'
      )
    });
    console.log(`Result for ${email}:`, result);
  }
}

sendToAmitPatel();
