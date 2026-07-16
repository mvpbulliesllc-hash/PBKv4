import "server-only"

import type { Ay0ToolStatus } from "./types"

const TOOLS = [
  ["codex", "Codex / ChatGPT", "CODEX_CLI_PATH", "Local app bridge"],
  ["claude", "Claude Code", "CLAUDE_CLI_PATH", "Local app bridge"],
  ["github", "GitHub", "GITHUB_TOKEN", "GitHub token"],
  ["vercel", "Vercel", "VERCEL_TOKEN", "Vercel token"],
  ["composio", "Composio", "COMPOSIO_API_KEY", "Composio API key"],
  ["blotato", "Blotato", "BLOTATO_API_KEY", "Blotato API key"],
  ["search", "Search API", "SEARCH_API_KEY", "Search API key"],
  ["n8n", "n8n", "N8N_BASE_URL", "n8n base URL"],
  ["hume", "Hume voice", "HUME_API_KEY", "Hume API key"],
  ["openai", "OpenAI models", "OPENAI_API_KEY", "OpenAI API key"],
  ["anthropic", "Anthropic models", "ANTHROPIC_API_KEY", "Anthropic API key"],
] as const

export function listAy0Tools(): Ay0ToolStatus[] {
  return TOOLS.map(([id, label, env, configuration]) => ({
    id,
    label,
    boundary: "apex-only" as const,
    configured: id === "codex" || id === "claude" || Boolean(process.env[env]),
    configuration,
  }))
}
