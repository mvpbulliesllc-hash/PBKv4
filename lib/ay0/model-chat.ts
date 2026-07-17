import "server-only"

import { getCapabilitySecrets } from "./secret-vault"

export type Ay0ModelProvider = "openai" | "anthropic"

export class ProviderError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
  }
}

const AY0_INSTRUCTIONS = [
  "You are AY.0, the apex AI operator for PBKv4.",
  "Be concise, accurate, and operational.",
  "Never invent prices, warranty terms, insurance outcomes, or timelines.",
  "If a business fact is unknown, say so and ask for the missing fact.",
].join(" ")

async function openAi(prompt: string) {
  const secrets = getCapabilitySecrets("llm.openai", "Ay.0")
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${secrets.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-5-mini",
      instructions: AY0_INSTRUCTIONS,
      input: prompt,
      max_output_tokens: 1_200,
    }),
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
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 1_200,
      system: AY0_INSTRUCTIONS,
      messages: [{ role: "user", content: prompt }],
    }),
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

export function runAy0Model(provider: Ay0ModelProvider, prompt: string) {
  return provider === "openai" ? openAi(prompt) : anthropic(prompt)
}
