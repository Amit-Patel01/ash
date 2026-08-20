export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongo';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const db = await getDb();
    const collection = db.collection('mentor_doubts');

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const course = searchParams.get('course');
    const studentEmail = searchParams.get('studentEmail');

    const query = {};
    if (status && status !== 'all') query.status = status;
    if (course && course !== 'All') query.courseTitle = course;
    if (studentEmail) query.studentEmail = studentEmail;

    const items = await collection.find(query).sort({ createdAt: -1 }).toArray();

    const formatted = items.map(doc => ({
      id: doc._id.toString(),
      ...doc,
      _id: doc._id.toString()
    }));

    return NextResponse.json({ success: true, doubts: formatted, count: formatted.length });
  } catch (error) {
    console.error('Error fetching doubts:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const db = await getDb();
    const collection = db.collection('mentor_doubts');

    const newDoc = {
      studentName: body.studentName || 'Student',
      studentEmail: body.studentEmail || 'student@example.com',
      courseTitle: body.courseTitle || 'Full-Stack Web Development',
      question: body.question || '',
      codeSnippet: body.codeSnippet || '',
      postedAt: 'Just now',
      createdAt: new Date().toISOString(),
      status: 'open',
      replies: []
    };

    const result = await collection.insertOne(newDoc);
    return NextResponse.json({
      success: true,
      doubt: { id: result.insertedId.toString(), ...newDoc, _id: result.insertedId.toString() }
    });
  } catch (error) {
    console.error('Error posting doubt:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, replyText, author, status } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('mentor_doubts');

    let queryId;
    try {
      queryId = new ObjectId(id);
    } catch {
      queryId = id;
    }

    const updateOps = {
      $set: {
        updatedAt: new Date().toISOString(),
        status: status || 'resolved'
      }
    };

    if (replyText && replyText.trim()) {
      updateOps.$push = {
        replies: {
          author: author || 'Mentor',
          text: replyText.trim(),
          time: 'Just now',
          createdAt: new Date().toISOString()
        }
      };
    }

    await collection.updateOne(
      { $or: [{ _id: queryId }, { id: id }] },
      updateOps
    );

    return NextResponse.json({ success: true, message: 'Doubt replied & updated successfully' });
  } catch (error) {
    console.error('Error replying to doubt:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const clearAll = searchParams.get('clearAll') === 'true';

    const db = await getDb();
    const collection = db.collection('mentor_doubts');

    if (clearAll) {
      await collection.deleteMany({});
      return NextResponse.json({ success: true, message: 'All doubts cleared' });
    }

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 });
    }

    let queryId;
    try {
      queryId = new ObjectId(id);
    } catch {
      queryId = id;
    }

    await collection.deleteOne({ $or: [{ _id: queryId }, { id: id }] });
    return NextResponse.json({ success: true, message: 'Doubt deleted successfully' });
  } catch (error) {
    console.error('Error deleting doubt:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
