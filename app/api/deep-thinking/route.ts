import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { NextResponse } from 'next/server';
import { personas } from '@/types/chat';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { error: "No valid 'text' provided for analysis" },
        { status: 400 }
      );
    }

    const result = streamText({
      model: openai('gpt-4'),
      system: `You are an advanced AI analyst. Analyze the given content in detail, considering:
        1. Key Points and Main Ideas
        2. Deeper Implications and Context
        3. Critical Analysis and Insights
        4. Conclusions and Recommendations
        
        Format your response in clear markdown with appropriate sections.`,
      messages: [
        {
          role: 'user',
          content: `Analyze this:\n\n${text}`
        }
      ],
      temperature: 0.7,
      maxTokens: 2000,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error in deep thinking route:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred during analysis.' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
}