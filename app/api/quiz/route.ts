import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { getModel } from '@/lib/utils/registry'

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid text' }, { status: 400 })
    }

    // Prompt for quiz generation in JSON format
    const prompt = `Generate a quiz based on the following text. Create 10 multiple-choice questions. For each question, provide 4 options (A, B, C, D) and specify the correct answer as a single letter (A, B, C, or D). Return the result as a JSON array with this format:\n\n[{\n  "question": "...",\n  "options": ["A. ...", "B. ...", "C. ...", "D. ..."],\n  "answer": "B"\n}, ...]\n\nText:\n"""${text}"""`;

    const response = await generateText({
      model: getModel('openai:gpt-4o'),
      system: 'You are a helpful academic assistant and quiz generator.',
      messages: [
        { role: 'user', content: prompt }
      ],
      maxTokens: 1200,
      temperature: 0.3
    })

    // Try to extract the JSON array from the response
    let questions = []
    try {
      // Find the first JSON array in the response
      // The 's' flag is not supported in some environments, so use a workaround
      const match = response.text?.match(/\[[\s\S]*\]/)
      if (match) {
        questions = JSON.parse(match[0])
      }
    } catch (e) {
      return NextResponse.json({ error: 'Failed to parse quiz.' }, { status: 500 })
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'No quiz generated.' }, { status: 500 })
    }

    return NextResponse.json({ questions })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
} 