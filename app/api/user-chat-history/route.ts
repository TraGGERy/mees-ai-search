import { NextResponse } from 'next/server'
import { db } from '@/db/db'
import { chatNeon } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // Fetch chats for the signed-in user
    const results = await db
      .select()
      .from(chatNeon)
      .where(eq(chatNeon.userId, userId))
      .execute()

    return NextResponse.json(results)
  } catch (error) {
    console.error('[GET /api/user-chat-history] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    )
  }
} 