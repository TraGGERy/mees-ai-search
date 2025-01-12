import { db } from '@/db/db';
import { notifications } from '@/db/schema';
import { sendNotification } from '@/lib/notifications';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // ... your existing article creation logic ...

    // After successfully creating the article, send notifications
    const activeSubscriptions = await db.select().from(notifications);
    
    for (const subscription of activeSubscriptions) {
      await sendNotification({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth
        }
      }, 'New article available! Check it out!');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
} 