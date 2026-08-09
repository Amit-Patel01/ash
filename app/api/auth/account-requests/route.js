export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongo';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, roleRequested, reason, category } = body;

    if (!name || !email) {
      return NextResponse.json({ success: false, message: 'Name and email are required' }, { status: 400 });
    }

    const db = await getDb();
    const requestDoc = {
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: phone || '',
      roleRequested: roleRequested || 'employee',
      category: category || 'general',
      reason: reason || '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('accountRequests').insertOne(requestDoc);

    return NextResponse.json({
      success: true,
      message: 'Account request submitted successfully! Admin will review your application.',
      id: result.insertedId.toString(),
    });
  } catch (error) {
    console.error('Account request error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
