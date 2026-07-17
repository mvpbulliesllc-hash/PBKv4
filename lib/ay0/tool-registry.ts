import "server-only"

import { inspectCapability } from "./secret-vault"
import type { Ay0ToolStatus } from "./types"

const TOOLS = [
  ["codex", "Codex / ChatGPT", null, "Local app bridge"],
  ["claude", "Claude Code", null, "Local app bridge"],
  ["openai", "OpenAI models", "llm.openai", "OPENAI_API_KEY"],
  ["anthropic", "Anthropic models", "llm.anthropic", "ANTHROPIC_API_KEY"],
  ["openrouter", "OpenRouter", "llm.openrouter", "OPENROUTER_API_KEY"],
  ["gemini", "Google Gemini", "llm.gemini", "GEMINI_API_KEY + GEMINI_PROJECT_ID"],
  ["nous", "Nous Research", "llm.nous", "NOUS_API_KEY"],
  ["nvidia", "NVIDIA NIM", "llm.nvidia", "NVIDIA_API_KEY"],
  ["firecrawl", "Firecrawl", "scrape.firecrawl", "FIRECRAWL_API_KEY"],
  ["exa", "Exa search", "scrape.exa", "EXA_API_KEY"],
  ["composio", "Composio", "agent.composio", "COMPOSIO_API_KEY + COMPOSIO_ORG_TOKEN"],
  ["zen", "Zen", "agent.zen", "ZEN_API_KEY"],
  ["creative-tim", "Creative Tim registry", "creative-tim.registry", "CREATIVE_TIM_API_KEY"],
  ["openclaw", "OpenClaw trainer", "openclaw.trainer", "OPENCLAW_AGENT_TRAINER_API_KEY"],
  ["github", "GitHub", "infra.github", "Fine-grained repository PAT required"],
  ["vercel", "Vercel", "infra.vercel", "Operator dashboard authentication"],
] as const

export function listAy0Tools(): Ay0ToolStatus[] {
  return TOOLS.map(([id, label, capability, configuration]) => {
    if (!capability) return { id, label, boundary: "apex-only", configured: true, configuration, status: "env-ready" }
    const inspection = inspectCapability(capability, "Ay.0")
    return {
      id,
      label,
      boundary: "apex-only",
      configured: inspection.state === "env-ready",
      configuration,
      status: inspection.state,
    }
  })
}
