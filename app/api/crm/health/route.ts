import { sql } from "drizzle-orm"
import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/db/client"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const db = getDatabase()
    const result = await db.execute<{ contacts: string | null }>(sql`select to_regclass('public.crm_contacts') as contacts`)
    const schema = result.rows[0]
    return NextResponse.json({
      status: schema?.contacts ? "ready" : "needs-migration",
      database: "neon-postgres",
      checkedAt: new Date().toISOString(),
    }, { status: schema?.contacts ? 200 : 503 })
  } catch {
    return NextResponse.json({
      status: "unavailable",
      database: "neon-postgres",
      checkedAt: new Date().toISOString(),
    }, { status: 503 })
  }
}
