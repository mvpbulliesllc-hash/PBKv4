import { NextResponse } from "next/server"
import { checkConnectorHealth } from "@/lib/ay0/connector-health"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const maxDuration = 30

export async function GET() {
  return NextResponse.json({ checkedAt: new Date().toISOString(), connectors: await checkConnectorHealth() })
}
