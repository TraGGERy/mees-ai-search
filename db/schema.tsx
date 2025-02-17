import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar
} from "drizzle-orm/pg-core";
  
  
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

  
  export const subscriptionEvents = pgTable("subscription_events", {
    id: serial('id').primaryKey(),
    eventId: text("event_id"),
    eventType: text("event_type").notNull(),
    eventPayload: jsonb("event_payload").notNull(),
    email: text("email").notNull(),
    clerkId: text("clerk_id"),
  });

  export const userUsage = pgTable("user_usage", {
    userId: varchar("user_id", { length: 255 }).primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    dailyAdvancedUsage: integer("daily_advanced_usage").notNull().default(0),
    lastUsageDate: timestamp("last_usage_date").notNull(),
  }); 

  

