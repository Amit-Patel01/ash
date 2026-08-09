export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

let departmentConfig = {
  support: {
    id: 'support',
    name: 'Customer Support & Helpdesk',
    enabled: true,
    systemPrompt: 'Monitor support inquiries, route technical issues to mentors, and respond to FAQs.'
  },
  sales: {
    id: 'sales',
    name: 'Course Sales & Growth',
    enabled: true,
    systemPrompt: 'Promote internship tracks, manage discount coupons, and optimize course conversions.'
  },
  marketing: {
    id: 'marketing',
    name: 'Marketing & Social Outreach',
    enabled: true,
    systemPrompt: 'Generate weekly newsletter briefs, social media headlines, and promotional posts.'
  },
  hr: {
    id: 'hr',
    name: 'HR & Student Certifications',
    enabled: true,
    systemPrompt: 'Verify student eligibility, audit certificate QR codes, and generate offer letters.'
  },
  finance: {
    id: 'finance',
    name: 'Finance & Revenue Analytics',
    enabled: true,
    systemPrompt: 'Track Razorpay payments, monitor order revenue, and forecast weekly sales.'
  },
  tech: {
    id: 'tech',
    name: 'Website Health & Infrastructure',
    enabled: true,
    systemPrompt: 'Monitor website uptime, MongoDB connections, asset loading, and system logs.'
  },
  email: {
    id: 'email',
    name: 'Daily Newsletter Broadcast',
    enabled: true,
    systemPrompt: 'Dispatch scheduled 7:00 AM, 3:00 PM, and 8:00 PM email newsletters to subscribers.'
  }
};

export async function GET() {
  return NextResponse.json({ success: true, config: departmentConfig });
}

export async function POST(request) {
  try {
    const { deptId, updates } = await request.json();
    if (deptId && departmentConfig[deptId]) {
      departmentConfig[deptId] = { ...departmentConfig[deptId], ...updates };
    }
    return NextResponse.json({ success: true, config: departmentConfig });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
