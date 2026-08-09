export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb } from '@/lib/db/mongo';
import nodemailer from 'nodemailer';
import { createEmailTemplate } from '@/lib/emailTemplate';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || 'support@amitsolutionhub.com';
const SMTP_PASS = process.env.SMTP_PASS || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'Amit Solution Hub <support@amitsolutionhub.com>';

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
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    const db = await getDb();
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await db.collection('users').findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been generated.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { resetToken, resetExpires, updatedAt: new Date() } }
    );

    const appUrl = process.env.APP_URL || process.env.FRONTEND_URL || 'https://amitsolutionhub.com';
    const resetUrl = `${appUrl.replace(/\/+$/, '')}/reset-password?token=${resetToken}`;

    const resetEmailHtml = createEmailTemplate({
      title: 'Reset Your Password',
      subtitle: `Account Security Request for ${normalizedEmail}`,
      badgeText: 'SECURITY VERIFICATION',
      bodyContent: `
        <p>We received a request to reset the password for your <strong>Amit Solution Hub</strong> account.</p>
        <p>Click the button below to choose a new password. This link is valid for 1 hour.</p>
        <p style="font-size: 12px; color: #94a3b8;">If you did not request a password reset, you can safely ignore this email.</p>
      `,
      ctaText: 'Reset My Password',
      ctaUrl: resetUrl
    });

    if (SMTP_PASS) {
      try {
        await transporter.sendMail({
          from: FROM_EMAIL,
          to: normalizedEmail,
          subject: '🔒 Reset Your Password - Amit Solution Hub',
          html: resetEmailHtml,
        });
      } catch (mailErr) {
        console.error('Failed to send reset email via SMTP:', mailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset instructions sent successfully.',
      resetToken,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
