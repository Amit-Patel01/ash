export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongo';

export async function GET() {
  try {
    const db = await getDb();
    const users = await db.collection('users').find({}, {
      projection: { passwordHash: 0, password: 0 }
    }).toArray();

    const formatted = users.map(u => ({
      ...u,
      id: u._id.toString(),
      _id: u._id.toString(),
    }));

    return NextResponse.json({ success: true, users: formatted });
  } catch (error) {
    console.error('GET /api/users/chat-contacts error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
