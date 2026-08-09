export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

export async function POST(request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, message: 'messages array is required' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        reply: "AI Chatbot is currently offline. Please contact support@amitsolutionhub.com.",
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `You are SolutionHub AI, an intelligent assistant for SolutionHub (amitsolutionhub.com). You help users learn about full-stack web development, trading mentorship, custom software development, internships, and courses offered by SolutionHub. Be polite, concise, and helpful.`;

    const lastUserMsg = messages[messages.length - 1]?.content || 'Hello';

    const result = await model.generateContent(`${systemPrompt}\n\nUser: ${lastUserMsg}`);
    const responseText = result.response.text();

    return NextResponse.json({
      success: true,
      reply: responseText,
    });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json({
      success: false,
      reply: "I am having trouble processing your request right now. Please try again later.",
    });
  }
}
