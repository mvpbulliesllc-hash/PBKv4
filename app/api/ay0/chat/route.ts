import { NextResponse } from "next/server"
import { getCapabilitySecrets } from "@/lib/ay0/secret-vault"
import { isLocalAgentRequest } from "@/lib/local-agent-server"

export const dynamic = "force-dynamic"
export const maxDuration = 60

type Provider = "openai" | "anthropic"

class ProviderError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
  }
}

async function openAi(prompt: string) {
  const secrets = getCapabilitySecrets("llm.openai", "Ay.0")
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${secrets.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-5-mini", input: prompt }),
    signal: AbortSignal.timeout(55_000),
  })
  if (!response.ok) throw new ProviderError("OpenAI rejected the request. Check account access or billing.", response.status)
  const payload = await response.json() as { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> }
  const text = payload.output_text || payload.output?.flatMap((item) => item.content ?? []).find((item) => item.type === "output_text")?.text
  if (!text) throw new Error("OpenAI returned no text")
  return { text, model: "gpt-5-mini" }
}

async function anthropic(prompt: string) {
  const secrets = getCapabilitySecrets("llm.anthropic", "Ay.0")
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": secrets.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "claude-sonnet-5", max_tokens: 1_200, messages: [{ role: "user", content: prompt }] }),
    signal: AbortSignal.timeout(55_000),
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: { message?: string } } | null
    const lowCredit = payload?.error?.message?.toLowerCase().includes("credit balance")
    throw new ProviderError(
      lowCredit ? "Anthropic API credit balance is too low. Add credits in Anthropic Plans & Billing." : "Anthropic rejected the request. Check account access or billing.",
      response.status,
    )
  }
  const payload = await response.json() as { content?: Array<{ type?: string; text?: string }> }
  const text = payload.content?.find((item) => item.type === "text")?.text
  if (!text) throw new Error("Anthropic returned no text")
  return { text, model: "claude-sonnet-5" }
}

export async function POST(request: Request) {
  if (!isLocalAgentRequest(request)) {
    return NextResponse.json({ error: "AY.0 vault chat is loopback-only." }, { status: 403 })
  }
  const body = await request.json() as Partial<{ provider: Provider; prompt: string }>
  const prompt = body.prompt?.trim() ?? ""
  if ((body.provider !== "openai" && body.provider !== "anthropic") || !prompt || prompt.length > 4_000) {
    return NextResponse.json({ error: "Invalid provider or prompt." }, { status: 400 })
  }
  try {
    const result = body.provider === "openai" ? await openAi(prompt) : await anthropic(prompt)
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof ProviderError
      ? error.message
      : `${body.provider} is unavailable. Check connector health and credential scope.`
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
