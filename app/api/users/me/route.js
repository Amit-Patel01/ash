export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getDb } from '@/lib/db/mongo';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'b8d7a12e4f901c56a839e2d04f11a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4';

function getUserFromToken(request) {
  try {
    const authHeader = request.headers.get('authorization');
    let token = request.cookies.get('token')?.value;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function GET(request) {
  try {
    const decoded = getUserFromToken(request);
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Not authenticated.' }, { status: 401 });
    }

    const db = await getDb();
    let query = { email: decoded.email?.toLowerCase() };
    if (decoded.id && ObjectId.isValid(decoded.id)) {
      query = { _id: new ObjectId(decoded.id) };
    }

    const user = await db.collection('users').findOne(query, {
      projection: { passwordHash: 0, password: 0 }
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User profile not found.' }, { status: 404 });
    }

    const profile = {
      ...user,
      id: user._id.toString(),
      _id: user._id.toString(),
      role: user.role || 'student',
    };

    return NextResponse.json({ success: true, profile, user: profile });
  } catch (error) {
    console.error('GET /api/users/me error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const decoded = getUserFromToken(request);
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Not authenticated.' }, { status: 401 });
    }

    const body = await request.json();
    const db = await getDb();

    let query = { email: decoded.email?.toLowerCase() };
    if (decoded.id && ObjectId.isValid(decoded.id)) {
      query = { _id: new ObjectId(decoded.id) };
    }

    const { id, _id, password, passwordHash, ...updateData } = body;
    updateData.updatedAt = new Date();

    await db.collection('users').updateOne(query, { $set: updateData });
    const updatedUser = await db.collection('users').findOne(query, {
      projection: { passwordHash: 0, password: 0 }
    });

    const profile = {
      ...updatedUser,
      id: updatedUser._id.toString(),
      _id: updatedUser._id.toString(),
      role: updatedUser.role || 'student',
    };

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully.',
      profile,
      user: profile,
    });
  } catch (error) {
    console.error('PATCH /api/users/me error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
