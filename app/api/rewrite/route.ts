import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }
    // Get the rewritten text from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that rewrites text to make it clearer, more concise, and more engaging while maintaining the original meaning."
        },
        {
          role: "user",
          content: `Please rewrite the following text to make it clearer and more engaging, while keeping the same meaning:\n\n${text}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const rewrittenText = completion.choices[0]?.message?.content || text;

    return NextResponse.json({ rewrittenText });
  } catch (error) {
    console.error('Error rewriting text:', error);
    return NextResponse.json(
      { error: 'Failed to rewrite text' },
      { status: 500 }
    );
  }
} 