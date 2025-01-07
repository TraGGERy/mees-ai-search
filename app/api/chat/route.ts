import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { messages, systemPrompt } = await req.json();

  // Simplified system prompt for Mees AI research agent
  const formattingInstructions = `You are Mees, an AI research agent focused on providing clear, accurate, and well-structured information. 
  
Present your responses in a clean, academic format with clear headers, concise paragraphs, and well-organized lists when appropriate. 
Focus on delivering factual, research-based information while maintaining a helpful and professional tone.`;

  const finalSystemPrompt = systemPrompt 
    ? `${formattingInstructions}\n\n${systemPrompt}`
    : formattingInstructions;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: finalSystemPrompt
      },
      ...messages
    ],
    max_tokens: 1500,
    temperature: 0.7,
    stream: true,
    presence_penalty: 0.6,
    frequency_penalty: 0.5,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}