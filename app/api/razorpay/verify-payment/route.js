export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'ZQL0f06MX9O2w9YShTx3bApG';

export async function POST(request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

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
      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
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
    console.error('Razorpay verify payment error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
