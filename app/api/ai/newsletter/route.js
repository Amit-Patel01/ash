export const dynamic = 'force-dynamic';
export const maxDuration = 30;
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { sendEmail } from '@/lib/email';
import { createEmailTemplate } from '@/lib/emailTemplate';
import { getDb } from '@/lib/db/mongo';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'support@amitsolutionhub.com';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

async function getNewsletterRecipients(customRecipients) {
  if (Array.isArray(customRecipients) && customRecipients.length > 0) {
    return customRecipients;
  }

  try {
    const db = await getDb();
    if (db) {
      const [userDocs, blacklist] = await Promise.all([
        db.collection('users').find(
          { email: { $exists: true }, emailUnsubscribed: { $ne: true } },
          { projection: { email: 1 } }
        ).toArray().catch(() => []),
        db.collection('email_unsubscribes').distinct('email').catch(() => [])
      ]);

      const blackSet = new Set((blacklist || []).map(e => String(e).toLowerCase()));
      const validEmails = userDocs
        .map(u => u.email)
        .filter(e => e && typeof e === 'string' && e.includes('@') && !blackSet.has(e.toLowerCase().trim()));

      if (validEmails.length > 0) {
        return Array.from(new Set(validEmails));
      }
    }
  } catch (dbErr) {
    console.warn('⚠️ [NEWSLETTER] DB subscriber fetch warning:', dbErr.message);
  }

  return [ADMIN_EMAIL];
}

export async function POST(request) {
  try {
    const bodyJson = await request.json().catch(() => ({}));
    const slot = bodyJson.slot || '7am';
    const rawRecipients = bodyJson.recipientEmails;

    const recipientEmails = await getNewsletterRecipients(rawRecipients);

    const timeSlotLabelMap = {
      '7am': '07:00 AM Morning Tech & Career Brief',
      '3pm': '03:00 PM Afternoon Project & Internship Highlight',
      '8pm': '08:00 PM Evening Masterclass & Course Promotion'
    };

    const slotLabel = timeSlotLabelMap[slot] || '07:00 AM Morning Newsletter';
    let newsletterSubject = `🚀 [Amit Solution Hub] ${slotLabel}`;
    let rawBody = '';

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

        const prompt = `You are AGT-03, the Autonomous Newsletter AI Agent for Amit Solution Hub (amitsolutionhub.com).
Generate an engaging, concise tech newsletter for students for the ${slotLabel} edition.
Include:
1. Motivational greeting.
2. Featured Internship Track (Full-Stack Web Dev, AI/ML, Cyber Security, Python).
3. Live Project Spotlight & Source Code Repository update.
4. Limited-time coupon discount call to action for amitsolutionhub.com.
Format nicely with clean HTML paragraphs, bullet points, and strong text.`;

        const result = await model.generateContent(prompt);
        rawBody = result.response.text();
      } catch (aiErr) {
        console.warn(`⚠️ [NEWSLETTER] AI Generation warning (${GEMINI_MODEL}): ${aiErr.message}. Using default content fallback.`);
        rawBody = '';
      }
    }

    if (!rawBody) {
      rawBody = `
        <p>Welcome to your daily edition of tech insights and career growth from <strong>Amit Solution Hub</strong>.</p>
        <h3>🔥 Featured Programs Today:</h3>
        <ul>
          <li><strong>Full-Stack Web Development Internship:</strong> Hands-on React, Node.js & MongoDB projects.</li>
          <li><strong>AI & Machine Learning Track:</strong> Build Python models with real mentor code reviews.</li>
          <li><strong>Cyber Security & Ethical Hacking:</strong> Real-world network security labs.</li>
        </ul>
        <p>Visit <a href="https://www.amitsolutionhub.com">amitsolutionhub.com</a> to claim your student scholarship today!</p>
      `;
    }

    const newsletterHtml = createEmailTemplate({
      title: slotLabel,
      subtitle: 'Daily AI Autonomous Workforce Dispatch',
      badgeText: 'DAILY TECH NEWSLETTER',
      bodyContent: rawBody,
      ctaText: 'Explore Programs & Projects',
      ctaUrl: 'https://www.amitsolutionhub.com/courses'
    });

    const mailResult = await sendEmail({
      to: recipientEmails.join(', '),
      subject: newsletterSubject,
      html: newsletterHtml,
    });

    return NextResponse.json({
      success: true,
      agentId: 'AGT-03',
      slot,
      slotLabel,
      timestamp: new Date().toISOString(),
      subject: newsletterSubject,
      preview: newsletterHtml,
      recipientsCount: recipientEmails.length,
      emailSent: mailResult.success,
      emailStatus: mailResult.success ? `Dispatched to ${recipientEmails.length} recipient(s)` : `SMTP Error: ${mailResult.error}`
    });

  } catch (error) {
    console.error('POST /api/ai/newsletter error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slot = searchParams.get('slot') || '7am';
  return POST(new Request(request.url, {
    method: 'POST',
    body: JSON.stringify({ slot })
  }));
}

