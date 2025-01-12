import { notFound, redirect } from 'next/navigation';
import { Chat } from '@/components/chat';
import { getChat } from '@/lib/actions/chat';
import { AI } from '@/app/actions';
import { currentUser } from '@clerk/nextjs/server'; // Import Clerk for user authentication
import { Suspense } from 'react';
import { unstable_cache } from 'next/cache';

export const maxDuration = 60;

// Add revalidation time (e.g., 1 hour)
export const revalidate = 3600;

// Cache the chat fetching
const getCachedChat = unstable_cache(
  async (chatId: string, userId: string) => {
    return await getChat(chatId, userId);
  },
  ['chat-data'],
  {
    revalidate: 3600,
    tags: ['chat']
  }
);

export interface SearchPageProps {
  params: {
    id: string;
  };
}

// Metadata function to get basic title info for SEO
export async function generateMetadata({ params }: SearchPageProps) {
  const chat = await getChat(params.id, 'anonymous'); // Use anonymous to load general metadata
  return {
    title: chat?.title?.toString().slice(0, 50) || 'Search',
  };
}

export default async function SearchPage({ params }: SearchPageProps) {
  const user = await currentUser();
  const userId = user?.id || 'anonymous';

  // Use cached version of getChat
  const chat = await getCachedChat(params.id, userId);

  // Check if chat exists
  if (!chat) {
    redirect('/');
  }

  // Allow access if the chat is shared publicly, or if the user is the chat owner
  if (!chat.shared && chat.userId !== userId) {
    notFound();
  }

  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      <AI
        initialAIState={{
          chatId: chat.id,
          messages: chat.messages,
        }}
      >
        <Chat id={params.id} />
      </AI>
    </Suspense>
  );
}
