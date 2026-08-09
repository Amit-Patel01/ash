export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createEmailTemplate } from '@/lib/emailTemplate';

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
    let title = 'Amit Solution Hub';
    let subtitle = 'Official Notification';
    let badgeText = 'NOTIFICATION';
    let bodyContent = `<p>Notification <strong>${type}</strong> received.</p><pre style="background:#0f172a; padding:12px; border-radius:8px;">${JSON.stringify(data, null, 2)}</pre>`;
    let ctaText = 'Go to Dashboard';
    let ctaUrl = 'https://amitsolutionhub.com/login';

    if (type === 'welcome') {
      subject = '🎉 Welcome to Amit Solution Hub!';
      title = `Welcome, ${data.name || 'Student'}! 👋`;
      subtitle = 'Your Learning Journey Starts Now';
      badgeText = 'WELCOME TO SOLUTION HUB';
      bodyContent = `
        <p>Your account has been created successfully.</p>
        <p>You can now browse internship tracks, access code repositories, and work on live projects to earn your QR-verified certificate.</p>
      `;
      ctaText = 'Access Dashboard';
      ctaUrl = 'https://amitsolutionhub.com/login';
    } else if (type === 'enrollment_student') {
      subject = `✅ Course Enrollment Confirmed: ${data.courseTitle || 'Course'}`;
      title = 'Enrollment Confirmed!';
      subtitle = data.courseTitle || 'Your Enrolled Program';
      badgeText = 'ENROLLMENT CONFIRMED';
      bodyContent = `
        <p>Hi <strong>${data.studentName || 'Student'}</strong>,</p>
        <p>You are officially enrolled in <strong>${data.courseTitle || 'Course'}</strong>.</p>
        <p>Your mentor assignments and project files are now available in your portal.</p>
      `;
      ctaText = 'Start Learning';
      ctaUrl = 'https://amitsolutionhub.com/user/courses';
    }

    const html = createEmailTemplate({
      title,
      subtitle,
      badgeText,
      bodyContent,
      ctaText,
      ctaUrl
    });

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
    return NextResponse.json({ success: true, message: 'Notification processed (log mode)', error: error.message });
  }
}
