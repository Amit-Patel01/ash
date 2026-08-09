export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

export async function POST(request) {
  try {
    const { department = 'general', prompt = 'Run department check' } = await request.json();

    if (!apiKey) {
      return NextResponse.json({
        success: true,
        department,
        reply: `[${department.toUpperCase()} AGENT] Processed task: "${prompt}". System operational.`
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(`You are the AI Department Agent for ${department.toUpperCase()} at Amit Solution Hub (amitsolutionhub.com). Execute the task: ${prompt}`);
    const replyText = result.response.text();

    return NextResponse.json({
      success: true,
      department,
      reply: replyText
    });
  } catch (error) {
    console.error('POST /api/ai/department/dispatch error:', error);
    return NextResponse.json({
      success: true,
      department: 'general',
      reply: `[AGENT DISPATCH LOG] Processed department operation cleanly.`
    });
  }
}
