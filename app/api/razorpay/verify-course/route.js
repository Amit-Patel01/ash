export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb } from '@/lib/db/mongo';

const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'ZQL0f06MX9O2w9YShTx3bApG';

export async function POST(request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId, userId, userEmail } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ success: false, message: 'Invalid payment parameters' }, { status: 400 });
    }

    if (!KEY_SECRET) {
      return NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', KEY_SECRET)
      .update(body)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Record enrollment in MongoDB
      try {
        const db = await getDb();
        await db.collection('enrollments').insertOne({
          courseId: courseId || '',
          userId: userId || '',
          userEmail: userEmail || '',
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          status: 'paid',
          createdAt: new Date(),
        });
      } catch (dbErr) {
        console.warn('Could not record course enrollment in DB:', dbErr);
      }

      return NextResponse.json({
        success: true,
        message: 'Course payment verified successfully!',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Payment signature verification failed',
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Razorpay verify course error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
