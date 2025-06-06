import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { getModel } from '@/lib/utils/registry'

export async function POST(req: NextRequest) {
  try {
    const { text, question } = await req.json()
    if (!text || typeof text !== 'string' || !question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid text/question' }, { status: 400 })
    }

    const prompt = `You are a helpful academic tutor. The user has a question about the following text.\n\n1. Provide a clear, step-by-step explanation or answer to help them understand.\n2. Then, suggest 2-3 follow-up questions the user could ask to deepen their understanding.\n\nFormat your response as:\nExplanation:\n[Your explanation here]\n\nFollow-up Questions:\n1. ...\n2. ...\n3. ...\n\nText:\n"""${text}"""\n\nUser's question: ${question}`;

    const response = await generateText({
      model: getModel('openai:gpt-4o'),
      system: 'You are a helpful academic tutor and explainer.',
      messages: [
        { role: 'user', content: prompt }
      ],
      maxTokens: 900,
      temperature: 0.3
    })

    const result = response.text || 'No explanation generated.'

    return NextResponse.json({ result })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
} 