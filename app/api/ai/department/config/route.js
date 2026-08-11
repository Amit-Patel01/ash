export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongo';

const COLLECTION = 'aiDepartmentConfig';
const CONFIG_DOC_ID = 'main';

const DEFAULT_CONFIG = {
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

async function getConfigFromDb() {
  try {
    const db = await getDb();
    const doc = await db.collection(COLLECTION).findOne({ _id: CONFIG_DOC_ID });
    if (doc) {
      const { _id, updatedAt, ...config } = doc;
      return { ...DEFAULT_CONFIG, ...config };
    }
    return DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
}

async function saveConfigToDb(config) {
  const db = await getDb();
  await db.collection(COLLECTION).updateOne(
    { _id: CONFIG_DOC_ID },
    { $set: { ...config, updatedAt: new Date() } },
    { upsert: true }
  );
}

export async function GET() {
  try {
    const config = await getConfigFromDb();
    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error('GET /api/ai/department/config error:', error);
    return NextResponse.json({ success: true, config: DEFAULT_CONFIG });
  }
}

export async function POST(request) {
  try {
    const { deptId, updates } = await request.json();

    const currentConfig = await getConfigFromDb();

    if (deptId && currentConfig[deptId]) {
      currentConfig[deptId] = { ...currentConfig[deptId], ...updates };
      await saveConfigToDb(currentConfig);
    }

    return NextResponse.json({ success: true, config: currentConfig });
  } catch (error) {
    console.error('POST /api/ai/department/config error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
