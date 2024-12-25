import { NextApiRequest, NextApiResponse } from 'next';
import { currentUser } from '@clerk/nextjs/server';
import { loadChats } from '@/components/history-list';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await currentUser();
  const userId = user?.id || 'anonymous';

  try {
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const chats = await loadChats(userId);
    res.status(200).json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error );
    res.status(500).json({ error: error || 'Failed to load chats' });
  }
}
