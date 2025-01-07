import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { messages, systemPrompt } = await req.json();

  // Enhanced formatting instructions with more specific rules
  const formattingInstructions = `
As an AI assistant, format all responses following these strict guidelines:

FORMATTING RULES:

1. Headers
   • Use CAPITAL LETTERS for all section headers
   • Make headers concise and descriptive
   • Leave TWO blank lines before AND after each header

2. Paragraphs
   • Keep paragraphs focused on a single topic
   • Use clear topic sentences
   • Leave ONE blank line between paragraphs
   • Maximum 4-5 lines per paragraph

3. Lists and Steps
   • Start each new item on a fresh line
   • Use • for general bullet points
   • Use numbers for sequential steps
   • Indent sub-points with two spaces
   • Leave ONE blank line between major list items

4. Emphasis and Structure
   • Important terms in quotes
   • Key points on separate lines
   • Use clear transitional phrases
   • Maintain consistent indentation

Example Format:

OVERVIEW

This is a clear introductory paragraph that sets up the main topic. It should be concise and engaging.

This second paragraph builds on the first idea with new information. Each paragraph focuses on one main point.


DETAILED ANALYSIS

1. First Major Point
   • Supporting detail one
   • Supporting detail two
     - Sub-point with specific information
     - Additional clarification

2. Second Major Point
   • Key information
   • Important considerations


PRACTICAL APPLICATIONS

• Primary application with clear explanation
  - Specific example
  - Real-world usage

• Secondary application with details
  - Implementation steps
  - Best practices


CONCLUSION

Final summary paragraph with key takeaways. Keep it concise and actionable.

Remember:
• Maintain consistent spacing
• Use clear transitions
• Keep formatting uniform
• Prioritize readability`;

  // Combine with existing system message or use standalone
  const finalSystemPrompt = systemPrompt 
    ? `${formattingInstructions}\n\n${systemPrompt}`
    : formattingInstructions;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: finalSystemPrompt
      },
      ...messages
    ],
    max_tokens: 1500, // Increased for more detailed responses
    temperature: 0.7,
    stream: true,
    presence_penalty: 0.6, // Encourages more varied responses
    frequency_penalty: 0.5, // Reduces repetition
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}