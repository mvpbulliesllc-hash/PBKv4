import { NextResponse } from "next/server"
import { checkConnectorHealth } from "@/lib/ay0/connector-health"
import { isLocalAgentRequest } from "@/lib/local-agent-server"

export const dynamic = "force-dynamic"
export const maxDuration = 30

export async function GET(request: Request) {
  if (!isLocalAgentRequest(request)) {
    return NextResponse.json({ error: "AY.0 connector health is loopback-only." }, { status: 403 })
  }
  return NextResponse.json({ checkedAt: new Date().toISOString(), connectors: await checkConnectorHealth() })
}
