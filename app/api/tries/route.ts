import { db } from "@/db/db";
import { userTries } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, currentTries } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const newTriesCount = currentTries - 1;
    
    // Update the database
    await db
      .update(userTries)
      .set({
        dailyTriesRemaining: newTriesCount,
      })
      .where(eq(userTries.userId, userId));

    return NextResponse.json({ remainingTries: newTriesCount });
  } catch (error) {
    console.error("Error updating tries:", error);
    return NextResponse.json({ error: "Failed to update tries" }, { status: 500 });
  }
} 