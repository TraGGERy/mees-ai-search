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
    const authResult = await auth()
    console.log('getChats - Full auth result:', authResult)
    
    // Extract userId safely with fallback
    const authUserId = authResult?.userId
    console.log('getChats - User ID from auth():', authUserId)
    
    // Use anonymous for non-authenticated users
    const userId = authUserId || 'anonymous'
    console.log('getChats - Final User ID used:', userId)
    
    const redis = await getRedisClient()
    const userChatKey = getUserChatKey(userId)
    
    console.log('getChats - User Chat Key:', userChatKey)
    
    // First, check if we can get the chat IDs
    const chatIds = await redis.zrange(userChatKey, 0, -1, { rev: true })
    console.log('getChats - Chat IDs found:', chatIds?.length || 0, chatIds)
    
    if (!chatIds || !chatIds.length) {
      console.log('getChats - No chat IDs found, returning empty array')
      return [] // Return empty array if no chats found
    }

    // Use pipeline for more efficient batch retrieval
    const pipeline = redis.pipeline()
    chatIds.forEach(chatId => {
      pipeline.hgetall(chatId)
    })
    
    const results = await pipeline.exec()
    console.log('getChats - Pipeline results:', results?.length || 0)
    
    if (!results) {
      console.log('getChats - No results from pipeline, returning empty array')
      return []
    }
    
    const chats = results.map((result, index) => {
      try {
        // Redis pipeline returns the chat data directly, not in [error, data] format
        if (!result || typeof result !== 'object' || Object.keys(result).length === 0) {
          console.log(`getChats - Empty or invalid result at index ${index}:`, result)
          return null
        }
        
        const chat = result as Record<string, any>
        const chatId = chatIds[index]
        
        if (!chat || Object.keys(chat).length === 0) {
          console.log(`getChats - Empty chat data for ID ${chatId}`)
          return null
        }
        
        const processedChat = {
          ...chat,
          id: chatId.replace('chat:', ''),
          messages: typeof chat.messages === 'string' 
            ? JSON.parse(chat.messages) 
            : chat.messages || [],
          createdAt: new Date(Number(chat.createdAt) || Date.now()),
          title: String(chat.title || ''),
          path: String(chat.path || '')
        } as Chat
        
        console.log(`getChats - Processed chat ${index}:`, {
          id: processedChat.id,
          title: processedChat.title,
          messagesCount: Array.isArray(processedChat.messages) ? processedChat.messages.length : 'unknown'
        })
        
        return processedChat
      } catch (err) {
        console.error(`Error parsing chat data at index ${index}:`, err)
        return null
      }
    })

    // Ensure we're working with an array and handle all filters
    const filteredChats = (chats || [])
      .filter((chat): chat is NonNullable<typeof chat> => chat !== null)
    // Chats should already be sorted by Redis zrange with rev: true
    console.log(`getChats - Final filtered chats: ${filteredChats.length}`)
    return filteredChats

  } catch (error) {
    console.error('Error getting chats:', error)
    console.log('getChats - Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
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

export async function deleteChat(id: string): Promise<{ error?: string }> {
  try {
    // Get the current user's ID from Clerk
    const { userId: authUserId } = await auth() || { userId: null }
    const userId = authUserId || 'anonymous'
    const redis = await getRedis()
    const userChatKey = getUserChatKey(userId)
    const chatKey = `chat:${id.replace(/^chat:/, '')}`

    // Remove the chat from Redis and from the user's chat list
    const pipeline = redis.pipeline()
    pipeline.del(chatKey)
    pipeline.zrem(userChatKey, chatKey)
    await pipeline.exec()

    revalidatePath('/')
    return {}
  } catch (error) {
    console.error('Error deleting chat:', error)
    return { error: 'Failed to delete chat' }
  }
}

// ADMIN: Get all chats from all users, paginated
export async function getAllChats(page: number = 1, pageSize: number = 50) {
  try {
    const redis = await getRedisClient();
    // Force Upstash-compatible scan logic
    let cursor = 0;
    let userChatKeys: string[] = [];
    do {
      const result = await (redis as any).client.scan(cursor, {
        match: 'user:v2:chat:*',
        count: 100,
      });
      cursor = Number(result[0]);
      userChatKeys.push(...result[1]);
    } while (cursor !== 0);

    // For each user chat key, get all chat IDs
    let allChatIds: string[] = [];
    for (const userChatKey of userChatKeys) {
      const chatIds = await redis.zrange(userChatKey, 0, -1, { rev: true });
      allChatIds.push(...chatIds);
    }
    if (!allChatIds.length) return { chats: [], total: 0 };

    // Use pipeline to fetch all chat objects
    const pipeline = redis.pipeline();
    allChatIds.forEach(chatId => {
      pipeline.hgetall(chatId);
    });
    const results = await pipeline.exec();
    if (!results) return { chats: [], total: 0 };

    // Map and filter valid chats
    let chats = results.map((result, index) => {
      if (!result || typeof result !== 'object' || Object.keys(result).length === 0) return null;
      const chat = result as Record<string, any>;
      const chatId = allChatIds[index];
      return {
        ...chat,
        id: chatId.replace('chat:', ''),
        messages: typeof chat.messages === 'string' ? JSON.parse(chat.messages) : chat.messages || [],
        createdAt: new Date(Number(chat.createdAt) || Date.now()),
        title: String(chat.title || ''),
        path: String(chat.path || ''),
        userId: chat.userId || 'unknown',
      };
    }).filter(Boolean);
    // Sort by createdAt descending
    chats = chats.sort((a, b) => {
      if (!a || !b) return 0;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
    const total = chats.length;
    // Paginate
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pagedChats = chats.slice(start, end);
    return { chats: pagedChats, total };
  } catch (error) {
    console.error('Error getting all chats (admin):', error);
    return { chats: [], total: 0 };
  }
}
