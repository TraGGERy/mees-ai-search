import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db/db";
import { userChats } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await currentUser();
  
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chats = await db
      .select()
      .from(userChats)
      .where(eq(userChats.userId, user.id))
      .orderBy(desc(userChats.createdAt));

    return NextResponse.json(chats);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return new Response("Error fetching chat history", { status: 500 });
  }
} 