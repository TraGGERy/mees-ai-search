import {
    pgTable,
    serial,
    varchar,
    integer,
    text,
    jsonb,
    timestamp,
    boolean,
    
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
    chatId: varchar("chat_id", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    path: text("path"), // Ensure path is defined here
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
  

export const userTries = pgTable('user_tries', {
  userId: varchar('user_id', { length: 255 }).primaryKey(), // Clerk user ID
  dailyTriesRemaining: integer('daily_tries_remaining').default(5).notNull(), // Number of tries remaining
  lastResetDate: timestamp('last_reset_date').notNull(), // Timestamp of last reset
});


