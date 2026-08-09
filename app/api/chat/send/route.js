export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongo';

export async function POST(request) {
  try {
    const { chatId, senderId, senderName, senderRole, message, attachments } = await request.json();

    if (!chatId || !message) {
      return NextResponse.json({ success: false, message: 'ChatId and message are required' }, { status: 400 });
    }

    const db = await getDb();
    const msgDoc = {
      chatId,
      senderId: senderId || 'user',
      senderName: senderName || 'User',
      senderRole: senderRole || 'user',
      message,
      attachments: attachments || [],
      timestamp: new Date(),
    };

    const result = await db.collection('chatMessages').insertOne(msgDoc);

    // Update last active on room
    try {
      const { ObjectId } = await import('mongodb');
      if (ObjectId.isValid(chatId)) {
        await db.collection('chatRooms').updateOne(
          { _id: new ObjectId(chatId) },
          { $set: { updatedAt: new Date(), lastMessage: message } }
        );
      }
    } catch {}

    return NextResponse.json({
      success: true,
      message: { id: result.insertedId.toString(), ...msgDoc },
    });
  } catch (error) {
    console.error('Chat send error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
