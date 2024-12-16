import { GoogleGenerativeAI } from '@google/generative-ai';
import { FileContent } from '@/lib/types/api';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function analyzeWithGemini(
  fileContent: FileContent
): Promise<{
  summary: string;
  extractedInfo: Record<string, any>;
  confidence: number;
  suggestedQuestions: string[];
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

    let prompt: string;
    let content: any;

    if (fileContent.type === 'image') {
      content = {
        inlineData: {
          data: fileContent.content.toString('base64'),
          mimeType: fileContent.mimeType,
        },
      };
      prompt = 'Analyze this image in detail.';
    } else {
      content = fileContent.content.toString();
      prompt = `Analyze this document in detail:\n\n${content}`;
    }

    const result = await model.generateContent([prompt, content]);
    const response = await result.response;
    const analysis = response.text();

    return {
      summary: extractSummary(analysis),
      extractedInfo: extractInfo(analysis),
      confidence: calculateConfidence(response),
      suggestedQuestions: generateQuestions(analysis),
    };
  } catch (error) {
    console.error('Google API error:', error);
    throw new Error('Failed to analyze with Gemini');
  }
}

function extractSummary(analysis: string): string {
  const summaryMatch = analysis.match(/Summary:?\s*([^\n]+)/i);
  return summaryMatch?.[1] || analysis.split('\n')[0];
}

function extractInfo(analysis: string): Record<string, any> {
  return {
    topics: extractTopics(analysis),
    keyPoints: extractKeyPoints(analysis),
    entities: extractEntities(analysis),
  };
}

function calculateConfidence(response: any): number {
  // Gemini doesn't provide direct confidence scores
  return 0.88;
}

function generateQuestions(analysis: string): string[] {
  const topics = extractTopics(analysis);
  return topics.map(topic => `What is the significance of ${topic}?`);
}

function extractTopics(text: string): string[] {
  const topicsSection = text.match(/Topics:?\s*([\s\S]*?)(?:\n\n|$)/i);
  if (topicsSection) {
    return topicsSection[1]
      .split('\n')
      .map(line => line.replace(/^[-•]\s*/, '').trim())
      .filter(Boolean);
  }
  return [];
}

function extractKeyPoints(text: string): string[] {
  const pointsSection = text.match(/Key Points:?\s*([\s\S]*?)(?:\n\n|$)/i);
  if (pointsSection) {
    return pointsSection[1]
      .split('\n')
      .map(line => line.replace(/^[-•]\s*/, '').trim())
      .filter(Boolean);
  }
  return [];
}

function extractEntities(text: string): string[] {
  const entitiesSection = text.match(/Entities:?\s*([\s\S]*?)(?:\n\n|$)/i);
  if (entitiesSection) {
    return entitiesSection[1]
      .split('\n')
      .map(line => line.replace(/^[-•]\s*/, '').trim())
      .filter(Boolean);
  }
  return [];
}