export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongo';

export async function DELETE(request) {
  try {
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
