export type LocalRuntimeId = "codex" | "claude"

export type AgentEffort = "low" | "medium" | "high" | "xhigh"

export type RuntimeStatus = {
  id: LocalRuntimeId
  label: string
  version: string | null
  installed: boolean
  authenticated: boolean
  localOnly: boolean
}

export type RuntimeRun = {
  id: string
  runtime: LocalRuntimeId
  prompt: string
  model: string
  effort: AgentEffort
  output: string
  startedAt: string
  finishedAt?: string
  status: "running" | "complete" | "error"
}

export const RUNTIME_MODELS: Record<LocalRuntimeId, Array<{ label: string; value: string }>> = {
  codex: [
    { label: "App default", value: "default" },
    { label: "GPT-5.4", value: "gpt-5.4" },
    { label: "GPT-5.3 Codex", value: "gpt-5.3-codex" },
  ],
  claude: [
    { label: "App default", value: "default" },
    { label: "Claude Opus", value: "opus" },
    { label: "Claude Sonnet", value: "sonnet" },
    { label: "Claude Fable", value: "fable" },
  ],
}
