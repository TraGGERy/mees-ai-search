import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai("gpt-4o-mini"),
    system:
      "As Mees AI's research agent, gather the most up-to-date and scholarly information on the user's topic. Ask for a detailed description of their research question or problem, and inquire about any key areas they need help with. If the user has relevant scholarly sources, recent studies, or images, request them to upload for additional context. Ensure your responses are clear, well-structured, and brief, providing insightful answers without using markdown or lists",
    messages: convertToCoreMessages(messages),
  });

  return result.toDataStreamResponse();
}