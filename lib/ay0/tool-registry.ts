import "server-only"

import { inspectCapability } from "./secret-vault"
import type { Ay0ToolStatus } from "./types"

const TOOLS = [
  ["codex", "Codex / ChatGPT", null, "Local app bridge"],
  ["claude", "Claude Code", null, "Local app bridge"],
  ["openai", "OpenAI models", "llm.openai", "OPENAI_API_KEY"],
  ["anthropic", "Anthropic models", "llm.anthropic", "ANTHROPIC_API_KEY"],
  ["openrouter", "OpenRouter", "llm.openrouter", "OPENROUTER_API_KEY"],
  ["vercel-gateway", "Vercel AI Gateway", "llm.vercel_gateway", "AI_GATEWAY_API_KEY"],
  ["gemini", "Google Gemini", "llm.gemini", "GEMINI_API_KEY + GEMINI_PROJECT_ID"],
  ["nous", "Nous Research", "llm.nous", "NOUS_API_KEY"],
  ["nvidia", "NVIDIA NIM", "llm.nvidia", "NVIDIA_API_KEY"],
  ["firecrawl", "Firecrawl", "scrape.firecrawl", "FIRECRAWL_API_KEY"],
  ["exa", "Exa search", "scrape.exa", "EXA_API_KEY"],
  ["composio", "Composio", "agent.composio", "COMPOSIO_API_KEY + COMPOSIO_ORG_TOKEN"],
  ["zen", "Zen", "agent.zen", "ZEN_API_KEY"],
  ["n8n", "n8n MCP / webhooks", "automation.n8n", "N8N_BASE_URL"],
  ["hume", "Hume voice", "voice.hume", "HUME_API_KEY + HUME_CONFIG_ID"],
  ["mux", "Mux video", "media.mux", "MUX_TOKEN_ID + MUX_TOKEN_SECRET"],
  ["snaprender", "SnapRender", "render.snaprender", "SNAPRENDER_API_KEY"],
  ["agentmail", "AgentMail", "email.agentmail", "AGENTMAIL_API_KEY"],
  ["blotato", "Blotato socials", "social.blotato", "BLOTATO_API_KEY"],
  ["search-api", "Search API", "search.generic", "SEARCH_API_KEY"],
  ["creative-tim", "Creative Tim registry", "creative-tim.registry", "CREATIVE_TIM_API_KEY"],
  ["openclaw", "OpenClaw trainer", "openclaw.trainer", "OPENCLAW_AGENT_TRAINER_API_KEY"],
  ["github", "GitHub", "infra.github", "GITHUB_TOKEN"],
  ["vercel", "Vercel", "infra.vercel", "VERCEL_TOKEN"],
  ["blob", "Vercel Blob", "storage.blob", "pbk4_READ_WRITE_TOKEN + pbk4_STORE_ID"],
  ["neon", "Neon Postgres", "database.neon", "DATABASE_URL"],
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
