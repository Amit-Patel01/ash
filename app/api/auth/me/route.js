export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getDb } from '@/lib/db/mongo';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'b8d7a12e4f901c56a839e2d04f11a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4';

export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated.' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const db = await getDb();

    let query = { email: decoded.email };
    if (decoded.id && ObjectId.isValid(decoded.id)) {
      query = { _id: new ObjectId(decoded.id) };
    }

    const user = await db.collection('users').findOne(query, {
      projection: { passwordHash: 0, password: 0 }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User profile not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: {
        ...user,
        id: user._id.toString(),
        role: user.role || 'student',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Invalid or expired token.' },
      { status: 401 }
    );
  }
}
