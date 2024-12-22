import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/db/db';
import { chatNeon } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const user = await currentUser();
    const userId = user?.id || 'anonymous';

    const chats = await db
      .select()
      .from(chatNeon)
      .where(eq(chatNeon.userId, userId))
      .orderBy(desc(chatNeon.createdAt))
      .limit(30)
      .execute();

    const processedChats = chats.map(chat => ({
      id: chat.chatId,
      userId: chat.userId,
      createdAt: chat.createdAt,
      path: `/chat/${chat.chatId}`,
      title: chat.title || 'Untitled Chat',
      messages: typeof chat.messages === 'string' 
        ? JSON.parse(chat.messages) 
        : chat.messages || []
    }));

    return NextResponse.json({ chats: processedChats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
  }
}