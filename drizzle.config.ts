import { defineConfig } from "drizzle-kit"

const url = process.env.DATABASE_URL_UNPOOLED
  ?? process.env.pbk4_POSTGRES_URL_NON_POOLING
  ?? process.env.POSTGRES_URL_NON_POOLING
  ?? process.env.DATABASE_URL
  ?? process.env.pbk4_POSTGRES_URL
  ?? process.env.POSTGRES_URL

if (!url) {
  throw new Error("A supported Postgres migration URL is required for database migrations.")
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url },
  strict: true,
  verbose: true,
})
