export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { getDb } from '@/lib/db/mongo';
import { sendEmail } from '@/lib/email';
import { createEmailTemplate } from '@/lib/emailTemplate';

const JWT_SECRET = process.env.JWT_SECRET || 'b8d7a12e4f901c56a839e2d04f11a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4';

export async function POST(request) {
  try {
    const { name, email, password, phone, interestTrack, location } = await request.json();

    if (!email || !name) {
      return NextResponse.json({ success: false, message: 'Name and email are required.' }, { status: 400 });
    }

    const db = await getDb();
    const normalizedEmail = String(email).trim().toLowerCase();
    const trimmedName = String(name).trim();

    const existingUser = await db.collection('users').findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'An account with this email already exists. Please log in or use Forgot Password.'
      }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || process.env.FRONTEND_URL || 'https://www.ashnexasystems.com';
    const cleanAppUrl = appUrl.replace(/\/+$/, '');

    const newUser = {
      name: trimmedName,
      displayName: trimmedName,
      email: normalizedEmail,
      phone: phone || '',
      interestTrack: interestTrack || '',
      location: location || '',
      role: 'student',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (password) {
      newUser.passwordHash = await bcrypt.hash(password, 10);
    } else {
      // Generate activation token for password creation
      const resetToken = crypto.randomBytes(32).toString('hex');
      newUser.resetToken = resetToken;
      newUser.resetExpires = new Date(Date.now() + 86400000); // 24 hours

      // Send welcome activation email
      const activationUrl = `${cleanAppUrl}/reset-password?token=${resetToken}`;
      const welcomeHtml = createEmailTemplate({
        title: 'Welcome to Ashnexa Systems!',
        subtitle: `Hello ${trimmedName}, your student account is ready.`,
        badgeText: 'ACCOUNT CREATED',
        bodyContent: `
          <p>Thank you for joining <strong>Ashnexa Systems</strong>!</p>
          <p>To secure your account and access your dashboard, projects, and courses, please click the button below to set up your password.</p>
          <div style="background-color: #f8fafc; border-left: 4px solid #6366f1; padding: 12px 16px; margin: 16px 0; border-radius: 6px;">
            <p style="margin: 0; font-size: 13px; color: #475569;"><strong>Email:</strong> ${normalizedEmail}</p>
            <p style="margin: 4px 0 0; font-size: 13px; color: #475569;"><strong>Primary Interest:</strong> ${interestTrack || 'Engineering & Projects'}</p>
          </div>
        `,
        ctaText: 'Set Account Password',
        ctaUrl: activationUrl,
      });

      sendEmail({
        to: normalizedEmail,
        subject: '🎉 Welcome to Ashnexa Systems - Set Up Your Password',
        html: welcomeHtml,
      }).catch(err => console.warn('Welcome activation email failed:', err.message));
    }

    const result = await db.collection('users').insertOne(newUser);
    const userId = result.insertedId.toString();

    const token = jwt.sign(
      { id: userId, email: normalizedEmail, role: 'student', name: trimmedName },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userProfile = {
      id: userId,
      _id: userId,
      name: trimmedName,
      displayName: trimmedName,
      email: normalizedEmail,
      phone: newUser.phone,
      role: 'student',
    };

    const response = NextResponse.json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: userProfile,
      profile: userProfile,
    }, { status: 201 });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Register customer error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
