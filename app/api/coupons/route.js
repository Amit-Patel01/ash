export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongo';

export async function GET() {
  try {
    const db = await getDb();
    const coupons = await db.collection('coupons').find({}).toArray();
    const formatted = coupons.map(c => ({ ...c, id: c._id.toString(), _id: c._id.toString() }));
    return NextResponse.json({ success: true, coupons: formatted });
  } catch (error) {
    console.error('GET coupons error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { code, discount, discountType, validUntil, maxUses } = body;

    if (!code || !discount) {
      return NextResponse.json({ success: false, message: 'Coupon code and discount required' }, { status: 400 });
    }

    const db = await getDb();
    const couponDoc = {
      code: String(code).trim().toUpperCase(),
      discount: Number(discount),
      discountType: discountType || 'percentage',
      validUntil: validUntil ? new Date(validUntil) : null,
      maxUses: maxUses ? Number(maxUses) : null,
      usedCount: 0,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('coupons').insertOne(couponDoc);

    return NextResponse.json({
      success: true,
      message: 'Coupon created successfully!',
      coupon: { id: result.insertedId.toString(), ...couponDoc },
    });
  } catch (error) {
    console.error('POST coupon error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
