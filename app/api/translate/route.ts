import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  try {
    const { text, targetLanguage } = await request.json();

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the following text into ${getLanguageName(targetLanguage)}. 
          Maintain proper grammar, tone, and cultural context. 
          If translating to Korean, include Hangul script.
          Provide only the translation without any additional explanations or notes.`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.7,
    });

    const translation = response.choices[0].message.content;

    return NextResponse.json({ translation });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
}

function getLanguageName(code: string): string {
  const languageMap: { [key: string]: string } = {
    en: 'English',
    sn: 'Shona',
    nd: 'Ndebele',
    sw: 'Swahili',
    zu: 'Zulu',
    ny: 'Nyanja/Chewa',
    ko: 'Korean'
  };
  return languageMap[code] || code;
} 