import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Add formatting instructions to system message
  const formattingInstructions = `
Format your responses clearly with these rules:

1. Use CAPITAL LETTERS for section headers (no asterisks)
2. Leave TWO line breaks after each header
3. Leave ONE line break between bullet points
4. Start each numbered step on a new line
5. Use proper indentation for sub-points
6. Avoid special characters like asterisks (**)

Example format:

MAIN SECTION

• Key point one

• Key point two
    - Sub-point a
    - Sub-point b


STEPS TO FOLLOW

1. First step to take
    - Important detail
    - Additional note

2. Second step to take
    - Related information
    - Key consideration


FINAL RECOMMENDATIONS

• Primary recommendation

• Secondary recommendation

• Additional guidance`;

  // Combine with existing system message
  const systemMessage = {
    role: 'system',
    content: formattingInstructions + '\n\n' + messages[0].content
  };

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [systemMessage, ...messages.slice(1)],
    max_tokens: 1000,
    temperature: 0.7,
    stream: true,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}