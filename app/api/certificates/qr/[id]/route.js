export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongo';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'b8d7a12e4f901c56a839e2d04f11a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4';

function verifyAuth(request) {
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
    const auth = verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const resolvedParams = await params;
    const docId = resolvedParams.id;
    if (!docId || docId === 'undefined') {
      return NextResponse.json({ success: false, message: 'Valid certificate ID required' }, { status: 400 });
    }

    const db = await getDb();
    const query = {
      $or: [
        { _id: getQueryId(docId) },
        { _id: docId },
        { id: docId },
        { certificateId: docId }
      ]
    };

    await db.collection('certificateQr').deleteOne(query);

    return NextResponse.json({ success: true, message: 'QR Certificate deleted successfully' });
  } catch (error) {
    console.error('DELETE QR certificate error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
