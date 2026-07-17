import { NextResponse } from "next/server"
import { getCapabilitySecrets } from "@/lib/ay0/secret-vault"
import { isLocalAgentRequest } from "@/lib/local-agent-server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  if (!isLocalAgentRequest(request)) {
    return NextResponse.json({ error: "Composio inventory is loopback-only." }, { status: 403 })
  }
  try {
    const secrets = getCapabilitySecrets("agent.composio", "Ay.0")
    const response = await fetch("https://backend.composio.dev/api/v3.1/connected_accounts?limit=100", {
      headers: { "x-api-key": secrets.COMPOSIO_API_KEY },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    })
    if (!response.ok) throw new Error("Composio request failed")
    const payload = await response.json() as { items?: Array<{ status?: string; toolkit?: { slug?: string } }> }
    const items = payload.items ?? []
    const activeToolkits = [...new Set(items.filter((item) => item.status === "ACTIVE").map((item) => item.toolkit?.slug).filter((slug): slug is string => Boolean(slug)))].sort()
    const expiredToolkits = [...new Set(items.filter((item) => item.status === "EXPIRED").map((item) => item.toolkit?.slug).filter((slug): slug is string => Boolean(slug)))].sort()
    return NextResponse.json({ total: items.length, active: items.filter((item) => item.status === "ACTIVE").length, expired: items.filter((item) => item.status === "EXPIRED").length, activeToolkits, expiredToolkits })
  } catch {
    return NextResponse.json({ error: "Composio inventory unavailable." }, { status: 502 })
  }
}
