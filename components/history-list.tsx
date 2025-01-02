import React, { cache } from 'react';
import HistoryItem from './history-item';
import { Chat } from '@/lib/types';
import { ClearHistory } from './clear-history';
import { currentUser } from '@clerk/nextjs/server'; // Clerk auth import
import { db } from '@/db/db';
import { chatNeon } from '@/db/schema';
import { eq, and } from 'drizzle-orm'; // Import `and` from drizzle-orm

// Function to get a chat from Neon database
export async function getChatFromNeon(chatId: string): Promise<Chat | null> {
  // Get the current user's ID from Clerk
  const user = await currentUser();
  const userId = user?.id || 'anonymous'; // Set user ID to 'anonymous' if not logged in

  try {
    // Retrieve the chat from the Neon database based on chatId and userId
    const chatData = await db
      .select()
      .from(chatNeon)
      .where(and(eq(chatNeon.chatId, chatId), eq(chatNeon.userId, userId))) // Combine conditions with `and`
      .execute();

    if (chatData.length === 0) {
      return null; // Return null if no chat found
    }

    // Assuming your schema has these fields, create a Chat object
    const chat = chatData[0]; // Get the first (and should be the only) result

    // Check if messages is a string, then parse it, otherwise assign it directly
    let messages: any; // Adjust type based on your needs
    if (typeof chat.messages === 'string') {
      try {
        messages = JSON.parse(chat.messages); // Parse if it's a JSON string
      } catch (error) {
        console.error("Failed to parse messages:", error);
        messages = []; // Default to an empty array on parse failure
      }
    } else if (typeof chat.messages === 'object') {
      messages = chat.messages; // Assign directly if it's already an object
    } else {
      messages = []; // Default to empty array for any other type
    }

    return {
      id: chat.chatId,
      userId: chat.userId,
      createdAt: chat.createdAt,
      path: chat.path,
      title: chat.title,
      messages, // Use the processed messages
    } as Chat; // Return as Chat type
  } catch (error) {
    console.error("Error connecting to database: ", error); // Log the error for debugging
    return null; // Return null if there’s an error connecting to the database
  }
}

// Helper function to get chat IDs for the user from the database
async function fetchChatIdsForUser(userId: string): Promise<string[]> {
  try {
    // Retrieve chat IDs from the Neon database based on userId, limiting to 30 records
    const userChatIds = await db
      .select({ chatId: chatNeon.chatId })
      .from(chatNeon)
      .where(eq(chatNeon.userId, userId))
      .limit(30) // Limit the number of records returned
      .execute();

    // Map the result to get chat ID strings
    return userChatIds.map(record => record.chatId);
  } catch (error) {
    console.error("Error fetching chat IDs: ", error); // Log the error for debugging
    return []; // Return an empty array if there’s an error fetching chat IDs
  }
}

// Function to load chats by fetching chat details for each chat ID and removing duplicates
async function loadChats(userId: string): Promise<Chat[]> {
  const chatIds = await fetchChatIdsForUser(userId);
  const chats: Chat[] = [];

  // Use a Set to keep track of unique chat IDs
  const uniqueChatIds = new Set<string>();

  try {
    // Fetch all chats in parallel, then filter out duplicates
    const chatPromises = chatIds.map(chatId => getChatFromNeon(chatId));
    const results = await Promise.all(chatPromises);

    for (const chat of results) {
      if (chat && !uniqueChatIds.has(chat.id)) {
        uniqueChatIds.add(chat.id);
        chats.push(chat);
      }
    }

    // Sort chats by `createdAt` in descending order (latest first)
    chats.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Error loading chats: ", error); // Log the error for debugging
  }

  return chats;
}

// Memoize the loadChats function to cache results
const cachedLoadChats = cache(loadChats);

// Main component for displaying chat history
export async function HistoryList() {
  // Get the current user's ID from Clerk
  const user = await currentUser();
  const userId = user?.id || 'anonymous'; // Set user ID to 'anonymous' if not logged in

  // Fetch chats with the user ID (or 'anonymous' if not logged in)
  const chats = await cachedLoadChats(userId);

  return (
    <div className="flex flex-col flex-1 space-y-3 h-full">
      <div className="flex flex-col space-y-2 flex-1 overflow-y-auto">
        {!chats.length ? (
          <div className="text-gray-500 text-sm text-center py-6">
            <i className="fas fa-history text-xl text-gray-300"></i>
            <div>No search history</div>
          </div>
        ) : (
          chats.map((chat: Chat) => chat && <HistoryItem key={chat.id} chat={chat} />)
        )}
      </div>

      <div className="mt-auto">
        <ClearHistory empty={!chats.length} />
      </div>
    </div>
  );
}
