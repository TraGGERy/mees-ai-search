import { Chat } from '@/components/chat';
import { generateId } from 'ai';
import { AI } from '@/app/actions';

export const maxDuration = 60;

export default function Page({ searchParams }: { searchParams: { q: string } }) {
  if (!searchParams.q) {
    return <div>Loading...</div>; // Avoid instant redirects
  }

  const id = generateId();

  return (
    <AI initialAIState={{ chatId: id, messages: [] }}>
      <Chat id={id} query={searchParams.q} />
    </AI>
  );
}
