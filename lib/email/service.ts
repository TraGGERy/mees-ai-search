import { Resend } from 'resend';
import { db } from '@/db/db';
import { userUsage } from '@/db/schema';
import { desc } from 'drizzle-orm';

// Initialize Resend with API key
let resend: Resend;
try {
  console.log('Checking RESEND_API_KEY configuration...');
  console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
  console.log('RESEND_API_KEY length:', process.env.RESEND_API_KEY?.length);
  
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not configured. Email sending will be disabled.');
  } else {
    console.log('Initializing Resend with API key...');
    resend = new Resend(process.env.RESEND_API_KEY);
    console.log('Resend initialized successfully');
  }
} catch (error) {
  console.error('Error initializing Resend:', error);
}

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function sendCampaignEmail(campaign: {
  subject: string;
  content: string;
  template: string;
}) {
  try {
    console.log('Checking Resend instance...');
    if (!resend) {
      console.error('Resend instance is not initialized');
      throw new Error('Email service is not configured. Please add RESEND_API_KEY to your environment variables.');
    }

    console.log('Starting to send campaign emails...');
    console.log('Campaign details:', campaign);

    // Get first 100 users from the database
    console.log('Fetching users from database...');
    const users = await db
      .select({
        email: userUsage.email,
        userId: userUsage.userId,
      })
      .from(userUsage)
      .orderBy(desc(userUsage.lastUsageDate))
      .limit(100);

    console.log(`Found ${users.length} users to send emails to`);

    if (!users.length) {
      throw new Error('No users found to send emails to');
    }

    // Prepare email content based on template
    console.log('Preparing email content...');
    let emailContent = campaign.content;
    if (campaign.template === 'feature-announcement') {
      emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">New Feature Announcement</h1>
          ${campaign.content}
          <div style="margin-top: 20px; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
            <p style="margin: 0;">Stay tuned for more updates!</p>
          </div>
        </div>
      `;
    } else if (campaign.template === 'newsletter') {
      emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Newsletter</h1>
          ${campaign.content}
          <div style="margin-top: 20px; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
            <p style="margin: 0;">Thank you for being a valued user!</p>
          </div>
        </div>
      `;
    } else if (campaign.template === 'promotion') {
      emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Special Promotion</h1>
          ${campaign.content}
          <div style="margin-top: 20px; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
            <p style="margin: 0;">Don't miss out on this exclusive offer!</p>
          </div>
        </div>
      `;
    }

    console.log('Sending emails...');
    const results = [];
    const BATCH_SIZE = 2; // Send 2 emails at a time
    const DELAY_MS = 1000; // Wait 1 second between batches

    // Process users in batches
    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${i / BATCH_SIZE + 1} of ${Math.ceil(users.length / BATCH_SIZE)}`);

      // Send emails in current batch
      const batchPromises = batch.map(async (user) => {
        try {
          console.log(`Sending email to ${user.email}`);
          const result = await resend.emails.send({
            from: 'Mees AI <noreply@mees-ai.app>',
            to: user.email,
            subject: campaign.subject,
            html: emailContent,
            replyTo: 'support@mees-ai.app'
          });
          console.log(`Successfully sent email to ${user.email}`);
          return { status: 'fulfilled', value: result };
        } catch (error) {
          console.error(`Failed to send email to ${user.email}:`, error);
          return { status: 'rejected', reason: error };
        }
      });

      // Wait for current batch to complete
      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults);

      // Add delay between batches if not the last batch
      if (i + BATCH_SIZE < users.length) {
        console.log(`Waiting ${DELAY_MS}ms before next batch...`);
        await delay(DELAY_MS);
      }
    }

    // Count successful and failed emails
    const successful = results.filter(
      (result) => result.status === 'fulfilled'
    ).length;
    const failed = results.filter(
      (result) => result.status === 'rejected'
    ).length;

    console.log(`Email sending completed. Successful: ${successful}, Failed: ${failed}`);

    return {
      success: true,
      total: users.length,
      successful,
      failed,
    };
  } catch (error) {
    console.error('Error sending campaign emails:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    throw error;
  }
} 