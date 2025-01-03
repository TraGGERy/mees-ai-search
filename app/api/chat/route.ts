import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";
import { db } from "@/db/db";
import { userChats } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { messages, chatId, systemPrompt } = await req.json();

    // Add the system prompt as the first message
    const messagesWithSystem = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    const result = await streamText({
      model: openai("gpt-4o-mini"),
      system: "As Mees AI's research agent...",
      messages: convertToCoreMessages(messagesWithSystem),
    });

    // Check if chat exists
    const existingChat = await db.query.userChats.findFirst({
      where: eq(userChats.chatId, chatId)
    });

    if (existingChat) {
      // Update existing chat
      await db
        .update(userChats)
        .set({
          messages: messagesWithSystem,
          updatedAt: new Date(),
        })
        .where(eq(userChats.chatId, chatId));
    } else {
      // Create new chat only if it doesn't exist
      await db.insert(userChats).values({
        chatId,
        userId: user.id,
        title: messagesWithSystem[0]?.content.substring(0, 100) || "New Chat",
        messages: messagesWithSystem,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat error:", error);
    return new Response("Error processing chat", { status: 500 });
  }
}