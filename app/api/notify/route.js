export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || 'support@amitsolutionhub.com';
const SMTP_PASS = process.env.SMTP_PASS || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'Amit Solution Hub <support@amitsolutionhub.com>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'support@amitsolutionhub.com';

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export async function POST(request) {
  try {
    const { type, data } = await request.json();

    if (!type || !data) {
      return NextResponse.json({ success: false, message: 'type and data required' }, { status: 400 });
    }

    let to = data.email || data.studentEmail || ADMIN_EMAIL;
    let subject = `Notification from SolutionHub [${type}]`;
    let html = `<p>Notification <strong>${type}</strong> received.</p><pre>${JSON.stringify(data, null, 2)}</pre>`;

    if (type === 'welcome') {
      subject = '🎉 Welcome to Amit Solution Hub!';
      html = `
        <h2>Welcome to Amit Solution Hub, ${data.name || 'Student'}! 👋</h2>
        <p>Your account has been created successfully.</p>
        <p>You can now browse courses, track projects, and earn verified certificates.</p>
      `;
    } else if (type === 'enrollment_student') {
      subject = `✅ Course Enrollment Confirmed: ${data.courseTitle || 'Course'}`;
      html = `
        <h2>Enrollment Confirmed!</h2>
        <p>Hi ${data.studentName || 'Student'}, you are enrolled in <strong>${data.courseTitle || 'Course'}</strong>.</p>
      `;
    } else if (type === 'account_request' || type === 'service_request_admin') {
      to = ADMIN_EMAIL;
      subject = `🔔 New Request Submitted: ${type}`;
      html = `
        <h2>New Request Notification</h2>
        <p>A new ${type} was submitted on SolutionHub.</p>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      `;
    }

    // Try sending email if SMTP_PASS exists
    if (SMTP_PASS) {
      await transporter.sendMail({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      });
    }

    return NextResponse.json({ success: true, message: 'Notification dispatched successfully' });
  } catch (error) {
    console.error('POST /api/notify error:', error);
    // Don't fail frontend if email sending has an error
    return NextResponse.json({ success: true, message: 'Notification processed (log mode)', error: error.message });
  }
}
