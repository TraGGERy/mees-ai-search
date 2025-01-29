import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import path from 'path';
import { writeFile } from 'fs/promises';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    let messages;
    let systemPrompt;
    let imageFile: File | null = null;
    let imageUrl: string | undefined;

    if (req.headers.get('content-type')?.includes('multipart/form-data')) {
      const formData = await req.formData();
      messages = JSON.parse(formData.get('messages') as string);
      systemPrompt = formData.get('systemPrompt') as string;
      imageFile = formData.get('image') as File | null;

      if (imageFile) {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const filename = `image-${uniqueSuffix}.png`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await writeFile(path.join(uploadDir, filename), buffer);
        
        imageUrl = `/uploads/${filename}`;
      }
    } else {
      const body = await req.json();
      messages = body.messages;
      systemPrompt = body.systemPrompt;
    }

    const formattingInstructions = `You are Mees, an AI research agent focused on providing clear, accurate, and well-structured information.`;

    const result = streamText({
      model: openai(imageUrl ? 'gpt-4o-mini' : 'gpt-4o-mini'),
      system: systemPrompt ? `${formattingInstructions}\n\n${systemPrompt}` : formattingInstructions,
      messages: imageUrl 
        ? [...messages, {
            role: 'user',
            content: [
              { type: 'text', text: 'Please analyze this image:' },
              { type: 'image_url', image_url: `${process.env.NEXT_PUBLIC_APP_URL}${imageUrl}` }
            ]
          }]
        : messages,
      temperature: 0.7,
      maxTokens: 2000,
    });

    return result.toDataStreamResponse();

  } catch (error) {
    console.error('Error in chat route:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred during your request.' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
}