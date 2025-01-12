import { useLocalStorage } from './use-local-storage';
import { Chat } from '@/lib/types';

export function useLocalChats() {
  const [chats, setChats] = useLocalStorage<Chat[]>('ai-chats', []);

  const addChat = (chat: Chat) => {
    setChats(currentChats => {
      const index = currentChats.findIndex(c => c.id === chat.id);
      if (index !== -1) {
        const newChats = [...currentChats];
        newChats[index] = chat;
        return newChats;
      }
      return [...currentChats, chat];
    });
  };

  const removeChat = (chatId: string) => {
    setChats(currentChats => currentChats.filter(c => c.id !== chatId));
  };

  return {
    chats,
    addChat,
    removeChat
  };
} 