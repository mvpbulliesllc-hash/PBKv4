import { NextResponse } from "next/server"
import { ProviderError, runAy0Model, type Ay0ModelProvider } from "@/lib/ay0/model-chat"
import { isLocalAgentRequest } from "@/lib/local-agent-server"

export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function POST(request: Request) {
  if (!isLocalAgentRequest(request)) {
    return NextResponse.json({ error: "AY.0 vault chat is loopback-only." }, { status: 403 })
  }
  const body = await request.json() as Partial<{ provider: Ay0ModelProvider; prompt: string }>
  const prompt = body.prompt?.trim() ?? ""
  if ((body.provider !== "openai" && body.provider !== "anthropic") || !prompt || prompt.length > 4_000) {
    return NextResponse.json({ error: "Invalid provider or prompt." }, { status: 400 })
  }
  try {
    const result = await runAy0Model(body.provider, prompt)
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof ProviderError
      ? error.message
      : `${body.provider} is unavailable. Check connector health and credential scope.`
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
