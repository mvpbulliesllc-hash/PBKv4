import { NextResponse } from "next/server"
import { isLocalAgentRequest, runLocalAgent } from "@/lib/local-agent-server"
import type { AgentEffort, Ay0RunMode, LocalRuntimeId } from "@/lib/local-agent-types"

export const dynamic = "force-dynamic"
export const maxDuration = 300

const RUNTIMES = new Set<LocalRuntimeId>(["codex", "claude"])
const EFFORTS = new Set<AgentEffort>(["low", "medium", "high", "xhigh"])
const MODES = new Set<Ay0RunMode>(["single", "swarm", "team", "cron"])

export async function POST(request: Request) {
  if (!isLocalAgentRequest(request)) {
    return NextResponse.json(
      { error: "Local agent bridge is available only from the loopback development server." },
      { status: 403 },
    )
  }

  const body = (await request.json()) as Partial<{
    runtime: LocalRuntimeId
    prompt: string
    model: string
    effort: AgentEffort
    mode: Ay0RunMode
    skills: string[]
  }>

  const prompt = body.prompt?.trim() ?? ""
  if (!body.runtime || !RUNTIMES.has(body.runtime) || !body.effort || !EFFORTS.has(body.effort)) {
    return NextResponse.json({ error: "Invalid runtime configuration." }, { status: 400 })
  }
  if (!body.mode || !MODES.has(body.mode) || (body.skills && !Array.isArray(body.skills))) {
    return NextResponse.json({ error: "Invalid AY.0 orchestration configuration." }, { status: 400 })
  }
  if (!prompt || prompt.length > 8_000) {
    return NextResponse.json({ error: "Prompt must contain between 1 and 8,000 characters." }, { status: 400 })
  }

  try {
    const output = await runLocalAgent({
      runtime: body.runtime,
      prompt,
      model: body.model || "default",
      effort: body.effort,
      mode: body.mode,
      skills: (body.skills ?? []).filter((skill): skill is string => typeof skill === "string").slice(0, 8),
    })
    return NextResponse.json({ output })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Local runtime failed."
    return NextResponse.json({ error: message.slice(0, 2_000) }, { status: 500 })
  }
}
