export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongo';

export async function GET() {
  try {
    const db = await getDb();
    const data = await db.collection('settings').findOne({ _id: 'maintenance' });
    if (data) {
      return NextResponse.json({
        success: true,
        isActive: Boolean(data.isActive),
        isActiveDev: Boolean(data.isActiveDev),
        message: data.message || '',
      });
    }
    return NextResponse.json({
      success: true,
      isActive: false,
      isActiveDev: false,
      message: '',
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      isActive: false,
      isActiveDev: false,
      message: '',
    });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const db = await getDb();
    await db.collection('settings').updateOne(
      { _id: 'maintenance' },
      { $set: { ...body, updatedAt: new Date() } },
      { upsert: true }
    );
    return NextResponse.json({ success: true, message: 'Maintenance settings updated.' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
