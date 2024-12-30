import { db } from "@/db/db";
import { userChats } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  const user = await currentUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return new Response("Chat ID is required", { status: 400 });
    }

    const chat = await db.query.userChats.findFirst({
      where: eq(userChats.chatId, chatId),
    });

    if (!chat) {
      return new Response(JSON.stringify({ messages: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ messages: chat.messages }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return new Response("Error fetching messages", { status: 500 });
  }
} 