require('dotenv').config();
const { MongoClient } = require('mongodb');
const { sendEmail, emailTemplate } = require('../services/emailService');

async function notifyFiredEmployees() {
  const uri = process.env.MONGODB_URI_ATLAS || process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('solutionhub');

    // List of additional fired/former employees from accountRequests & team
    const additionalEmployees = [
      { name: "Dishant Rana", email: "ranadishant71@gmail.com", role: "Support Agent" },
      { name: "Senif Vadaviya", email: "senifvadaviya817@gmail.com", role: "Developer" },
      { name: "PARMAR MAHIRAJ DAXESHKUMAR", email: "mahirajdparmar@gmail.com", role: "Developer" }
    ];

    const excludedEmails = [
      'support@amitsolutionhub.com',
      'naivedhpatel2518@gmail.com',
      'amitpatel07029@gmail.com',
      'amitpatel02754@gmail.com'
    ];

    const targetList = additionalEmployees.filter(e => {
      const email = e.email.toLowerCase();
      return !excludedEmails.includes(email) && !email.includes('admin') && !email.includes('naivedh') && !email.includes('amit');
    });

    console.log(`\nFound ${targetList.length} additional former/fired employee accounts to notify:`);
    targetList.forEach((e, i) => {
      console.log(`[${i+1}] Name: "${e.name}" | Email: "${e.email}" | Role: "${e.role}"`);
    });

    const emailSubject = "Important Update: Company System Upgrade & Account Notice";
    const emailBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2563eb;">Important Notice for Team Members</h2>
        <p>Dear Team Member,</p>
        <p>Company me ek naya aur bada system update aane wala hai. Is upgrade process ke karan aapka employee account status update kar diya gaya hai.</p>
        <p><strong>Aage ka process:</strong></p>
        <ul>
          <li>Jaise hi system upgrade complete ho jayega, hum aapko email dwara ek naya registration/login link bhejenge.</li>
          <li>Uss link se aap fir se apna account join aur activate kar sakenge.</li>
        </ul>
        <p>Account update/delete karne ke karan hue kisi bhi asuvidha ke liye hum dil se mafi chahte hain.</p>
        <p>Aapke sahyog aur samarthan ke liye dhanyawad!</p>
        <br/>
        <p>Best regards,<br/><strong>Amit Solution Hub Technology Pvt Ltd</strong></p>
      </div>
    `;

    console.log('\n--- Sending Emails ---');
    for (const emp of targetList) {
      console.log(`Sending email to: ${emp.email} (${emp.name})...`);
      const result = await sendEmail({
        to: emp.email,
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
      console.log(`Result for ${emp.email}:`, result);
    }

    // Also remove their entries from accountRequests if any
    const emailsToRemove = targetList.map(e => e.email);
    const deleteReqResult = await db.collection('accountRequests').deleteMany({ email: { $in: emailsToRemove } });
    console.log(`Cleaned up ${deleteReqResult.deletedCount} account requests from MongoDB.`);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

notifyFiredEmployees();
