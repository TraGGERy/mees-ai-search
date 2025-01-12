import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { notifications } from '@/db/schema';

export async function POST(request: Request) {
  try {
    const subscription = await request.json();
    
    await db.insert(notifications).values({
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving subscription:', error);
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
} 