export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getDb } from '@/lib/db/mongo';

const JWT_SECRET = process.env.JWT_SECRET || 'b8d7a12e4f901c56a839e2d04f11a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const host = request.headers.get('host') || 'www.amitsolutionhub.com';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const appUrl = `${protocol}://${host}`;

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/auth-callback?error=${encodeURIComponent(error || 'google_denied')}`);
  }

  try {
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL || `${appUrl}/api/auth/google/callback`;

    // 1. Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('Google token exchange error:', tokenData);
      return NextResponse.redirect(`${appUrl}/auth-callback?error=google_token_failed`);
    }

    // 2. Fetch User Profile from Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const googleUser = await userRes.json();

    if (!googleUser.email) {
      return NextResponse.redirect(`${appUrl}/auth-callback?error=google_no_email`);
    }

    const normalizedEmail = googleUser.email.trim().toLowerCase();
    const db = await getDb();

    const ADMIN_EMAILS = [
      (process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
      'support@amitsolutionhub.com',
      'amitpatel07029@gmail.com',
    ].filter(Boolean);

    const isAdmin = ADMIN_EMAILS.includes(normalizedEmail);

    let user = await db.collection('users').findOne({ email: normalizedEmail });

    if (!user) {
      const newUser = {
        email: normalizedEmail,
        name: googleUser.name || googleUser.given_name || normalizedEmail.split('@')[0],
        displayName: googleUser.name || googleUser.given_name || normalizedEmail.split('@')[0],
        photoURL: googleUser.picture || '',
        avatar: googleUser.picture || '',
        role: isAdmin ? 'admin' : 'student',
        status: 'active',
        authProvider: 'google',
        googleId: googleUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await db.collection('users').insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
    } else {
      const updates = {
        googleId: googleUser.id,
        authProvider: user.authProvider || 'google',
        updatedAt: new Date(),
      };
      if (googleUser.picture && !user.avatar && !user.photoURL) {
        updates.avatar = googleUser.picture;
        updates.photoURL = googleUser.picture;
      }
      if (isAdmin && user.role !== 'admin') {
        updates.role = 'admin';
        user.role = 'admin';
      }
      await db.collection('users').updateOne({ _id: user._id }, { $set: updates });
    }

    if (user.status === 'terminated' || user.isTerminated) {
      return NextResponse.redirect(`${appUrl}/auth-callback?error=account_inactive`);
    }

    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role || 'student',
      name: user.name || user.displayName || '',
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    const response = NextResponse.redirect(`${appUrl}/auth-callback?token=${encodeURIComponent(token)}`);
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return NextResponse.redirect(`${appUrl}/auth-callback?error=google_server_error`);
  }
}
