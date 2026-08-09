export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongo';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email query parameter required' }, { status: 400 });
    }

    const db = await getDb();
    const user = await db.collection('users').findOne(
      { email: String(email).trim().toLowerCase() },
      { projection: { passwordHash: 0, password: 0 } }
    );

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 444 });
    }

    return NextResponse.json({
      success: true,
      user: { ...user, id: user._id.toString() },
    });
  } catch (error) {
    console.error('Admin user lookup error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
