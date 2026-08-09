export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongo';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json({ success: false, message: 'chatId parameter required' }, { status: 400 });
    }

    const db = await getDb();
    const messages = await db
      .collection('chatMessages')
      .find({ chatId })
      .sort({ timestamp: 1 })
      .toArray();

    const formatted = messages.map(m => ({ ...m, id: m._id.toString(), _id: m._id.toString() }));

    return NextResponse.json({ success: true, messages: formatted });
  } catch (error) {
    console.error('Get chat messages error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
