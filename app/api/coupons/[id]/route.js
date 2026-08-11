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
    const couponId = resolvedParams.id;
    if (!couponId || couponId === 'undefined') {
      return NextResponse.json({ success: false, message: 'Valid coupon ID required' }, { status: 400 });
    }

    const db = await getDb();
    const query = {
      $or: [
        { _id: getQueryId(couponId) },
        { _id: couponId },
        { id: couponId },
        { code: couponId.toUpperCase() }
      ]
    };

    await db.collection('coupons').deleteOne(query);

    return NextResponse.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('DELETE coupon error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const auth = verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const resolvedParams = await params;
    const couponId = resolvedParams.id;
    const body = await request.json();
    const db = await getDb();

    const query = {
      $or: [
        { _id: getQueryId(couponId) },
        { _id: couponId },
        { id: couponId },
        { code: couponId.toUpperCase() }
      ]
    };

    const { id, _id, ...updateFields } = body;
    if (updateFields.code) updateFields.code = String(updateFields.code).trim().toUpperCase();
    if (updateFields.discount) updateFields.discount = Number(updateFields.discount);
    updateFields.updatedAt = new Date();

    await db.collection('coupons').updateOne(query, { $set: updateFields });

    return NextResponse.json({ success: true, message: 'Coupon updated successfully' });
  } catch (error) {
    console.error('PATCH coupon error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const couponId = resolvedParams.id;
    const db = await getDb();

    const query = {
      $or: [
        { _id: getQueryId(couponId) },
        { _id: couponId },
        { id: couponId },
        { code: couponId.toUpperCase() }
      ]
    };

    const coupon = await db.collection('coupons').findOne(query);
    if (!coupon) {
      return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, coupon: { id: coupon._id.toString(), ...coupon } });
  } catch (error) {
    console.error('GET coupon error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
