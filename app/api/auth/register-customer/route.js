export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '@/lib/db/mongo';

const JWT_SECRET = process.env.JWT_SECRET || 'b8d7a12e4f901c56a839e2d04f11a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4';

export async function POST(request) {
  try {
    const { name, email, password, phone } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ success: false, message: 'Name, email, and password are required.' }, { status: 400 });
    }

    const db = await getDb();
    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await db.collection('users').findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json({ success: false, message: 'An account with this email already exists.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      name: String(name).trim(),
      email: normalizedEmail,
      phone: phone || '',
      passwordHash,
      role: 'student',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('users').insertOne(newUser);
    const userId = result.insertedId.toString();

    const token = jwt.sign(
      { id: userId, email: normalizedEmail, role: 'student', name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userProfile = {
      id: userId,
      _id: userId,
      name: newUser.name,
      email: normalizedEmail,
      role: 'student',
    };

    const response = NextResponse.json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: userProfile,
      profile: userProfile,
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
    console.error('Register customer error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
