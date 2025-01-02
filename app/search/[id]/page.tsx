import { notFound, redirect } from 'next/navigation';
import { Chat } from '@/components/chat';
import { getChat } from '@/lib/actions/chat';
import { AI } from '@/app/actions';
import { currentUser } from '@clerk/nextjs/server'; // Import Clerk for user authentication

export const maxDuration = 60;

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

  // Fetch the chat with the actual userId or 'anonymous' as fallback
  const chat = await getChat(params.id, userId);

  // Check if chat exists
  if (!chat) {
    redirect('/');
  }

  // Allow access if the chat is shared publicly, or if the user is the chat owner
  if (!chat.shared && chat.userId !== userId) {
    notFound();
  }

  return (
    <AI
      initialAIState={{
        chatId: chat.id,
        messages: chat.messages,
      }}
    >
      <Chat id={params.id} />
    </AI>
  );
}
