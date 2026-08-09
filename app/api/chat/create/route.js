export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongo';

export async function POST(request) {
  try {
    const { userId, userEmail, userName, category, subject } = await request.json();

    const db = await getDb();
    const chatRoom = {
      userId: userId || 'guest',
      userEmail: userEmail || 'guest@solutionhub.com',
      userName: userName || 'Guest User',
      category: category || 'general',
      subject: subject || 'Support Ticket',
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('chatRooms').insertOne(chatRoom);
    const chatId = result.insertedId.toString();

    return NextResponse.json({
      success: true,
      chatId,
      room: { id: chatId, ...chatRoom },
    });
  } catch (error) {
    console.error('Chat create error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
