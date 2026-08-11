export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongo';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'b8d7a12e4f901c56a839e2d04f11a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4';

function verifyAdmin(request) {
  try {
    const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

const getQueryId = (id) => {
  try {
    return new ObjectId(id);
  } catch {
    return id;
  }
};

export async function DELETE(request, { params }) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const resolvedParams = await params;
    const requestId = resolvedParams.id;
    if (!requestId || requestId === 'undefined') {
      return NextResponse.json({ success: false, message: 'Valid request ID required' }, { status: 400 });
    }

    const db = await getDb();
    const query = {
      $or: [
        { _id: getQueryId(requestId) },
        { _id: requestId },
        { id: requestId }
      ]
    };

    await db.collection('accountRequests').deleteOne(query);

    return NextResponse.json({ success: true, message: 'Account request deleted successfully' });
  } catch (error) {
    console.error('DELETE account request error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const resolvedParams = await params;
    const requestId = resolvedParams.id;
    const db = await getDb();
    const query = {
      $or: [
        { _id: getQueryId(requestId) },
        { _id: requestId },
        { id: requestId }
      ]
    };

    const doc = await db.collection('accountRequests').findOne(query);
    if (!doc) {
      return NextResponse.json({ success: false, message: 'Account request not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, request: { id: doc._id.toString(), ...doc } });
  } catch (error) {
    console.error('GET account request error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
