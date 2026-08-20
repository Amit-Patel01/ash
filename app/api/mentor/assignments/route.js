export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongo';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const db = await getDb();
    const collection = db.collection('mentor_assignments');

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

    return NextResponse.json({ success: true, assignments: formatted, count: formatted.length });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const db = await getDb();
    const collection = db.collection('mentor_assignments');

    const newDoc = {
      studentName: body.studentName || 'Student',
      studentEmail: body.studentEmail || 'student@example.com',
      courseTitle: body.courseTitle || 'Full-Stack Web Development',
      assignmentTitle: body.assignmentTitle || 'Project Submission',
      submittedAt: 'Just now',
      createdAt: new Date().toISOString(),
      status: 'pending',
      repoUrl: body.repoUrl || '',
      liveUrl: body.liveUrl || '',
      studentNotes: body.studentNotes || '',
      score: null,
      feedback: ''
    };

    const result = await collection.insertOne(newDoc);
    return NextResponse.json({
      success: true,
      assignment: { id: result.insertedId.toString(), ...newDoc, _id: result.insertedId.toString() }
    });
  } catch (error) {
    console.error('Error creating assignment submission:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, score, feedback, status } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('mentor_assignments');

    let queryId;
    try {
      queryId = new ObjectId(id);
    } catch {
      queryId = id;
    }

    const updateFields = {
      updatedAt: new Date().toISOString()
    };

    if (score !== undefined) updateFields.score = score.includes('/') ? score : `${score}/100`;
    if (feedback !== undefined) updateFields.feedback = feedback;
    if (status !== undefined) updateFields.status = status;

    await collection.updateOne(
      { $or: [{ _id: queryId }, { id: id }] },
      { $set: updateFields }
    );

    return NextResponse.json({ success: true, message: 'Assignment evaluated successfully' });
  } catch (error) {
    console.error('Error updating assignment:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const clearAll = searchParams.get('clearAll') === 'true';

    const db = await getDb();
    const collection = db.collection('mentor_assignments');

    if (clearAll) {
      await collection.deleteMany({});
      return NextResponse.json({ success: true, message: 'All assignments cleared' });
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
    return NextResponse.json({ success: true, message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
