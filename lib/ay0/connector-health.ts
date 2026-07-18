import "server-only"

import { getCapabilityProbe, getCapabilitySecrets, inspectCapability, type Ay0Seat } from "./secret-vault"
import { inspectSlackConnection } from "@/lib/slack/connect"

export type ConnectorHealth = {
  capability: string
  label: string
  status: "authenticated" | "env-ready" | "missing-env" | "denied" | "manual" | "quarantined" | "not-wired" | "failed"
  latencyMs: number
  remainingCredits: number | "unknown"
  fix: string
}

const PROBES: Array<{ capability: string; seat: Ay0Seat }> = [
  { capability: "llm.openai", seat: "Ay.0" },
  { capability: "llm.anthropic", seat: "Ay.0" },
  { capability: "llm.openrouter", seat: "Ay.0" },
  { capability: "llm.vercel_gateway", seat: "Ay.0" },
  { capability: "llm.gemini", seat: "Ay.0" },
  { capability: "scrape.firecrawl", seat: "Ay.0" },
  { capability: "scrape.exa", seat: "Ay.0" },
  { capability: "agent.composio", seat: "Ay.0" },
  { capability: "automation.n8n", seat: "Ay.0" },
  { capability: "voice.hume", seat: "runner" },
  { capability: "media.mux", seat: "Ay.0" },
  { capability: "render.snaprender", seat: "Ay.0" },
  { capability: "email.agentmail", seat: "Ay.0" },
  { capability: "social.blotato", seat: "Ay.0" },
  { capability: "search.generic", seat: "Ay.0" },
  { capability: "creative-tim.registry", seat: "Ay.0" },
  { capability: "infra.github", seat: "Ay.0" },
  { capability: "infra.vercel", seat: "Ay.0" },
  { capability: "storage.blob", seat: "Ay.0" },
  { capability: "database.neon", seat: "Ay.0" },
  { capability: "comms.slack", seat: "Ay.0" },
]

async function request(url: string, headers: HeadersInit) {
  const response = await fetch(url, { headers, cache: "no-store", signal: AbortSignal.timeout(10_000) })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response
}

async function executeProbe(probe: string, secrets: Record<string, string>) {
  switch (probe) {
    case "openai":
      await request("https://api.openai.com/v1/models", { Authorization: `Bearer ${secrets.OPENAI_API_KEY}` })
      return { remainingCredits: "unknown" as const }
    case "anthropic":
      await request("https://api.anthropic.com/v1/models?limit=1", { "x-api-key": secrets.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" })
      return { remainingCredits: "unknown" as const }
    case "openrouter":
      await request("https://openrouter.ai/api/v1/models", { Authorization: `Bearer ${secrets.OPENROUTER_API_KEY}` })
      return { remainingCredits: "unknown" as const }
    case "vercel-gateway":
      await request("https://ai-gateway.vercel.sh/v1/credits", { Authorization: `Bearer ${secrets.AI_GATEWAY_API_KEY}` })
      return { remainingCredits: "unknown" as const }
    case "gemini":
      await request("https://generativelanguage.googleapis.com/v1beta/models?pageSize=1", { "x-goog-api-key": secrets.GEMINI_API_KEY })
      return { remainingCredits: "unknown" as const }
    case "firecrawl": {
      const response = await request("https://api.firecrawl.dev/v1/team/credit-usage", { Authorization: `Bearer ${secrets.FIRECRAWL_API_KEY}` })
      const payload = await response.json() as { data?: { remaining_credits?: number } }
      return { remainingCredits: payload.data?.remaining_credits ?? "unknown" as const }
    }
    case "composio":
      await request("https://backend.composio.dev/api/v3/toolkits?sort_by=usage", { "x-api-key": secrets.COMPOSIO_API_KEY })
      return { remainingCredits: "unknown" as const }
    case "hume":
      await request("https://api.hume.ai/v0/evi/configs?page_number=0&page_size=1", { "X-Hume-Api-Key": secrets.HUME_API_KEY })
      return { remainingCredits: "unknown" as const }
    case "mux":
      await request("https://api.mux.com/video/v1/assets?limit=1", {
        Authorization: `Basic ${Buffer.from(`${secrets.MUX_TOKEN_ID}:${secrets.MUX_TOKEN_SECRET}`).toString("base64")}`,
      })
      return { remainingCredits: "unknown" as const }
    case "creative-tim":
      await request("https://www.creative-tim.com/ui/r/ai-assistant-panel.json", { Authorization: `Bearer ${secrets.CREATIVE_TIM_API_KEY}` })
      return { remainingCredits: "unknown" as const }
    case "github":
      await request("https://api.github.com/user", {
        Authorization: `Bearer ${secrets.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
      })
      return { remainingCredits: "unknown" as const }
    case "vercel":
      await request("https://api.vercel.com/v2/user", { Authorization: `Bearer ${secrets.VERCEL_TOKEN}` })
      return { remainingCredits: "unknown" as const }
    case "slack-connect":
      await inspectSlackConnection()
      return { remainingCredits: "unknown" as const }
    default:
      return null
  }
}

export async function checkConnectorHealth(): Promise<ConnectorHealth[]> {
  return Promise.all(PROBES.map(async ({ capability, seat }) => {
    const started = performance.now()
    const inspection = inspectCapability(capability, seat)
    if (inspection.state !== "env-ready") {
      return {
        capability,
        label: inspection.label,
        status: inspection.state,
        latencyMs: Math.round(performance.now() - started),
        remainingCredits: "unknown",
        fix: inspection.missingEnv.length ? `Configure: ${inspection.missingEnv.join(", ")}` : "Follow capability policy.",
      } satisfies ConnectorHealth
    }
    const probe = getCapabilityProbe(capability)
    if (!probe) {
      return { capability, label: inspection.label, status: "env-ready", latencyMs: Math.round(performance.now() - started), remainingCredits: "unknown", fix: "No approved read-only probe." } satisfies ConnectorHealth
    }
    try {
      const result = await executeProbe(probe, getCapabilitySecrets(capability, seat))
      return { capability, label: inspection.label, status: "authenticated", latencyMs: Math.round(performance.now() - started), remainingCredits: result?.remainingCredits ?? "unknown", fix: "none" } satisfies ConnectorHealth
    } catch {
      return { capability, label: inspection.label, status: "failed", latencyMs: Math.round(performance.now() - started), remainingCredits: "unknown", fix: "Verify credential scope or rotate the key." } satisfies ConnectorHealth
    }
  }))
}
