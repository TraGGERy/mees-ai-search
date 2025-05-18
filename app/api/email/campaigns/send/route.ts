import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { campaigns } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendCampaignEmail } from "@/lib/email/service";

export async function POST(request: Request) {
  try {
    console.log('Received campaign send request');
    
    const body = await request.json();
    console.log('Request body:', body);

    const { id } = body;

    if (!id) {
      console.error('Campaign ID is missing');
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    // Get campaign from database
    console.log('Fetching campaign from database:', id);
    const campaign = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, id))
      .limit(1);

    if (!campaign.length) {
      console.error('Campaign not found:', id);
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    console.log('Found campaign:', campaign[0]);

    // Send emails
    console.log('Sending campaign emails...');
    const result = await sendCampaignEmail({
      subject: campaign[0].subject,
      content: campaign[0].content || "",
      template: campaign[0].template,
    });

    console.log('Email sending result:', result);

    // Update campaign status and metrics
    console.log('Updating campaign status and metrics...');
    await db
      .update(campaigns)
      .set({
        status: "sent",
        sentAt: new Date(),
        recipients: result.total,
        opens: 0,
        clicks: 0,
        bounceRate: (result.failed / result.total) * 100,
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, id));

    console.log('Campaign updated successfully');

    return NextResponse.json({
      success: true,
      message: "Campaign sent successfully",
      result,
    });
  } catch (error) {
    console.error("Error sending campaign:", error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return NextResponse.json(
      {
        error: "Failed to send campaign",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
} 