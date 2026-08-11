export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongo';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'b8d7a12e4f901c56a839e2d04f11a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4';

const PUBLIC_GET_COLLECTIONS = new Set(['courses', 'courseCategories', 'internshipCategories', 'projects', 'services', 'settings', 'tradingSettings', 'team', 'faqs', 'certificates', 'certificateQr', 'testimonials', 'coupons']);

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

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.slug || [];
    const collectionName = slug[0];
    const docId = slug[1];

    if (!collectionName) {
      return NextResponse.json({ success: false, message: 'Collection required' }, { status: 400 });
    }

    const auth = verifyAuth(request);
    if (!PUBLIC_GET_COLLECTIONS.has(collectionName) && !auth) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const db = await getDb();

    // 1. Single document query: /api/db/:collection/:id
    if (docId) {
      let query;

      // Handle sub-keys in settings collection, e.g., /api/db/settings/maintenance
      if (collectionName === 'settings' || collectionName === 'tradingSettings') {
        query = { _id: docId };
      } else {
        query = {
          $or: [
            { _id: getQueryId(docId) },
            { _id: docId },
            { id: docId }
          ]
        };
      }

      const doc = await db.collection(collectionName).findOne(query);
      if (!doc) {
        return NextResponse.json({ success: true, document: null, item: null });
      }
      const formatted = { id: doc._id.toString(), ...doc, _id: doc._id.toString() };
      return NextResponse.json({ success: true, document: formatted, item: formatted });
    }

    // 2. Collection list query: /api/db/:collection
    const { searchParams } = new URL(request.url);
    const filter = {};

    for (const [key, value] of searchParams.entries()) {
      if (!['limit', 'sort', 'order', 'orderBy'].includes(key)) {
        filter[key] = value === 'true' ? true : value === 'false' ? false : value;
      }
    }

    const sortField = searchParams.get('orderBy') || 'createdAt';
    const sortOrder = searchParams.get('order') === 'asc' ? 1 : -1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit'), 10) : 0;

    let cursor = db.collection(collectionName).find(filter).sort({ [sortField]: sortOrder });
    if (limit > 0) {
      cursor = cursor.limit(limit);
    }

    const docs = await cursor.toArray();
    const formattedDocs = docs.map((d) => ({
      id: d._id.toString(),
      ...d,
      _id: d._id.toString(),
    }));

    return NextResponse.json({ success: true, documents: formattedDocs, items: formattedDocs });
  } catch (error) {
    console.error('DB API GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const resolvedParams = await params;
    const collectionName = resolvedParams.slug[0];
    const auth = verifyAuth(request);

    // Only allow unauthenticated POST for accountRequests
    if (collectionName !== 'accountRequests' && !auth) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const db = await getDb();

    const docToInsert = {
      ...body,
      createdAt: body.createdAt || new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection(collectionName).insertOne(docToInsert);
    const createdDoc = {
      id: result.insertedId.toString(),
      _id: result.insertedId.toString(),
      ...docToInsert,
    };

    return NextResponse.json({ success: true, document: createdDoc, id: result.insertedId.toString() });
  } catch (error) {
    console.error('DB API POST error:', error);
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
    const slug = resolvedParams.slug || [];
    const collectionName = slug[0];
    const docId = slug[1];

    if (!collectionName || !docId || docId === 'undefined' || docId === 'null') {
      return NextResponse.json({ success: false, message: 'Collection and valid ID required' }, { status: 400 });
    }

    const body = await request.json();
    const db = await getDb();

    let query = {
      $or: [
        { _id: getQueryId(docId) },
        { _id: docId },
        { id: docId }
      ]
    };
    if (collectionName === 'settings' || collectionName === 'tradingSettings') {
      query = { _id: docId };
    }

    const { id, _id, ...updateFields } = body;
    updateFields.updatedAt = new Date();

    await db.collection(collectionName).updateOne(query, { $set: updateFields }, { upsert: true });

    return NextResponse.json({ success: true, message: 'Document updated successfully' });
  } catch (error) {
    console.error('DB API PATCH error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const resolvedParams = await params;
    const slug = resolvedParams.slug || [];
    const collectionName = slug[0];
    const docId = slug[1];

    if (!collectionName || !docId || docId === 'undefined' || docId === 'null') {
      return NextResponse.json({ success: false, message: 'Collection and valid ID required' }, { status: 400 });
    }

    const db = await getDb();
    const query = {
      $or: [
        { _id: getQueryId(docId) },
        { _id: docId },
        { id: docId }
      ]
    };

    await db.collection(collectionName).deleteOne(query);

    return NextResponse.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('DB API DELETE error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
