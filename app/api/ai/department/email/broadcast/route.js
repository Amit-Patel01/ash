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
    const { subject = 'Announcement from Amit Solution Hub', body = '' } = await request.json();

    const formattedHtml = createEmailTemplate({
      title: subject,
      subtitle: 'Official AI Broadcast Email',
      badgeText: 'ANNOUNCEMENT',
      bodyContent: body,
      ctaText: 'Visit Amit Solution Hub',
      ctaUrl: 'https://amitsolutionhub.com'
    });

    let emailSent = false;
    let message = 'Log mode (Set SMTP_PASS in .env.local to send actual Gmail emails)';

    if (SMTP_PASS) {
      try {
        await transporter.sendMail({
          from: FROM_EMAIL,
          to: ADMIN_EMAIL,
          subject,
          html: formattedHtml
        });
        emailSent = true;
        message = 'Broadcast email sent successfully via SMTP!';
      } catch (mailErr) {
        message = `SMTP Error: ${mailErr.message}`;
      }
    }

    return NextResponse.json({
      success: true,
      emailSent,
      message
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
