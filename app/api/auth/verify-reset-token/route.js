export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongo';

export async function POST(request) {
  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ success: false, message: 'Reset token is required' }, { status: 400 });
    }

    const db = await getDb();
    const user = await db.collection('users').findOne({
      resetToken: token,
      resetExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid or expired reset token.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      email: user.email,
    });
  } catch (error) {
    console.error('Verify reset token error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
