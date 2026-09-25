require('dotenv').config();
const { MongoClient } = require('mongodb');
const { sendEmail, emailTemplate } = require('../services/emailService');

async function processEmployees() {
  const uri = process.env.MONGODB_URI_ATLAS || process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('solutionhub');
    const usersColl = db.collection('users');

    // Get all users
    const allUsers = await usersColl.find({}).toArray();

    // Filter employees except admin, naivedh, amit patel
    const excludedEmails = [
      'support@Ashnexa Systems.com',
      'naivedhpatel2518@gmail.com',
      'amitpatel07029@gmail.com',
      'amitpatel02754@gmail.com'
    ];

    const isExcluded = (u) => {
      const email = (u.email || '').toLowerCase();
      const name = (u.displayName || u.name || u.fullName || '').toLowerCase();
      
      if (excludedEmails.includes(email)) return true;
      if (email.includes('admin') || name.includes('admin')) return true;
      if (email.includes('naivedh') || name.includes('naivedh')) return true;
      if (email.includes('amit') || name.includes('amit patel')) return true;
      return false;
    };

    // Employee roles: 'employee', 'Developer', or any team member
    const employeesToNotify = allUsers.filter(u => {
      const role = (u.role || '').toLowerCase();
      const isEmp = role === 'employee' || role === 'developer';
      return isEmp && !isExcluded(u);
    });

    console.log(`\nFound ${employeesToNotify.length} employee accounts to notify & close:`);
    employeesToNotify.forEach((e, idx) => {
      console.log(`${idx + 1}. Name: "${e.displayName || e.name || 'N/A'}" | Email: "${e.email}" | Role: "${e.role}"`);
    });

    if (employeesToNotify.length === 0) {
      console.log('No employee accounts found matching the criteria.');
      return;
    }

    const emailSubject = "Important Update: Company System Upgrade & Account Notice";
    const emailBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2563eb;">Important Notice for Team Members</h2>
        <p>Dear Team Member,</p>
        <p>Company me ek naya aur bada system update aane wala hai. Is upgrade process ke karan aapka current employee account filhal close/delete kar diya gaya hai.</p>
        <p><strong>Aage ka process:</strong></p>
        <ul>
          <li>Jaise hi system upgrade complete ho jayega, hum aapko email dwara ek naya registration/login link bhejenge.</li>
          <li>Uss link se aap fir se apna account join aur activate kar sakenge.</li>
        </ul>
        <p>Account delete karne ke karan hue kisi bhi asuvidha ke liye hum dil se mafi chahte hain.</p>
        <p>Aapke sahyog aur samarthan ke liye dhanyawad!</p>
        <br/>
        <p>Best regards,<br/><strong>Ashnexa Systems Pvt Ltd</strong></p>
      </div>
    `;

    console.log('\n--- Sending Emails ---');
    for (const emp of employeesToNotify) {
      console.log(`Sending email to: ${emp.email} (${emp.displayName || emp.name})...`);
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

    // Delete/deactivate employee accounts from DB as requested ("account bandh kr diye hain / account delete")
    console.log('\n--- Deleting / Closing Employee Accounts in MongoDB ---');
    const uidsToDelete = employeesToNotify.map(e => e._id);
    const deleteResult = await usersColl.deleteMany({ _id: { $in: uidsToDelete } });
    console.log(`Deleted ${deleteResult.deletedCount} employee accounts from MongoDB.`);

  } catch (err) {
    console.error('Error executing employee notification & account cleanup:', err);
  } finally {
    await client.close();
  }
}

processEmployees();
