export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongo';

export async function GET() {
  try {
    const db = await getDb();
    
    // First try the dedicated 'team' collection
    const teamDocs = await db.collection('team').find({}).toArray();
    
    let team = teamDocs.map(doc => ({
      ...doc,
      id: doc._id.toString(),
      _id: doc._id.toString(),
    }));

    // If 'team' collection has members, return them
    if (team.length > 0) {
      return NextResponse.json({ success: true, team });
    }

    // Fallback: query employees/admins from 'users' collection
    const users = await db.collection('users').find({
      role: { $in: ['admin', 'employee', 'mentor', 'team'] }
    }).toArray();

    team = users.map(doc => ({
      id: doc._id.toString(),
      _id: doc._id.toString(),
      name: doc.name || doc.displayName || 'Team Member',
      role: doc.role || 'Member',
      designation: doc.designation || doc.title || doc.role || 'Software Engineer',
      bio: doc.bio || doc.about || '',
      photo: doc.photo || doc.photoURL || doc.avatar || '',
      email: doc.email || '',
    }));

    return NextResponse.json({ success: true, team });
  } catch (error) {
    console.error('GET /api/users/team error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
