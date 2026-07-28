require("dotenv").config();
const { sendEmail, emailTemplate } = require("../services/emailService");

async function testNodemailer() {
  console.log("--------------------------------------------------");
  console.log("Testing Nodemailer Email Dispatch Service...");
  console.log("--------------------------------------------------");

  const testEmail = "amitpatel07029@gmail.com";
  console.log(`Target Recipient Email: ${testEmail}`);

  const html = emailTemplate(
    "Nodemailer System Test",
    `
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 20px;">
        <h3 style="color: #1e293b; margin-top: 0; font-size: 18px;">🎉 Nodemailer Test Email Successful!</h3>
        <p style="color: #475569; font-size: 14px;">Hello <strong>Amit Patel</strong>,</p>
        <p style="color: #475569; font-size: 14px;">Your SolutionHub email service is now running 100% on <strong>Nodemailer SMTP Engine</strong>.</p>
        <div style="margin-top: 16px; padding: 16px; background: #ffffff; border-left: 4px solid #2563eb; border-radius: 8px;">
          <p style="margin: 0; font-size: 13px; color: #1e293b; font-weight: 600;">Status: Delivered via Nodemailer</p>
          <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">Target: ${testEmail}</p>
          <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">Timestamp: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `,
    "Open SolutionHub Dashboard",
    "https://www.amitsolutionhub.com"
  );

  const result = await sendEmail({
    to: testEmail,
    subject: "✨ SolutionHub Nodemailer Test Email",
    html,
  });

  console.log("Email Dispatch Result:", result);
  console.log("--------------------------------------------------");
}

testNodemailer().then(() => {
  setTimeout(() => process.exit(0), 1000);
});
