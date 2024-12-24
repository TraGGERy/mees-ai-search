'use server'

import { db } from "@/db/db";
import { waitlist } from "@/db/schema";

export async function addToWaitlist(email: string) {
  if (!email || !email.includes('@')) {
    throw new Error('Please provide a valid email address');
  }

  try {
    await db.insert(waitlist).values({
      email: email.toLowerCase().trim(),
      status: 'pending',
      createdAt: new Date(),
    });
    
    return { success: true };
  } catch (error: any) {
    if (error?.message?.includes('unique constraint')) {
      throw new Error('This email is already on the waitlist');
    }
    console.error('Failed to add to waitlist:', error);
    throw new Error('Failed to join waitlist. Please try again later.');
  }
} 