export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongo';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');

    const db = await getDb();
    let query = {};
    if (userId && role !== 'admin') {
      query.userId = userId;
    }

    const rooms = await db
      .collection('chatRooms')
      .find(query)
      .sort({ updatedAt: -1 })
      .toArray();

    const formatted = rooms.map(r => ({ ...r, id: r._id.toString(), _id: r._id.toString() }));

    return NextResponse.json({ success: true, rooms: formatted });
  } catch (error) {
    console.error('Get chat rooms error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
