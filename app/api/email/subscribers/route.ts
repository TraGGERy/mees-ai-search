import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { userUsage } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_DRIZZLE_DB_URL) {
      throw new Error("Database URL is not configured");
    }

    // Select only the columns we need
    const users = await db.select({
      userId: userUsage.userId,
      email: userUsage.email,
      lastUsageDate: userUsage.lastUsageDate,
    }).from(userUsage);
    
    if (!users || users.length === 0) {
      return NextResponse.json([], { status: 200 });
    }
    
    // Transform the data to match the subscriber interface
    const subscribers = users.map(user => ({
      id: user.userId,
      email: user.email,
      name: user.email.split('@')[0], // Using email username as name for now
      subscribed: true, // Assuming all users in userUsage are subscribed
      preferences: {
        newFeatures: true,
        productUpdates: true,
        promotions: true,
        systemNotifications: true,
      },
      lastEmailSent: null,
      lastEmailOpened: null,
      dateSubscribed: user.lastUsageDate.toISOString(),
    }));

    return NextResponse.json(subscribers);
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    
    // Return a more detailed error message
    return NextResponse.json(
      { 
        error: "Failed to fetch subscribers",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 