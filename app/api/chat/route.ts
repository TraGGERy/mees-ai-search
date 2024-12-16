import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { PERSONAS } from '@/lib/chatlib/personas';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages, persona = 'research' } = await req.json();
    
    const selectedPersona = PERSONAS.find(p => p.id === persona);
    const systemMessage = {
      role: 'system',
      content: selectedPersona?.systemPrompt || PERSONAS[0].systemPrompt,
    };

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages: [systemMessage, ...messages.map((m: any) => ({
        content: m.content,
        role: m.role,
      }))],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error: any) {
    console.error('[Chat API Error]:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code,
        },
      },
      { status: error.status || 500 }
    );
  }}