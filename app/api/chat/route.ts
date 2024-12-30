import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";
import { db } from "@/db/db";
import { userChats } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { messages } = await req.json();
    const chatId = nanoid();

    const result = await streamText({
      model: openai("gpt-3.5-turbo"),
      system: "As Mees AI's research agent, gather the most up-to-date and scholarly information on the user's topic. Ask for a detailed description of their research question or problem, and inquire about any key areas they need help with. If the user has relevant scholarly sources, recent studies, or images, request them to upload for additional context. Ensure your responses are clear, well-structured, and brief, providing insightful answers without using markdown or lists",
      messages: convertToCoreMessages(messages),
    });

    // Save to database
    await db.insert(userChats).values({
      chatId,
      userId: user.id,
      title: messages[0]?.content.substring(0, 100) || "New Chat",
      messages: messages,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat error:", error);
    return new Response("Error processing chat", { status: 500 });
  }
}