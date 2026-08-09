export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongo';

export async function GET() {
  try {
    const db = await getDb();

    // Query real pending account requests and pending certificates
    const pendingAccountRequests = await db.collection('account_requests').find({ status: 'pending' }).limit(10).toArray().catch(() => []);
    const pendingCertificates = await db.collection('certificates').find({ status: 'pending' }).limit(10).toArray().catch(() => []);

    const proposals = [];

    pendingAccountRequests.forEach(req => {
      proposals.push({
        id: `account-request-${req._id}`,
        deptId: 'support',
        title: `Approve Account Request for ${req.fullName || req.name || req.email}`,
        description: `Student account request submitted by ${req.email} for role ${req.role || 'student'}.`,
        impact: 'Account Activation',
        createdAt: req.createdAt || new Date().toISOString()
      });
    });

    pendingCertificates.forEach(cert => {
      proposals.push({
        id: `certificate-${cert._id}`,
        deptId: 'hr',
        title: `Verify & Issue Certificate for ${cert.studentName || 'Student'}`,
        description: `Certificate verification request for course ${cert.courseTitle || 'Program'}.`,
        impact: 'Certificate Verification',
        createdAt: cert.createdAt || new Date().toISOString()
      });
    });

    // Scheduled Newsletter Proposal
    proposals.push({
      id: 'newsletter-daily-dispatch',
      deptId: 'marketing',
      title: 'Dispatch Daily 7 AM / 3 PM / 8 PM Email Newsletters',
      description: 'Auto-compiled email newsletter promoting Full-Stack Web Development and AI/ML internship tracks to active subscribers.',
      impact: 'Student Reach',
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, proposals });
  } catch (error) {
    console.error('Real MongoDB Proposals error:', error);
    return NextResponse.json({ success: true, proposals: [] });
  }
}
