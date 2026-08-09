export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db/mongo';

export async function POST(request) {
  try {
    const { token, password } = await request.json();
    if (!token || !password) {
      return NextResponse.json({ success: false, message: 'Token and new password are required' }, { status: 400 });
    }

    const db = await getDb();
    const user = await db.collection('users').findOne({
      resetToken: token,
      resetExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid or expired reset token.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: { passwordHash, updatedAt: new Date() },
        $unset: { resetToken: "", resetExpires: "" },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
