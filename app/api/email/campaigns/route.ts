import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { campaigns } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_DRIZZLE_DB_URL) {
      throw new Error("Database URL is not configured");
    }

    const campaignList = await db.select().from(campaigns).orderBy(campaigns.createdAt);
    return NextResponse.json(campaignList);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch campaigns",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newCampaign = {
      id: nanoid(),
      name: body.name,
      subject: body.subject,
      template: body.template,
      audience: body.audience,
      status: "draft",
      content: body.content || null,
      scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null,
      sentAt: null,
      recipients: 0,
      opens: 0,
      clicks: 0,
      bounceRate: 0,
      metadata: {
        tags: [],
        customFields: {},
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(campaigns).values(newCampaign);
    return NextResponse.json(newCampaign);
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { 
        error: "Failed to create campaign",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    // Update the campaign
    await db
      .update(campaigns)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, id));

    // Fetch the updated campaign
    const updatedCampaign = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, id))
      .limit(1);

    if (!updatedCampaign.length) {
      return NextResponse.json(
        { error: "Campaign not found after update" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCampaign[0]);
  } catch (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json(
      { 
        error: "Failed to update campaign",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    await db.delete(campaigns).where(eq(campaigns.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json(
      { 
        error: "Failed to delete campaign",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 