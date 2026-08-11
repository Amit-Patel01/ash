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

async function getWebsiteContentData() {
  try {
    const db = await getDb();
    if (!db) return { courses: [], projects: [], activeCoupons: [] };

    const now = new Date();
    const [courses, projects, coupons] = await Promise.all([
      db.collection('courses').find({ published: { $ne: false }, isPublished: { $ne: false } }).limit(6).toArray().catch(() => []),
      db.collection('projects').find({ published: { $ne: false }, isPublished: { $ne: false } }).limit(6).toArray().catch(() => []),
      db.collection('coupons').find({ isActive: true }).toArray().catch(() => [])
    ]);

    const activeCoupons = (coupons || []).filter(c => {
      if (!c.code) return false;
      if (c.validTill && new Date(c.validTill) < now) return false;
      return true;
    });

    return { courses, projects, activeCoupons };
  } catch (err) {
    console.warn('⚠️ [NEWSLETTER] DB content fetch error:', err.message);
    return { courses: [], projects: [], activeCoupons: [] };
  }
}

export async function POST(request) {
  try {
    const bodyJson = await request.json().catch(() => ({}));
    const slot = bodyJson.slot || '7am';
    const rawRecipients = bodyJson.recipientEmails;

    const [recipientEmails, websiteData] = await Promise.all([
      getNewsletterRecipients(rawRecipients),
      getWebsiteContentData()
    ]);

    const { courses, projects, activeCoupons } = websiteData;

    const courseListText = courses.length > 0
      ? courses.map(c => `- ${c.title || c.name} (${c.category || 'Course/Internship'})`).join('\n')
      : `- Full-Stack Web Development Internship (React, Node.js, Express, MongoDB)\n- AI & Machine Learning Track (Python, PyTorch, Data Science)\n- Cyber Security & Ethical Hacking Track (Network Security & Labs)\n- Python & Web Automation Engineering Track`;

    const projectListText = projects.length > 0
      ? projects.map(p => `- ${p.title || p.name}`).join('\n')
      : `- E-Commerce Portal with Payment Gateway & Admin Dashboard\n- AI Support Chatbot & Automation Suite\n- Real-Time Trading & Portfolio Analytics Dashboard`;

    const activeCouponsText = activeCoupons.length > 0
      ? activeCoupons.map(c => `- Coupon Code "${c.code}": ${c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}`).join('\n')
      : 'None (No active coupon discounts currently available on website)';

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

STRICT MANDATORY CONSTRAINTS:
1. Only feature programs, courses, and live projects that are actually available on amitsolutionhub.com listed below.
2. DO NOT invent, hallucinate, or generate any fake promo codes, fake coupon codes (such as AFTERNOONTECH25, DISCOUNT25, PROMO25, etc.), or fake discount percentages.
3. DO NOT mention coupons, discounts, or promotional codes UNLESS they are explicitly listed under "Active Valid Coupons On Website" below. If "Active Valid Coupons On Website" states None, DO NOT include any coupon codes or discount offers!
4. Format nicely with clean HTML paragraphs (<p>), subheadings (<h3>), bullet lists (<ul><li>), and bold text (<strong>).

Real Available Content on Website:
---
[Real Courses & Internship Tracks]
${courseListText}

[Real Live Projects]
${projectListText}

[Active Valid Coupons On Website]
${activeCouponsText}
---

Newsletter Outline:
1. Motivational greeting & concise tech insight/tip.
2. Highlight real available courses/internships from the list above.
3. Live project spotlight from the list above.
${activeCoupons.length > 0 ? '4. Mention only the active valid website coupon offer listed above.' : '4. Call to action to visit amitsolutionhub.com for enrollments.'}
5. Warm professional closing from Amit Solution Hub Team.`;

        const result = await model.generateContent(prompt);
        rawBody = result.response.text();
      } catch (aiErr) {
        console.warn(`⚠️ [NEWSLETTER] AI Generation warning (${GEMINI_MODEL}): ${aiErr.message}. Using default content fallback.`);
        rawBody = '';
      }
    }

    if (!rawBody) {
      const couponHtml = activeCoupons.length > 0
        ? `<div style="background:#f8fafc; border-left:4px solid #6366f1; padding:14px; margin:18px 0; border-radius:6px;">
            <h4 style="margin:0 0 6px 0; color:#4f46e5;">🎟️ Active Website Coupon Offer:</h4>
            ${activeCoupons.map(c => `<p style="margin:4px 0; color:#1e293b;">Use coupon code <strong>${c.code}</strong> to get ${c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`} at checkout!</p>`).join('')}
           </div>`
        : '';

      rawBody = `
        <p>Welcome to your daily edition of tech insights and career growth from <strong>Amit Solution Hub</strong>.</p>
        <p>We are dedicated to delivering hands-on skill development, industry-recognized internship programs, and real-world project experience to empower your tech journey.</p>
        
        <h3>🔥 Featured Programs & Internships Available:</h3>
        <ul>
          <li><strong>Full-Stack Web Development Internship:</strong> Build production-ready MERN stack applications with live database integrations and code reviews.</li>
          <li><strong>AI & Machine Learning Track:</strong> Master Python, model development, and real-world AI applications with mentor guidance.</li>
          <li><strong>Cyber Security & Ethical Hacking:</strong> Learn hands-on network security, penetration testing, and ethical hacking protocols.</li>
        </ul>

        <h3>💻 Live Project Showcase:</h3>
        <p>Explore real-world software architecture and production source code repositories designed to boost your portfolio and job readiness.</p>

        ${couponHtml}

        <p>Visit <a href="https://www.amitsolutionhub.com">amitsolutionhub.com</a> to explore our available programs and accelerate your tech career today!</p>
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
      to: ADMIN_EMAIL,
      bcc: recipientEmails,
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

