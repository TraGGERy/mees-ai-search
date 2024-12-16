/** @type { import("drizzle-kit").Config } */

export default {
    schema: "./db/schema.tsx",
    dialect: 'postgresql',
    dbCredentials: {
      url: "postgresql://athena-ai_owner:Ar0XBvVokyl3@ep-square-waterfall-a5svtxaq.us-east-2.aws.neon.tech/mees_ai_zw?sslmode=require",
    }
  };