import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { getModel } from '@/lib/utils/registry'

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid text' }, { status: 400 })
    }

    // Use OpenAI to check for plagiarism
    const prompt = `You are an academic plagiarism checker. Analyze the following text for plagiarism and originality. If you detect any content that is likely copied or not original, explain why and suggest possible sources or types of content it may match. If the text appears original, state that clearly. Provide a plagiarism score (0% = fully original, 100% = fully plagiarized) and a brief explanation.\n\nText to check:\n"""${text}"""`;

    const response = await generateText({
      model: getModel('openai:gpt-4o'),
      system: 'You are a helpful academic assistant.',
      messages: [
        { role: 'user', content: prompt }
      ],
      maxTokens: 512,
      temperature: 0.2
    })

    const fullText = response.text || ''
    // Extract the plagiarism score using regex
    const match = fullText.match(/plagiarism score\s*[:\-]?\s*(\d{1,3})%/i)
    const score = match ? match[1] : 'N/A'
    const result = `Plagiarism Score: ${score}%`

    return NextResponse.json({ result })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
} 