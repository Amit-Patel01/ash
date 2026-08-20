export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '@/lib/db/mongo';

const JWT_SECRET = process.env.JWT_SECRET || 'b8d7a12e4f901c56a839e2d04f11a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await db.collection('users').findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    if (!user.passwordHash && !user.password) {
      return NextResponse.json(
        { success: false, message: 'No password has been set for this account yet. Please click "Forgot Password?" to set your password.' },
        { status: 401 }
      );
    }

    let isValidPassword = false;
    if (user.passwordHash) {
      try {
        isValidPassword = await bcrypt.compare(password, user.passwordHash);
      } catch (e) {
        console.warn('bcrypt compare error:', e);
      }
    }

    if (!isValidPassword && user.password) {
      if (user.password === password) {
        isValidPassword = true;
        try {
          const newHash = await bcrypt.hash(password, 10);
          await db.collection('users').updateOne({ _id: user._id }, { $set: { passwordHash: newHash, updatedAt: new Date() } });
        } catch (e) {
          console.warn('Failed to upgrade password hash:', e);
        }
      } else {
        try {
          isValidPassword = await bcrypt.compare(password, user.password);
        } catch {}
      }
    }

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const userRole = user.role || 'student';
    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: userRole,
      name: user.name || user.displayName || '',
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    const response = NextResponse.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name || user.displayName || '',
        role: userRole,
      },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error during login.' },
      { status: 500 }
    );
  }
}
