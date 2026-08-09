export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongo';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const certId = resolvedParams.id;

    if (!certId) {
      return NextResponse.json({ success: false, message: 'Certificate ID required' }, { status: 400 });
    }

    const db = await getDb();

    // Check in 'qrCertificates' collection
    let cert = await db.collection('qrCertificates').findOne({
      $or: [
        { certificateId: certId },
        { id: certId },
        { docId: certId },
        ...(ObjectId.isValid(certId) ? [{ _id: new ObjectId(certId) }] : [{ _id: certId }])
      ]
    });

    // Check in 'certificates' collection
    if (!cert) {
      cert = await db.collection('certificates').findOne({
        $or: [
          { certificateId: certId },
          { id: certId },
          ...(ObjectId.isValid(certId) ? [{ _id: new ObjectId(certId) }] : [{ _id: certId }])
        ]
      });
    }

    if (!cert) {
      return NextResponse.json({
        success: false,
        valid: false,
        message: 'Certificate not found or unverified.',
      }, { status: 404 });
    }

    const formatted = {
      ...cert,
      id: cert._id.toString(),
      _id: cert._id.toString(),
    };

    return NextResponse.json({
      success: true,
      valid: true,
      certificate: formatted,
    });
  } catch (error) {
    console.error('Certificate verification error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
