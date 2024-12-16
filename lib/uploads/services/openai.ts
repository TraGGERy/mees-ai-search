import OpenAI from 'openai';
import { FileContent } from '@/lib/types/api';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function analyzeWithGPT4(
  fileContent: FileContent
): Promise<{
  summary: string;
  extractedInfo: Record<string, any>;
  confidence: number;
  suggestedQuestions: string[];
}> {
  try {
    const messages: any[] = [];

    if (fileContent.type === 'image') {
      // For images, convert image content to a base64 URL for GPT-4 Vision
      const imageUrl = `data:${fileContent.mimeType};base64,${fileContent.content.toString('base64')}`;
      messages.push({
        role: 'user',
        content: `Analyze this image in detail.\n\nImage URL: ${imageUrl}`,
      });
    } else {
      // For PDFs or text documents, use the text content directly
      const content = fileContent.content.toString();
      messages.push({
        role: 'user',
        content: `Analyze this document in detail:\n\n${content}`,
      });
    }

    const response = await openai.chat.completions.create({
      model: fileContent.type === 'image' ? 'gpt-4-vision-preview' : 'gpt-4-turbo-preview',
      messages,
      temperature: 0.7,
      max_tokens: 1500,
    });

    // Ensure the analysis is a non-null string
    const analysis = response.choices[0].message.content || 'No analysis available';

    // Process and structure the response
    return {
      summary: extractSummary(analysis),
      extractedInfo: extractInfo(analysis),
      confidence: calculateConfidence(response.choices[0].finish_reason),
      suggestedQuestions: generateQuestions(analysis),
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to analyze with GPT-4');
  }
}

// Helper functions

function extractSummary(analysis: string): string {
  const paragraphs = analysis.split('\n\n');
  return paragraphs[0] || 'No summary available';
}

function extractInfo(analysis: string): Record<string, any> {
  return {
    topics: extractTopics(analysis),
    keyPoints: extractKeyPoints(analysis),
    entities: extractEntities(analysis),
  };
}

function calculateConfidence(finishReason: string): number {
  return finishReason === 'stop' ? 0.95 : 0.8;
}

function generateQuestions(analysis: string): string[] {
  const topics = extractTopics(analysis);
  return topics.map(topic => `Can you elaborate more on ${topic}?`);
}

function extractTopics(text: string): string[] {
  const topics = text.match(/\b(?:AI|Machine Learning|Data|Analytics|Technology)\w*\b/g);
  return topics ? Array.from(new Set(topics)) : [];
}

function extractKeyPoints(text: string): string[] {
  const points = text.match(/[•\-\d+]\s+([^\n]+)/g);
  return points ? points.map(point => point.replace(/^[•\-\d+]\s+/, '')) : [];
}

function extractEntities(text: string): string[] {
  const entities = text.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g);
  return entities ? Array.from(new Set(entities)) : [];
}
