import {
    pgTable,
    serial,
    varchar,
    integer,
    text,
    jsonb,
    timestamp,
    boolean,
    uniqueIndex
  } from "drizzle-orm/pg-core";
  import { sql } from "drizzle-orm";
  import { Relation } from "drizzle-orm";
  
  
  export const subscribedUsers = pgTable("subscribed_users", {
    id: serial('id').primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    type: varchar("type", { length: 50 }).notNull(),
    subscriptionStatus: varchar("subscription_status", { length: 50 }),  // Allow null
    currentPlan: varchar("current_plan", { length: 50 }),  // Allow null
    nextInvoiceDate: timestamp("next_invoice_date"),  // Allow null
    InvoicePdfUrl: varchar("invoice_pdf_url"),  // Allow null
  });

  export const userSubscriptions = pgTable("user_subscriptions", {
    id: serial("id").primaryKey(),
    clerkUserId: varchar("clerk_user_id").notNull(), // Clerk's user ID
    stripeUserId: varchar("stripe_user_id").notNull(), // Stripe customer ID
    email: varchar("email").notNull(), // User's email
    type: varchar("type").notNull(), // Event type (e.g., payment, subscription)
    subscriptionStatus: varchar("subscription_status"), // Subscription status (e.g., active, canceled)
    currentPlan: varchar("current_plan"), // Current plan (e.g., Pro, Basic)
    nextInvoiceDate: timestamp("next_invoice_date"), // Next payment date
    invoicePdfUrl: text("invoice_pdf_url"), // Invoice URL
  });
  
  
  export const subscriptionEvents = pgTable("subscription_events", {
    id:serial('id').primaryKey(),
    eventId: text("event_id"),
    eventPayload: jsonb("event_payload").notNull(),
    email: text("email").notNull(),
  });

  export const chatNeon = pgTable("chat_neon", {
    id:serial('id').primaryKey(),
    chatId: varchar("chat_id", { length: 255 }).notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    path: text("path").notNull().unique(), // Ensure path is defined here
    title: varchar("title", { length: 255 }),
    messages: jsonb("messages").notNull(),
  });


export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  searchId: integer("search_id").notNull(),  // Foreign key to the searches table
  userId: varchar("user_id", { length: 255 }).notNull(), // Foreign key to the users table
  commentText: text("comment_text").notNull(),  // The comment text
  createdAt: timestamp("created_at").defaultNow().notNull()  // Timestamp of comment creation
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary").notNull(), // Summary of the article
  url: varchar("url", { length: 2048 }).notNull(), // Source URL
  imageUrl: varchar("image_url", { length: 2048 }), // Optional image URL
  source: varchar("source", { length: 255 }).notNull(), // Source name (e.g., "BBC News")
  date: timestamp("date").defaultNow().notNull(), // Publication date
  category: varchar("category", { length: 255 }), // Optional category
  aiSummary: text("ai_summary"), // AI-generated summary, optional
});
  

export const userTries = pgTable("user_tries", {
  userId: varchar("user_id", { length: 255 }).primaryKey(), // Clerk user ID
  dailyTriesRemaining: integer("daily_tries_remaining")
    .default(5)
    .notNull(), // Number of free tries
  lastResetDate: timestamp("last_reset_date")
    .defaultNow()
    .notNull(), // Timestamp of last reset
});

export const waitlist = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  status: varchar("status", { length: 50 }).default('pending').notNull(), // pending, contacted, etc.
});

export const userChats = pgTable("user_chats", {
  id: serial("id").primaryKey(),
  chatId: varchar("chat_id", { length: 255 }).notNull().unique(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  messages: jsonb("messages").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  endpoint: text('endpoint').notNull(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Add new enum for persona types
export const PersonaType = {
  FREE: 'free',
  PREMIUM: 'premium'
} as const;

// Add subscription tiers
export const SubscriptionTier = {
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise'
} as const;


// Update aiAgentSubscriptions table
export const aiAgentSubscriptions = pgTable("ai_agent_subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  isSubscribed: boolean("is_subscribed").default(false).notNull(),
  subscriptionTier: varchar("subscription_tier", { length: 50 }).notNull(), // free, pro, enterprise
  dailyMessageLimit: integer("daily_message_limit").default(10).notNull(),
  messagesUsedToday: integer("messages_used_today").default(0),
  lastResetDate: timestamp("last_reset_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

