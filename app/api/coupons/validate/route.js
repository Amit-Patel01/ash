export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongo';

export async function POST(request) {
  try {
    const { code, amount } = await request.json();

    if (!code) {
      return NextResponse.json({ success: false, message: 'Coupon code is required' }, { status: 400 });
    }

    const db = await getDb();
    const cleanCode = String(code).trim().toUpperCase();

    const coupon = await db.collection('coupons').findOne({ code: cleanCode, isActive: true });

    if (!coupon) {
      return NextResponse.json({ success: false, message: 'Invalid or expired coupon code' }, { status: 404 });
    }

    const now = new Date();
    if (coupon.validTill && new Date(coupon.validTill) < now) {
      return NextResponse.json({ success: false, message: 'Coupon has expired' }, { status: 400 });
    }

    let discountAmount = 0;
    const originalAmount = Number(amount || 0);

    if (coupon.discountType === 'percentage') {
      discountAmount = (originalAmount * Number(coupon.discountValue)) / 100;
    } else {
      discountAmount = Number(coupon.discountValue);
    }

    const finalAmount = Math.max(0, originalAmount - discountAmount);

    return NextResponse.json({
      success: true,
      message: 'Coupon applied successfully!',
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        finalAmount,
      }
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
