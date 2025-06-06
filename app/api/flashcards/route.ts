import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { getModel } from '@/lib/utils/registry'

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid text' }, { status: 400 })
    }

    const prompt = `Generate a set of flashcards based on the following text. Each flashcard should have a question and a short answer. Return the result as a JSON array with this format:\n\n[{\n  "question": "...",\n  "answer": "..."\n}, ...]\n\nText:\n"""${text}"""`;

    const response = await generateText({
      model: getModel('openai:gpt-4o'),
      system: 'You are a helpful academic assistant and flashcard generator.',
      messages: [
        { role: 'user', content: prompt }
      ],
      maxTokens: 900,
      temperature: 0.3
    })

    // Try to extract the JSON array from the response
    let flashcards = []
    try {
      // Use a regular expression compatible with ES2017 (no /s flag)
      const match = response.text?.match(/\[[\s\S]*\]/)
      if (match) {
        flashcards = JSON.parse(match[0])
      }
    } catch (e) {
      return NextResponse.json({ error: 'Failed to parse flashcards.' }, { status: 500 })
    }

    if (!Array.isArray(flashcards) || flashcards.length === 0) {
      return NextResponse.json({ error: 'No flashcards generated.' }, { status: 500 })
    }

    return NextResponse.json({ flashcards })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
} 