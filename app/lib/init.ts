import { NewsAgent } from '@/app/services/NewsAgent';

export function initializeServices() {
  if (typeof window !== 'undefined') {
    const agent = NewsAgent.getInstance();
    console.log('NewsAgent initialized');
  }
} 