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

    await db.collection('accountRequests').updateOne(query, {
      $set: { status: 'rejected', updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: 'Account request rejected successfully.',
    });
  } catch (error) {
    console.error('Reject account request error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
