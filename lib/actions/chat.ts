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
import { generateId } from 'ai'


async function getRedis(): Promise<RedisWrapper> {
  return await getRedisClient()
}
// Function to check if a chat with the given chatId exists
export async function chatExists(chatId: string): Promise<boolean> {
  const existingChat = await db
    .select()
    .from(chatNeon)
    .where(eq(chatNeon.chatId, chatId)) // Query by chatId directly
    .execute();

  return existingChat.length > 0; // Return true if a chat with this ID exists
}
// Function to check if a chat with the given path exists
export async function pathExists(path: string): Promise<boolean> {
  try {
    const existingChat = await db
      .select()
      .from(chatNeon)
      .where(eq(chatNeon.path, path)) // Query by path directly
      .execute();

    console.log(`Checking existence of path: ${path}, Exists: ${existingChat.length > 0}`);
    return existingChat.length > 0; // Return true if a chat with this path exists
  } catch (error) {
    console.error(`Error checking path existence for ${path}:`, error);
    throw new Error('Failed to check path existence.');
  }
}

// Function to validate chat data
function validateChatData(chat: Chat): void {
  if (!chat.createdAt || !chat.userId || !chat.title || !chat.messages) {
    throw new Error('Invalid chat data: Missing required fields.');
  }
}

// Function to save chats to the Neon database
export async function saveChatNeon(chat: Chat) {
  // Validate the chat data
  validateChatData(chat);

  const { createdAt, userId, title, messages } = chat;

  // Generate a new chatId
  let chatId = generateId(); // Generate a new chatId
  let path = `/search/${chatId}`; // Create a new path based on the chatId

  // Log the chat data being saved
  console.log('Attempting to save chat:', { createdAt, userId, path, title, messages });

  // Check if the path exists in the database
  const exists = await pathExists(path);
  if (exists) {
    console.log(`Chat with path ${path} already exists. Skipping save.`);
    return; // Do nothing if the path already exists
  }

  // Now save the chat with the unique path
  try {
    await db.insert(chatNeon).values({
      path,
      createdAt,
      userId,
      title,
      chatId, // Save the generated chatId
      messages: JSON.stringify(messages), // Store messages as JSON
    });
    console.log(`Chat with path ${path} saved successfully.`);
  } catch (error) {
    if (error  === '23505') { // Unique violation error code for PostgreSQL
      console.error(`Unique constraint violation: Chat with path ${path} already exists.`);
    } else {
      console.error(`Error saving chat with path ${path}:`, error);
    }
    throw new Error('Failed to save chat to the database.');
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
  const redis = await getRedis()
  const chat = await redis.hgetall<Chat>(`chat:${id}`)

  if (!chat) {
    return null
  }

  // Parse the messages if they're stored as a string
  if (typeof chat.messages === 'string') {
    try {
      chat.messages = JSON.parse(chat.messages)
    } catch (error) {
      chat.messages = []
    }
  }

  // Ensure messages is always an array
  if (!Array.isArray(chat.messages)) {
    chat.messages = []
  }

  return chat
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

