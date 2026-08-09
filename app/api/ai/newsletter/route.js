export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import nodemailer from 'nodemailer';
import { createEmailTemplate } from '@/lib/emailTemplate';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || 'support@amitsolutionhub.com';
const SMTP_PASS = process.env.SMTP_PASS || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'Amit Solution Hub <support@amitsolutionhub.com>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'support@amitsolutionhub.com';

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export async function POST(request) {
  try {
    const { slot = '7am', recipientEmails = [ADMIN_EMAIL] } = await request.json();

    const timeSlotLabelMap = {
      '7am': '07:00 AM Morning Tech & Career Brief',
      '3pm': '03:00 PM Afternoon Project & Internship Highlight',
      '8pm': '08:00 PM Evening Masterclass & Course Promotion'
    };

    const slotLabel = timeSlotLabelMap[slot] || '07:00 AM Morning Newsletter';
    let newsletterSubject = `🚀 [Amit Solution Hub] ${slotLabel}`;
    let rawBody = '';

    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
    } else {
      rawBody = `
        <p>Welcome to your daily edition of tech insights and career growth from <strong>Amit Solution Hub</strong>.</p>
        <h3>🔥 Featured Programs Today:</h3>
        <ul>
          <li><strong>Full-Stack Web Development Internship:</strong> Hands-on React, Node.js & MongoDB projects.</li>
          <li><strong>AI & Machine Learning Track:</strong> Build Python models with real mentor code reviews.</li>
          <li><strong>Cyber Security & Ethical Hacking:</strong> Real-world network security labs.</li>
        </ul>
        <p>Visit <a href="https://amitsolutionhub.com">amitsolutionhub.com</a> to claim your student scholarship today!</p>
      `;
    }

    const newsletterHtml = createEmailTemplate({
      title: slotLabel,
      subtitle: 'Daily AI Autonomous Workforce Dispatch',
      badgeText: 'DAILY TECH NEWSLETTER',
      bodyContent: rawBody,
      ctaText: 'Explore Programs & Projects',
      ctaUrl: 'https://amitsolutionhub.com/courses'
    });

    let emailSent = false;
    let emailStatus = 'Log mode (Set SMTP_PASS in .env.local to send actual emails)';

    if (SMTP_PASS) {
      try {
        await transporter.sendMail({
          from: FROM_EMAIL,
          to: recipientEmails.join(', '),
          subject: newsletterSubject,
          html: newsletterHtml,
        });
        emailSent = true;
        emailStatus = `Dispatched successfully to ${recipientEmails.length} recipient(s)`;
      } catch (mailErr) {
        emailStatus = `SMTP Error: ${mailErr.message}`;
      }
    }

    return NextResponse.json({
      success: true,
      agentId: 'AGT-03',
      slot,
      slotLabel,
      timestamp: new Date().toISOString(),
      subject: newsletterSubject,
      preview: newsletterHtml,
      emailSent,
      emailStatus
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
