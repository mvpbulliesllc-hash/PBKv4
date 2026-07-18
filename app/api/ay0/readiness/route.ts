import { sql } from "drizzle-orm"
import { NextResponse } from "next/server"
import { checkConnectorHealth } from "@/lib/ay0/connector-health"
import { getDatabase } from "@/lib/db/client"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const maxDuration = 30

async function checkDatabase() {
  try {
    const db = getDatabase()
    const result = await db.execute<{ contacts: string | null }>(sql`select to_regclass('public.crm_contacts') as contacts`)
    return {
      status: result.rows[0]?.contacts ? "ready" : "needs-migration",
      required: ["DATABASE_URL"],
    }
  } catch {
    return {
      status: "unavailable",
      required: ["DATABASE_URL"],
    }
  }
}

function checkBlob() {
  const hasToken = Boolean(process.env.pbk4_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN)
  const hasStore = Boolean(process.env.pbk4_STORE_ID || process.env.BLOB_STORE_ID)
  return {
    status: hasToken && hasStore ? "configured" : "missing-env",
    required: ["pbk4_READ_WRITE_TOKEN", "pbk4_STORE_ID"],
  }
}

export async function GET() {
  const [connectors, database] = await Promise.all([
    checkConnectorHealth(),
    checkDatabase(),
  ])

  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    cloud: {
      connectors,
      database,
      blob: checkBlob(),
    },
    localAgent: {
      status: "bridge-required",
      reason: "Codex, Claude Code, live browser control, local vault access, and workstation video tooling run on the operator machine, not inside Vercel serverless.",
      requiredNext: [
        "Signed local agent process on the Mac",
        "Heartbeat from local agent to PBKv4",
        "Task queue for browser/coding/video/social jobs",
      ],
    },
  })
}
