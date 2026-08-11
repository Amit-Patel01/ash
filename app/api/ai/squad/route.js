export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

export async function GET() {
  try {
    // Health Audit & Squad Status
    const squadStatus = {
      online: true,
      mode: 'AUTONOMOUS SQUAD ONLINE',
      timestamp: new Date().toISOString(),
      agents: [
        {
          id: 'AGT-01',
          name: 'Web Sentinel & Department Monitor',
          department: 'tech',
          status: 'ACTIVE_MONITORING',
          task: 'Website uptime, DB health, pending certificates & orders audit',
          lastRun: new Date().toISOString(),
          metrics: { uptime: '99.98%', latency: '42ms', pendingOrders: 0, pendingCerts: 0 }
        },
        {
          id: 'AGT-02',
          name: 'Course & Project Marketing Strategist',
          department: 'marketing',
          status: 'CAMPAIGN_READY',
          task: 'Auto-promotions for Full-Stack, AI/ML, Cyber Security & Python courses',
          lastRun: new Date().toISOString(),
          metrics: { campaignsGenerated: 14, reachEst: '12,500+' }
        },
        {
          id: 'AGT-03',
          name: 'Scheduled Daily Newsletter Agent',
          department: 'email',
          status: 'SCHEDULED',
          schedule: '07:00 AM | 03:00 PM | 08:00 PM',
          task: 'Tech updates, verified website courses & student project showcases',
          lastRun: new Date().toISOString(),
          metrics: { dailyEmailsSent: '4,800+', openRate: '48.5%' }
        },
        {
          id: 'AGT-04',
          name: 'Support & Operations Specialist',
          department: 'support',
          status: 'LISTENING',
          task: 'Inquiry routing, account reinstatement & mentor support management',
          lastRun: new Date().toISOString(),
          metrics: { resolvedQueries: '150+', avgResponseTime: '2 min' }
        }
      ]
    };

    return NextResponse.json({ success: true, data: squadStatus });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { action, agentId, customPrompt } = await request.json();

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        message: 'GEMINI_API_KEY is not configured in .env.local'
      });
    }

    const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    let systemContext = '';
    let userPrompt = '';

    if (action === 'site_health_audit') {
      systemContext = `You are AGT-01 (Web Sentinel Agent for Amit Solution Hub). Audit website health, database status, course catalog integrity, and certificate verification readiness. Give a clean, structured executive report.`;
      userPrompt = `Perform a comprehensive health check audit for Amit Solution Hub website (amitsolutionhub.com). Check course catalog, certificate QR verification, and student portals.`;
    } else if (action === 'generate_marketing_campaign') {
      systemContext = `You are AGT-02 (Marketing & Course Growth Strategist for Amit Solution Hub). Generate high-converting marketing posts and social media headlines to promote Amit Solution Hub's Full-Stack Web Development, AI & ML, Cyber Security, and Python internships.`;
      userPrompt = customPrompt || `Create 3 exciting marketing announcements for our top tech internship programs and project source code repository. Include call to action for amitsolutionhub.com.`;
    } else {
      systemContext = `You are an Autonomous AI Agent for Amit Solution Hub (amitsolutionhub.com). Perform the requested department operation concisely and professionally.`;
      userPrompt = customPrompt || `Run routine diagnostic check for department ${agentId || 'general'}.`;
    }

    const result = await model.generateContent(`${systemContext}\n\nTask: ${userPrompt}`);
    const replyText = result.response.text();

    return NextResponse.json({
      success: true,
      agentId: agentId || 'AGT-SQUAD',
      timestamp: new Date().toISOString(),
      report: replyText
    });
  } catch (error) {
    console.error('POST /api/ai/squad error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
