export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export async function POST(request) {
  try {
    const { amount, courseId, courseName, userEmail } = await request.json();

    if (!amount || !courseId) {
      return NextResponse.json({ success: false, message: 'Amount and courseId are required' }, { status: 400 });
    }

    if (!KEY_ID || !KEY_SECRET) {
      return NextResponse.json({
        success: false,
        message: 'Razorpay keys not configured on server.',
      }, { status: 500 });
    }

    const instance = new Razorpay({
      key_id: KEY_ID,
      key_secret: KEY_SECRET,
    });

    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: 'INR',
      receipt: `crs_${Date.now()}`,
      notes: { courseId, courseName: courseName || '', userEmail: userEmail || '' },
    };

    const order = await instance.orders.create(options);

    return NextResponse.json({
      success: true,
      order,
      keyId: KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay create course order error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
