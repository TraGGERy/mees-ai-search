'use server'

import { db } from "@/db/db";
import { waitlist } from "@/db/schema";
import { redirect } from "next/navigation";

export async function addToWaitlist(email: string) {
  try {
    await db.insert(waitlist).values({
      email,
    });
    
    redirect('/');
  } catch (error) {
    console.error('Failed to add to waitlist:', error);
    throw new Error('Failed to join waitlist');
  }
} 