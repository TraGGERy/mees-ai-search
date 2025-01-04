import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Enhanced formatting instructions
  const formattingInstructions = `
Please format your responses following these strict guidelines:

1. HEADERS:
   - Use CAPITAL LETTERS for all section headers
   - Leave TWO blank lines before each header
   - No special characters around headers


2. PARAGRAPHS:
   - Start each main point on a new line
   - Leave ONE blank line between paragraphs
   - Keep paragraphs focused and concise


3. LISTS:
   - Start each list item on a new line
   - Use • for bullet points
   - Use numbers for sequential steps
   - Indent sub-points with two spaces


4. SPACING:
   - Double space between sections
   - Single space between list items
   - Clear separation between different topics


Example format:

MAIN TOPIC

This is the first paragraph with a complete thought. It should be clear and focused on one main idea.

This is a second paragraph that builds on the first idea but introduces new information.


DETAILED STEPS

1. First step to take
   • Important detail one
   • Important detail two

2. Second step to take
   • Related information
   • Key consideration


FINAL SECTION

• Main conclusion point
• Secondary conclusion point

Remember to maintain this format throughout the entire response.`;

  // Combine with existing system message
  const systemMessage = {
    role: 'system',
    content: formattingInstructions + '\n\n' + messages[0].content
  };

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [systemMessage, ...messages.slice(1)],
    max_tokens: 1000,
    temperature: 0.7,
    stream: true,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}