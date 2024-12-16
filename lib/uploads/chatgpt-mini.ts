// Simulated ChatGPT Mini API
export async function generateSummary(text: string): Promise<string> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real implementation, this would call the actual API
  return `This is an AI-generated summary of the article: ${text.slice(0, 100)}...`;
}

export async function analyzeDocument(text: string, model: string): Promise<{
  summary: string;
  keyPoints: string[];
  confidence: number;
}> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    summary: `Detailed analysis using ${model}: ${text.slice(0, 150)}...`,
    keyPoints: [
      "Key insight from the document",
      "Important finding from analysis",
      "Critical data point identified"
    ],
    confidence: 0.92
  };
}