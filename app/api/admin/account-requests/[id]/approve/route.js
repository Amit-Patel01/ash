export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongo';
import { ObjectId } from 'mongodb';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Request ID required' }, { status: 400 });
    }

    const db = await getDb();
    let query = { _id: id };
    if (ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) };
    }

    const accountReq = await db.collection('accountRequests').findOne(query);
    if (!accountReq) {
      return NextResponse.json({ success: false, message: 'Account request not found' }, { status: 404 });
    }

    // Update status to approved
    await db.collection('accountRequests').updateOne(query, {
      $set: { status: 'approved', updatedAt: new Date() },
    });

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email: accountReq.email });
    if (!existingUser) {
      await db.collection('users').insertOne({
        name: accountReq.name,
        email: accountReq.email,
        phone: accountReq.phone || '',
        role: accountReq.roleRequested || 'employee',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      await db.collection('users').updateOne(
        { email: accountReq.email },
        { $set: { role: accountReq.roleRequested || 'employee', updatedAt: new Date() } }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Account request approved successfully!',
    });
  } catch (error) {
    console.error('Approve account request error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
