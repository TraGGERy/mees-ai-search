import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { chatNeon } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';

export async function GET() {
  try {
    // Get the current user from Clerk
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch chats from the database using the Clerk user ID
    const chats = await db
      .select()
      .from(chatNeon)
      .where(eq(chatNeon.userId, user.id))
      .orderBy(desc(chatNeon.createdAt))
      .limit(10);

    return NextResponse.json(chats);

  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json({ error: 'Failed to fetch chats', details: error }, { status: 500 });
  }
} 