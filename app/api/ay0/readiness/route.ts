import { sql } from "drizzle-orm"
import { NextResponse } from "next/server"
import { checkConnectorHealth } from "@/lib/ay0/connector-health"
import { getDatabase, getDatabaseUrl } from "@/lib/db/client"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const maxDuration = 30

async function checkDatabase() {
  try {
    getDatabaseUrl()
  } catch {
    return {
      status: "missing-env",
      required: ["DATABASE_URL or pbk4_POSTGRES_URL or POSTGRES_URL or POSTGRES_PRISMA_URL or pbk4_POSTGRES_PRISMA_URL"],
    }
  }

  try {
    const db = getDatabase()
    const result = await db.execute<{ contacts: string | null }>(sql`select to_regclass('public.crm_contacts') as contacts`)
    return {
      status: result.rows[0]?.contacts ? "ready" : "needs-migration",
      required: ["DATABASE_URL"],
    }
  } catch {
    return {
      status: "connection-failed",
      required: ["Valid Neon/Postgres connection string with network access from Vercel"],
    }
  }
}

function checkBlob() {
  const hasToken = Boolean(process.env.pbk4_READ_WRITE_TOKEN || process.env.PBK4_READ_WRITE_TOKEN || process.env.pk4_READ_WRITE_TOKEN || process.env.PK4_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN)
  const hasStore = Boolean(process.env.pbk4_STORE_ID || process.env.PBK4_STORE_ID || process.env.pk4_STORE_ID || process.env.PK4_STORE_ID || process.env.BLOB_STORE_ID)
  return {
    status: hasToken && hasStore ? "configured" : "missing-env",
    required: ["pbk4_READ_WRITE_TOKEN or PBK4_READ_WRITE_TOKEN or pk4_READ_WRITE_TOKEN or PK4_READ_WRITE_TOKEN or BLOB_READ_WRITE_TOKEN", "pbk4_STORE_ID or PBK4_STORE_ID or pk4_STORE_ID or PK4_STORE_ID or BLOB_STORE_ID"],
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
