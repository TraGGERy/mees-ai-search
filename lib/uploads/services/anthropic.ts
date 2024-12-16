import Anthropic from '@anthropic-ai/sdk';
import { FileContent } from '@/lib/types/api';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function analyzeWithClaude(
  fileContent: FileContent
): Promise<{
  summary: string;
  extractedInfo: Record<string, any>;
  confidence: number;
  suggestedQuestions: string[];
}> {
  try {
    let content: string;

    if (fileContent.type === 'image') {
      content = `{
        "type": "image",
        "source": {
          "type": "base64",
          "media_type": "${fileContent.mimeType}",
          "data": "${fileContent.content.toString('base64')}"
        }
      }`;
    } else {
      content = fileContent.content.toString();
    }

    const message = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1500,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: `Analyze this ${fileContent.type} in detail and provide a structured response with:
          1. A comprehensive summary
          2. Key topics and themes
          3. Important entities and concepts
          4. Relevant insights and implications

          Content: ${content}`,
        },
      ],
    });

    // Join content blocks into a single string if message.content is an array
    const analysis = Array.isArray(message.content)
      ? message.content.map((block: any) => block.text || '').join(' ')
      : message.content;

    return {
      summary: extractSummary(analysis),
      extractedInfo: extractInfo(analysis),
      confidence: calculateConfidence(message),
      suggestedQuestions: generateQuestions(analysis),
    };
  } catch (error) {
    console.error('Anthropic API error:', error);
    throw new Error('Failed to analyze with Claude');
  }
}

// Helper functions (same as your existing code)
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

function calculateConfidence(message: any): number {
  return 0.9; // Default confidence level
}

function generateQuestions(analysis: string): string[] {
  const topics = extractTopics(analysis);
  return topics.map(topic => `What are the implications of ${topic}?`);
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
