require('dotenv').config();
const { sendEmail, emailTemplate } = require('../services/emailService');

async function sendEnglishNotice() {
  const recipients = [
    { name: "Kirtan tandel", email: "kirtant541@gmail.com" },
    { name: "Fahad Hayat", email: "2303031080042@paruluniversity.ac.in" },
    { name: "Tirth Kavathiya", email: "teerthkavathiya1201@gmail.com" },
    { name: "Harshil Rana", email: "ranaharsh0521@gmail.com" },
    { name: "Tejas Patil", email: "tejasspatil2601@gmail.com" },
    { name: "Suchit Parmar", email: "suchit200420@gmail.com" },
    { name: "Akshat Dave", email: "daveakshat20@gmail.com" },
    { name: "Dishant Rana", email: "ranadishant71@gmail.com" },
    { name: "Senif Vadaviya", email: "senifvadaviya817@gmail.com" },
    { name: "Parmar Mahiraj", email: "mahirajdparmar@gmail.com" },
    { name: "Amit Patel", email: "amitpatel07029@gmail.com" },
    { name: "Amit Patel", email: "amitpatel02754@gmail.com" }
  ];

  const emailSubject = "Important Announcement: System Infrastructure Upgrade & Account Deactivation Notice";
  
  const emailBody = `
    <div style="font-family: Arial, sans-serif; line-height: 1.7; color: #1e293b; max-width: 580px; margin: 0 auto;">
      <h2 style="color: #2563eb; font-size: 20px; margin-bottom: 16px;">Important Notice for Team Members</h2>
      <p style="font-size: 15px;">Dear Team Member,</p>
      
      <p style="font-size: 14px; color: #334155;">
        We would like to inform you that <strong>Amit Solution Hub Technology Pvt Ltd</strong> is currently undergoing a major system infrastructure upgrade and comprehensive platform enhancement.
      </p>
      
      <p style="font-size: 14px; color: #334155;">
        To ensure seamless database migration, data integrity, and security compliance during this transition, all current employee accounts have been temporarily deactivated and closed.
      </p>
      
      <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 14px 18px; margin: 20px 0; border-radius: 6px;">
        <p style="margin: 0; font-weight: bold; color: #0f172a; font-size: 14px;">Next Steps & What to Expect:</p>
        <ul style="margin: 8px 0 0 18px; padding: 0; color: #475569; font-size: 13.5px;">
          <li>As soon as the platform upgrade is completed, an official re-onboarding link will be sent to your email.</li>
          <li>You will be able to reactivate your account and rejoin the portal seamlessly using the new link.</li>
        </ul>
      </div>

      <p style="font-size: 14px; color: #334155;">
        We sincerely apologize for any inconvenience caused by this temporary account deactivation and appreciate your patience.
      </p>

      <p style="font-size: 14px; color: #334155;">
        Thank you for your continued dedication, support, and cooperation.
      </p>

      <br/>
      <div style="border-top: 1px solid #e2e8f0; padding-top: 14px;">
        <p style="margin: 0; font-size: 14px; font-weight: bold; color: #0f172a;">Amit Solution Hub Technology Pvt Ltd</p>
        <p style="margin: 2px 0 0; font-size: 12px; color: #64748b;">Official Administration & Engineering Team</p>
      </div>
    </div>
  `;

  console.log(`\n=== Sending Professional English Emails to ${recipients.length} Recipients ===`);
  for (const recipient of recipients) {
    console.log(`Sending to: ${recipient.email} (${recipient.name})...`);
    const result = await sendEmail({
      to: recipient.email,
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
    console.log(`Result for ${recipient.email}:`, result);
  }
  console.log('\nAll English notice emails sent successfully!');
}

sendEnglishNotice();
