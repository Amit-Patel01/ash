export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongo';
import bcrypt from 'bcryptjs';
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

export async function GET(request) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
    }

    const db = await getDb();
    const users = await db.collection('users').find({}, { projection: { passwordHash: 0, password: 0 } }).toArray();
    const formatted = users.map(u => ({ ...u, id: u._id.toString(), _id: u._id.toString() }));

    return NextResponse.json({ success: true, users: formatted });
  } catch (error) {
    console.error('Admin GET users error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, name, displayName, role = 'student', ...rest } = body;

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    const db = await getDb();
    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await db.collection('users').findOne({ email: normalizedEmail });
    if (existing) {
      const updateDoc = {
        name: name || displayName || existing.name || existing.displayName || '',
        displayName: displayName || name || existing.displayName || existing.name || '',
        role: role || existing.role || 'employee',
        status: 'active',
        isTerminated: false,
        fireReason: null,
        ...rest,
        updatedAt: new Date(),
      };

      if (password) {
        updateDoc.passwordHash = await bcrypt.hash(password, 10);
      }

      await db.collection('users').updateOne({ _id: existing._id }, { $set: updateDoc });
      const updated = await db.collection('users').findOne(
        { _id: existing._id },
        { projection: { passwordHash: 0, password: 0 } }
      );

      return NextResponse.json({
        success: true,
        message: 'Existing user updated to staff successfully.',
        user: { ...updated, id: updated._id.toString(), _id: updated._id.toString() }
      }, { status: 200 });
    }

    const userDoc = {
      email: normalizedEmail,
      name: name || displayName || '',
      displayName: displayName || name || '',
      role,
      status: 'active',
      ...rest,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (password) {
      userDoc.passwordHash = await bcrypt.hash(password, 10);
    }

    const result = await db.collection('users').insertOne(userDoc);
    const { passwordHash: _, ...safeUser } = userDoc;

    return NextResponse.json({
      success: true,
      message: 'User created successfully.',
      user: { id: result.insertedId.toString(), _id: result.insertedId.toString(), ...safeUser }
    }, { status: 201 });
  } catch (error) {
    console.error('Admin POST create user error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
