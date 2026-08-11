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
    const decoded = jwt.verify(token, JWT_SECRET);
    return (decoded.role === 'admin' || decoded.role === 'superadmin') ? decoded : null;
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

export async function GET(request, { params }) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
    }

    const resolvedParams = await params;
    const userId = resolvedParams.id;
    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID required' }, { status: 400 });
    }

    const db = await getDb();
    const query = {
      $or: [
        { _id: getQueryId(userId) },
        { _id: userId },
        { uid: userId },
        { id: userId },
        { email: userId.toLowerCase() }
      ]
    };

    const user = await db.collection('users').findOne(query, { projection: { passwordHash: 0, password: 0 } });
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const formatted = { ...user, id: user._id.toString(), _id: user._id.toString() };
    return NextResponse.json({ success: true, user: formatted });
  } catch (error) {
    console.error('Admin GET user by ID error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
    }

    const resolvedParams = await params;
    const userId = resolvedParams.id;
    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID required' }, { status: 400 });
    }

    const updates = await request.json();
    const db = await getDb();

    const query = {
      $or: [
        { _id: getQueryId(userId) },
        { _id: userId },
        { uid: userId },
        { id: userId },
        { email: userId.toLowerCase() }
      ]
    };

    const { id, _id, password, passwordHash, ...cleanUpdates } = updates;
    cleanUpdates.updatedAt = new Date();

    const result = await db.collection('users').findOneAndUpdate(
      query,
      { $set: cleanUpdates },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const formatted = { ...result, id: result._id.toString(), _id: result._id.toString() };
    return NextResponse.json({ success: true, message: 'User updated successfully', user: formatted });
  } catch (error) {
    console.error('Admin PATCH user error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
    }

    const resolvedParams = await params;
    const userId = resolvedParams.id;
    if (!userId || userId === 'undefined') {
      return NextResponse.json({ success: false, message: 'Valid user ID required' }, { status: 400 });
    }

    const db = await getDb();
    const query = {
      $or: [
        { _id: getQueryId(userId) },
        { _id: userId },
        { uid: userId },
        { id: userId },
        { email: userId.toLowerCase() }
      ]
    };

    const user = await db.collection('users').findOne(query);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    await db.collection('users').deleteOne(query);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
      user: { id: user._id.toString(), email: user.email, name: user.name || user.displayName }
    });
  } catch (error) {
    console.error('Admin DELETE user error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
