import { sql } from "drizzle-orm"
import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/db/client"
import { isOperatorRequest } from "@/lib/operator-auth"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  if (!isOperatorRequest(request)) {
    return NextResponse.json({ error: "Operator authorization required." }, { status: 403 })
  }

  try {
    const db = getDatabase()
    await db.execute(sql`select 1`)
    return NextResponse.json({ status: "ready", database: "neon-postgres", checkedAt: new Date().toISOString() })
  } catch (error) {
    return NextResponse.json({
      status: "unavailable",
      error: error instanceof Error ? error.message : "Database unavailable.",
    }, { status: 503 })
  }
}
