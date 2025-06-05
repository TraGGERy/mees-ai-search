import { NextResponse } from 'next/server';
import { rewriteWithGemini } from '@/lib/utils/gemini';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Get the rewritten text from Google Gemini 2.5
    const rewrittenText = await rewriteWithGemini(text);

    return NextResponse.json({ rewrittenText });
  } catch (error) {
    console.error('Error rewriting text:', error);
    return NextResponse.json(
      { error: 'Failed to rewrite text' },
      { status: 500 }
    );
  }
} 