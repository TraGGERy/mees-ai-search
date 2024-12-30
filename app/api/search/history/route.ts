import { currentUser } from "@clerk/nextjs/server";
import { getRedisClient } from "@/lib/redis/config";
import { NextResponse } from "next/server";

interface ChatData {
  id: string;
  title: string;
  path: string;
  createdAt: string;
  messages: string;
}

export async function GET() {
  const user = await currentUser();
  
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const redis = await getRedisClient();
    
    // Get chat keys from user's chat list
    const userChatKeys = await redis.zrange(`user:chat:${user.id}`, 0, -1, {
      rev: true
    });
    console.log('Found user chat keys:', userChatKeys);

    if (!userChatKeys || userChatKeys.length === 0) {
      return NextResponse.json([]);
    }

    // Get chat details for each key
    const results = await Promise.all(
      userChatKeys.map(async chatKey => {
        const chat = await redis.hgetall(chatKey);
        console.log('Chat data for', chatKey, ':', chat);
        return chat;
      })
    );

    const validChats = results
      .filter((chat): chat is NonNullable<typeof chat> => chat !== null)
      .map(chat => ({
        id: chat.id,
        title: chat.title,
        path: chat.path,
        createdAt: chat.createdAt
      }));

    console.log('Returning chats:', validChats);
    return NextResponse.json(validChats);
  } catch (error) {
    console.error("Error fetching search history:", error);
    return new Response("Error fetching search history", { status: 500 });
  }
} 