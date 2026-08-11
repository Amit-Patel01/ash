export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongo';
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

export async function GET(request) {
  try {
    const db = await getDb();
    const certs = await db.collection('certificateQr').find({}).sort({ createdAt: -1 }).toArray();
    const formatted = certs.map(c => ({ ...c, id: c._id.toString(), _id: c._id.toString() }));
    return NextResponse.json({ success: true, certificates: formatted });
  } catch (error) {
    console.error('GET QR certificates error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const db = await getDb();

    const certDoc = {
      ...body,
      createdAt: body.createdAt || new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('certificateQr').insertOne(certDoc);

    return NextResponse.json({
      success: true,
      message: 'QR Certificate created successfully',
      certificate: { id: result.insertedId.toString(), ...certDoc }
    });
  } catch (error) {
    console.error('POST QR certificate error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
