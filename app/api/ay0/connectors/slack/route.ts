import { NextResponse } from "next/server"
import { inspectSlackConnection, listSlackChannels } from "@/lib/slack/connect"
import { isLocalAgentRequest } from "@/lib/local-agent-server"

export const dynamic = "force-dynamic"
export const maxDuration = 30

export async function GET(request: Request) {
  if (!isLocalAgentRequest(request)) {
    return NextResponse.json({ error: "Slack connector inspection is loopback-only." }, { status: 403 })
  }
  try {
    const [connection, channels] = await Promise.all([inspectSlackConnection(), listSlackChannels()])
    return NextResponse.json({ status: "authenticated", connection, channels })
  } catch (error) {
    return NextResponse.json({
      status: "unavailable",
      error: error instanceof Error ? error.message : "Slack connector unavailable.",
    }, { status: 502 })
  }
}
