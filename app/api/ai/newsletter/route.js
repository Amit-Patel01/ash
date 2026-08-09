export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import nodemailer from 'nodemailer';

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
    const { slot = '7am', recipientEmails = [ADMIN_EMAIL], forceBroadcast = false } = await request.json();

    const timeSlotLabelMap = {
      '7am': '07:00 AM Morning Tech & Career Brief',
      '3pm': '03:00 PM Afternoon Project & Internship Highlight',
      '8pm': '08:00 PM Evening Masterclass & Course Promotion'
    };

    const slotLabel = timeSlotLabelMap[slot] || '07:00 AM Morning Newsletter';

    let newsletterSubject = `🚀 [Amit Solution Hub] ${slotLabel}`;
    let newsletterContent = '';

    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are AGT-03, the Autonomous Newsletter AI Agent for Amit Solution Hub (amitsolutionhub.com).
Generate an engaging, professional, HTML-ready email newsletter for our students and subscribers for the ${slotLabel} edition.
Include:
1. Short motivational greeting.
2. Featured Internship Track (e.g., Full-Stack Web Development, AI/ML, Cyber Security).
3. Live Project Spotlight & Source Code Repository update.
4. Limited-time coupon discount call-to-action for amitsolutionhub.com.
Format nicely with clean HTML structure (h2, p, ul, strong, a).`;

      const result = await model.generateContent(prompt);
      newsletterContent = result.response.text();
    } else {
      newsletterContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #4f46e5;">🚀 ${slotLabel} - Amit Solution Hub</h2>
          <p>Welcome to your daily edition of tech insights and career growth from <strong>Amit Solution Hub</strong>.</p>
          <h3>🔥 Featured Programs Today:</h3>
          <ul>
            <li><strong>Full-Stack Web Development Internship:</strong> Hands-on React, Node.js & MongoDB projects.</li>
            <li><strong>AI & Machine Learning Track:</strong> Build Python models with real mentor code reviews.</li>
            <li><strong>Cyber Security & Ethical Hacking:</strong> Real-world network security labs.</li>
          </ul>
          <p>Visit <a href="https://amitsolutionhub.com" style="color: #4f46e5; font-weight: bold;">amitsolutionhub.com</a> to claim your student scholarship today!</p>
        </div>
      `;
    }

    let emailSent = false;
    let emailStatus = 'Log mode (No SMTP password set)';

    if (SMTP_PASS) {
      try {
        await transporter.sendMail({
          from: FROM_EMAIL,
          to: recipientEmails.join(', '),
          subject: newsletterSubject,
          html: newsletterContent,
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
      preview: newsletterContent,
      emailSent,
      emailStatus
    });

  } catch (error) {
    console.error('POST /api/ai/newsletter error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
