import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongo';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'support@amitsolutionhub.com';

// POST: Save waitlist email + notify Admin
export async function POST(req) {
  try {
    const body = await req.json();
    const { email, systemType = 'Desktop', source = 'website' } = body || {};

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = await getDb();
    const collection = db.collection('ashx_os_waitlist');

    const existing = await collection.findOne({ email: cleanEmail });
    if (existing) {
      // Update systemType if changed
      await collection.updateOne(
        { email: cleanEmail },
        { 
          $set: { 
            systemType, 
            lastUpdated: new Date() 
          } 
        }
      );
      return NextResponse.json({
        success: true,
        alreadyRegistered: true,
        message: 'Your email is already registered for ASHX OS VIP Early Access!'
      });
    }

    const newEntry = {
      email: cleanEmail,
      systemType,
      source,
      status: 'pending_beta',
      createdAt: new Date(),
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    };

    await collection.insertOne(newEntry);

    // Send Notification to Admin
    try {
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `🚀 New ASHX OS Beta Waitlist Signup: ${cleanEmail}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #4f46e5; margin: 0;">ASHX OS VIP Waitlist</h2>
              <p style="color: #64748b; font-size: 14px; margin-top: 4px;">New Beta Tester Registration</p>
            </div>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 6px 0; font-size: 14px;"><strong>Email:</strong> ${cleanEmail}</p>
              <p style="margin: 6px 0; font-size: 14px;"><strong>Hardware / Device:</strong> ${systemType}</p>
              <p style="margin: 6px 0; font-size: 14px;"><strong>Source:</strong> ${source}</p>
              <p style="margin: 6px 0; font-size: 14px;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p style="color: #64748b; font-size: 12px; text-align: center;">You can view and export all beta subscribers from your Admin Panel at <code>/admin/ashx-waitlist</code>.</p>
          </div>
        `,
        text: `New ASHX OS Waitlist Signup: ${cleanEmail} (${systemType}) on ${new Date().toLocaleString()}`
      }).catch(mailErr => {
        console.warn('⚠️ Admin notification email failed:', mailErr.message);
      });
    } catch (mailError) {
      console.warn('⚠️ Mailer warning:', mailError.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully registered for ASHX OS VIP Early Access!'
    });

  } catch (error) {
    console.error('❌ [ASHX_WAITLIST_ERROR]:', error);
    return NextResponse.json(
      { success: false, message: 'Server error registering waitlist.' },
      { status: 500 }
    );
  }
}

// GET: Fetch all waitlist subscribers for Admin
export async function GET(req) {
  try {
    const db = await getDb();
    const collection = db.collection('ashx_os_waitlist');

    const subscribers = await collection.find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({
      success: true,
      count: subscribers.length,
      subscribers
    });
  } catch (error) {
    console.error('❌ [ASHX_WAITLIST_GET_ERROR]:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch waitlist.' },
      { status: 500 }
    );
  }
}

// DELETE: Remove subscriber
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    if (!id && !email) {
      return NextResponse.json({ success: false, message: 'ID or email is required.' }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('ashx_os_waitlist');

    let query = {};
    if (email) query.email = email.trim().toLowerCase();
    else if (id) {
      const { ObjectId } = await import('mongodb');
      query._id = new ObjectId(id);
    }

    const result = await collection.deleteOne(query);

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('❌ [ASHX_WAITLIST_DELETE_ERROR]:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete entry.' },
      { status: 500 }
    );
  }
}
