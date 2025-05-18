import { pgTable, varchar, integer, timestamp, text, boolean, json, serial, jsonb } from "drizzle-orm/pg-core";

export const promptUsage = pgTable("prompt_usage", {
  userId: varchar("user_id", { length: 255 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  dailyPromptUsage: integer("daily_prompt_usage").notNull().default(0),
  lastPromptUsageDate: timestamp("last_prompt_usage_date").notNull(),
  maxDailyPrompts: integer("max_daily_prompts").notNull().default(15),
});

export const subscribedUsers = pgTable("subscribed_users", {
  id: serial('id').primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(), // Clerk user ID
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }), // Add Stripe customer ID
  email: varchar("email", { length: 255 }).notNull().unique(),
  type: varchar("type", { length: 50 }).notNull(),
  subscriptionStatus: varchar("subscription_status", { length: 50 }),  // Allow null
  currentPlan: varchar("current_plan", { length: 50 }),  // Allow null
  nextInvoiceDate: timestamp("next_invoice_date"),  // Allow null
  InvoicePdfUrl: varchar("invoice_pdf_url"),  // Allow null
});

export const userUsage = pgTable("user_usage", {
  userId: varchar("user_id", { length: 255 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  totalPrompts: integer("total_prompts").notNull().default(0),
  dailyAdvancedUsage: integer("daily_advanced_usage").notNull().default(0),
  lastUsageDate: timestamp("last_usage_date").notNull(),
});

export const subscriptionEvents = pgTable("subscription_events", {
  id: serial('id').primaryKey(),
  eventId: text("event_id"),
  eventType: text("event_type").notNull(),
  eventPayload: jsonb("event_payload").notNull(),
  email: text("email").notNull(),
  clerkId: text("clerk_id"),
});
export const campaigns = pgTable("campaigns", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  template: varchar("template", { length: 255 }).notNull(),
  audience: varchar("audience", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  content: text("content"),
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  recipients: integer("recipients").notNull().default(0),
  opens: integer("opens").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  bounceRate: integer("bounce_rate").notNull().default(0),
  metadata: json("metadata").$type<{
    tags?: string[];
    customFields?: Record<string, any>;
  }>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type PromptUsage = typeof promptUsage.$inferSelect;
export type SubscribedUsers = typeof subscribedUsers.$inferSelect;
export type UserUsage = typeof userUsage.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert; 