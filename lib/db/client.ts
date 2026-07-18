import "server-only"

import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

export function getDatabaseUrl() {
  const url =
    process.env.pbkv4_POSTGRES_URL ??
    process.env.DATABASE_URL ??
    process.env.pbk4_POSTGRES_URL ??
    process.env.POSTGRES_URL ??
    process.env.pbkv4_POSTGRES_PRISMA_URL ??
    process.env.pbk4_POSTGRES_PRISMA_URL
  if (!url) throw new Error("A supported Postgres runtime URL is not configured.")
  return url
}

export function getDatabase() {
  const client = neon(getDatabaseUrl())
  return drizzle({ client, schema })
}
