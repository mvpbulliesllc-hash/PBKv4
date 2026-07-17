import "server-only"

import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

export function getDatabaseUrl() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not configured.")
  return url
}

export function getDatabase() {
  const client = neon(getDatabaseUrl())
  return drizzle({ client, schema })
}
