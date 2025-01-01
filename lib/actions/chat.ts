'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { type Chat } from '@/lib/types'
import { getRedisClient, RedisWrapper } from '@/lib/redis/config'
import { db } from '@/db/db'
import { chatNeon } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import path from 'path'
import { currentUser } from '@clerk/nextjs/server'
import { kv } from '@vercel/kv'


async function getRedis(): Promise<RedisWrapper> {
  return await getRedisClient()
}
// Function to check if a chat with the given chatId exists
export async function chatExists(chatId: string): Promise<boolean> {
  const existingChat = await db
    .select()
    .from(chatNeon)
    .where(eq(chatNeon.chatId, chatId))
    .execute();

  return existingChat.length > 0;
}

export async function saveChatNeon(chat: Chat) {
  try {
    const { id: chatId, createdAt, userId, path, title, messages } = chat;
    
    // Check if the chat already exists
    const exists = await chatExists(chatId);
    
    if (!exists) {
      // Insert new chat
      await db.insert(chatNeon).values({
        chatId,
        createdAt,
        userId,
        path,
        title,
        messages: JSON.stringify(messages), // Convert messages to JSON string
      });
      console.log(`Chat ${chatId} saved successfully to Neon.`);
    } else {
      // Update existing chat
      await db
        .update(chatNeon)
        .set({
          title,
          messages: JSON.stringify(messages),
          createdAt // Update timestamp
        })
        .where(eq(chatNeon.chatId, chatId))
        .execute();
      console.log(`Chat ${chatId} updated successfully in Neon.`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving chat to Neon:', error);
    throw new Error('Failed to save chat to Neon database');
  }
}


export async function getChats(userId?: string | null) {
  if (!userId) {
    return []
  }

  try {
    const redis = await getRedis()
    const chats = await redis.zrange(`user:chat:${userId}`, 0, -1, {
      rev: true
    })

    if (chats.length === 0) {
      return []
    }

    const results = await Promise.all(
      chats.map(async chatKey => {
        const chat = await redis.hgetall(chatKey)
        return chat
      })
    )

    return results
      .filter((result): result is Record<string, any> => {
        if (result === null || Object.keys(result).length === 0) {
          return false
        }
        return true
      })
      .map(chat => {
        const plainChat = { ...chat }
        if (typeof plainChat.messages === 'string') {
          try {
            plainChat.messages = JSON.parse(plainChat.messages)
          } catch (error) {
            plainChat.messages = []
          }
        }
        if (plainChat.createdAt && !(plainChat.createdAt instanceof Date)) {
          plainChat.createdAt = new Date(plainChat.createdAt)
        }
        return plainChat as Chat
      })
  } catch (error) {
    return []
  }
}

export async function getChat(id: string, userId: string = 'anonymous') {
  try {
    const redis = await getRedis()
    const chat = await redis.hgetall<Chat>(`chat:${id}`)

    if (!chat || Object.keys(chat).length === 0) {
      console.log('[getChat] No chat found in Redis:', id)
      return null
    }

    // Parse messages
    if (typeof chat.messages === 'string') {
      try {
        chat.messages = JSON.parse(chat.messages)
      } catch {
        chat.messages = []
      }
    }

    return chat
  } catch (error) {
    console.error('[getChat] Error:', error)
    return null
  }
}

export async function clearChats(
  userId: string = 'anonymous'
): Promise<{ error?: string }> {
  const redis = await getRedis()
  const chats = await redis.zrange(`user:chat:${userId}`, 0, -1)
  if (!chats.length) {
    return { error: 'No chats to clear' }
  }
  const pipeline = redis.pipeline()

  for (const chat of chats) {
    pipeline.del(chat)
    pipeline.zrem(`user:chat:${userId}`, chat)
  }

  await pipeline.exec()

  revalidatePath('/')
  redirect('/')
}

export async function saveChat(chat: Chat, userId: string = 'anonymous') {
  try {
    const redis = await getRedis()
    const pipeline = redis.pipeline()

    const chatToSave = {
      ...chat,
      messages: JSON.stringify(chat.messages)
    }

    pipeline.hmset(`chat:${chat.id}`, chatToSave)
    pipeline.zadd(`user:chat:${userId}`, Date.now(), `chat:${chat.id}`)

    const results = await pipeline.exec()

    return results
  } catch (error) {
    throw error
  }
}

export async function getSharedChat(id: string) {
  const redis = await getRedis()
  const chat = await redis.hgetall<Chat>(`chat:${id}`)

  if (!chat || !chat.sharePath) {
    return null
  }

  return chat
}

export async function shareChat(id: string, userId: string = 'anonymous') {
  const redis = await getRedis()
  const chat = await redis.hgetall<Chat>(`chat:${id}`)

  if (!chat || chat.userId !== userId) {
    return null
  }

  const payload = {
    ...chat,
    sharePath: `/share/${id}`
  }

  await redis.hmset(`chat:${id}`, payload)

  return payload
}

export async function getChatNeon(chatId: string): Promise<Chat | null> {
  try {
    const result = await db
      .select()
      .from(chatNeon)
      .where(eq(chatNeon.chatId, chatId))
      .execute()

    if (!result || result.length === 0) {
      console.log('[getChatNeon] No chat found in Neon:', chatId)
      return null
    }

    const data = result[0]
    let messages: any[] = []
    if (data.messages) {
      try {
        messages = JSON.parse(data.messages)
      } catch {
        messages = []
      }
    }

    return {
      id: data.chatId,
      userId: data.userId || 'anonymous',
      title: data.title || '',
      path: data.path || `/search/${chatId}`,
      messages,
      createdAt: data.createdAt || new Date(),
      sharePath: undefined,
    }
  } catch (error) {
    console.error('[getChatNeon] Error:', error)
    return null
  }
}

