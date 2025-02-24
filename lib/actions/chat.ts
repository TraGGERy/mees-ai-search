'use server'

import { getRedisClient, RedisWrapper } from '@/lib/redis/config'
import { type Chat } from '@/lib/types'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function getRedis(): Promise<RedisWrapper> {
  return await getRedisClient()
}

const CHAT_VERSION = 'v2'
function getUserChatKey(userId: string) {
  return `user:${CHAT_VERSION}:chat:${userId.replace(/^\/+|\/+$/g, '')}`
}

export async function getChats() {
  try {
    // Get the current user's ID from Clerk
    const { userId: authUserId } = await auth() || { userId: null }
    const userId = authUserId || 'anonymous'
    
    const redis = await getRedisClient()
    const userChatKey = getUserChatKey(userId)
    
    // First, check if we can get the chat IDs
    const chatIds = await redis.zrange(userChatKey, 0, -1, { rev: true })
    if (!chatIds || !chatIds.length) {
      return [] // Return empty array if no chats found
    }

    const chats = await Promise.all(
      chatIds.map(async (chatId) => {
        try {
          const chat = await redis.hgetall(chatId)
          if (!chat) return null
          
          return {
            ...chat,
            id: chatId.replace('chat:', ''),
            messages: typeof chat.messages === 'string' 
              ? JSON.parse(chat.messages) 
              : chat.messages || [],
            createdAt: new Date(Number(chat.createdAt) || Date.now()),
            title: String(chat.title || ''),
            path: String(chat.path || '')
          } as Chat
        } catch (err) {
          console.error(`Error fetching chat ${chatId}:`, err)
          return null
        }
      })
    )

    // Ensure we're working with an array and handle all filters
    return (chats || [])
      .filter((chat): chat is NonNullable<typeof chat> => chat !== null)
      .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))

  } catch (error) {
    console.error('Error getting chats:', error)
    return [] // Return empty array on error
  }
}

export async function getChat(id: string) {
  try {
    const redis = await getRedisClient()
    
    // Clean and standardize the ID format
    const cleanId = id.replace(/^chat:/, '')
    const chatKey = `chat:${cleanId}`

    // First try direct lookup
    let chat = await redis.hgetall(chatKey)
    
    // If not found, try searching in sorted set
    if (!chat || Object.keys(chat).length === 0) {
      const allChatIds = await redis.zrange(`user:${CHAT_VERSION}:chat:anonymous`, 0, -1)
      const matchingId = allChatIds.find(cid => cid.includes(cleanId))
      
      if (matchingId) {
        chat = await redis.hgetall(matchingId)
      }
    }

    if (!chat || Object.keys(chat).length === 0) {
      console.log(`Chat not found for ID: ${cleanId}`)
      return null
    }

    // Ensure consistent data structure
    return {
      ...chat,
      id: cleanId,
      userId: chat.userId || 'anonymous', // Ensure userId exists
      messages: typeof chat.messages === 'string' 
        ? JSON.parse(chat.messages) 
        : (chat.messages || []),
      createdAt: new Date(Number(chat.createdAt) || Date.now()),
      title: chat.title || '',
      path: chat.path || '',
      sharePath: chat.sharePath || `/share/${cleanId}`
    } as Chat
  } catch (error) {
    console.error('Error getting chat:', error)
    return null
  }
}

export async function clearChats(): Promise<{ error?: string }> {
  try {
    // Get the current user's ID from Clerk
    const { userId: authUserId } = await auth() || { userId: null }
    const userId = authUserId || 'anonymous'
    
    const redis = await getRedis()
    const userChatKey = getUserChatKey(userId)
    const chats = await redis.zrange(userChatKey, 0, -1)
    
    if (!chats.length) {
      return { error: 'No chats to clear' }
    }
    
    const pipeline = redis.pipeline()

    for (const chat of chats) {
      pipeline.del(chat)
      pipeline.zrem(userChatKey, chat)
    }

    await pipeline.exec()

    revalidatePath('/')
    redirect('/')
  } catch (error) {
    console.error('Error clearing chats:', error)
    return { error: 'Failed to clear chats' }
  }
}

export async function saveChat(chat: Chat) {
  try {
    // Get the current user's ID from Clerk
    const { userId: authUserId } = await auth() || { userId: null }
    const userId = authUserId || 'anonymous'
    
    const redis = await getRedisClient()
    const chatKey = `chat:${chat.id.replace(/^\/+|\/+$/g, '')}`
    
    // Save the chat data with the user ID
    await redis.hmset(chatKey, {
      ...chat,
      id: chat.id,
      userId: userId, // Store the user ID with the chat
      messages: typeof chat.messages === 'string' 
        ? chat.messages 
        : JSON.stringify(chat.messages)
    })

    // Add to the correct user's chat list
    await redis.zadd(
      getUserChatKey(userId),
      Date.now(),
      chatKey
    )

    revalidatePath('/')
    return chat
  } catch (error) {
    console.error('Error saving chat:', error)
    return null
  }
}

export async function getSharedChat(id: string) {
  try {
    const redis = await getRedisClient()
    const chat = await redis.hgetall(`chat:${id}`)

    // Parse messages if they're stored as a string
    if (chat && typeof chat.messages === 'string') {
      try {
        chat.messages = JSON.parse(chat.messages)
      } catch (error) {
        chat.messages = []
      }
    }

    if (!chat || !chat.sharePath) {
      return null
    }

    return chat
  } catch (error) {
    console.error('Error getting shared chat:', error)
    return null
  }
}

export async function shareChat(id: string) {
  try {
    const redis = await getRedisClient()
    const cleanId = id.replace(/^chat:/, '') // Clean the ID first
    const chatKey = `chat:${cleanId}`
    const chat = await redis.hgetall(chatKey)

    if (!chat) {
      return null
    }

    const sharePath = `/share/${cleanId}` // Use the cleaned ID for the share path
    const payload = {
      ...chat,
      sharePath,
      messages: typeof chat.messages === 'string' 
        ? chat.messages 
        : JSON.stringify(chat.messages)
    }

    await redis.hmset(chatKey, payload)

    return {
      ...payload,
      messages: typeof payload.messages === 'string' 
        ? JSON.parse(payload.messages)
        : payload.messages,
      id: cleanId // Use the cleaned ID here as well
    }
  } catch (error) {
    console.error('Error sharing chat:', error)
    return null
  }
}
