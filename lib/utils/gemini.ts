import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error("GOOGLE_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function rewriteWithGemini(text: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
  const prompt = `Rewrite the following email content to be clearer, more concise, and more engaging, while keeping the same meaning.\n\n${text}`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const rewritten = response.text();
  return rewritten;
} 