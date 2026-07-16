import { NextResponse } from "next/server"
import { getRuntimeStatus, isLocalAgentRequest } from "@/lib/local-agent-server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  if (!isLocalAgentRequest(request)) {
    return NextResponse.json(
      { error: "Local agent bridge is available only from the loopback development server." },
      { status: 403 },
    )
  }

  const [codex, claude] = await Promise.all([
    getRuntimeStatus("codex"),
    getRuntimeStatus("claude"),
  ])

  return NextResponse.json({ runtimes: [codex, claude] })
}
