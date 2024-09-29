/** @type { import("drizzle-kit").Config } */

export default {
    schema: "./lib/utils/schema.tsx",
    dialect: 'postgresql',
    dbCredentials: {
      url:"postgresql://athena-ai_owner:Ar0XBvVokyl3@ep-square-waterfall-a5svtxaq.us-east-2.aws.neon.tech/mees-search?sslmode=require",
    }
  };