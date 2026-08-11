export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongo';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'b8d7a12e4f901c56a839e2d04f11a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4';

function verifyAdmin(request) {
  try {
    const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET);
    return (decoded.role === 'admin' || decoded.role === 'superadmin') ? decoded : null;
  } catch {
    return null;
  }
}

export async function DELETE(request) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email required' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection('users').deleteOne({ email: String(email).trim().toLowerCase() });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Admin delete user by email error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
