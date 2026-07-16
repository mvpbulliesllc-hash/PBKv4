import { NextResponse } from "next/server"
import { isLocalAgentRequest } from "@/lib/local-agent-server"
import { listAy0Skills } from "@/lib/ay0/skill-loader"
import { listAy0Tools } from "@/lib/ay0/tool-registry"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  if (!isLocalAgentRequest(request)) {
    return NextResponse.json({ error: "AY.0's local apex catalog is loopback-only." }, { status: 403 })
  }
  const skills = await listAy0Skills()
  return NextResponse.json({ operator: "AY.0", boundary: "apex-only", skills, tools: listAy0Tools() })
}
