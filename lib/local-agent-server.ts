import "server-only"

import { execFile } from "node:child_process"
import { access } from "node:fs/promises"
import { homedir } from "node:os"
import { join } from "node:path"
import { promisify } from "node:util"
import type { AgentEffort, LocalRuntimeId, RuntimeStatus } from "./local-agent-types"

const execFileAsync = promisify(execFile)

const RUNTIMES: Record<LocalRuntimeId, { bin: string; label: string }> = {
  codex: {
    bin: process.env.CODEX_CLI_PATH ?? "/Applications/ChatGPT.app/Contents/Resources/codex",
    label: "Codex · ChatGPT App",
  },
  claude: {
    bin: process.env.CLAUDE_CLI_PATH ?? join(homedir(), ".local/bin/claude"),
    label: "Claude Code · Anthropic",
  },
}

export function isLocalAgentRequest(request: Request) {
  const hostname = new URL(request.url).hostname
  return process.env.NODE_ENV !== "production" && (hostname === "127.0.0.1" || hostname === "localhost" || hostname === "::1")
}

async function isInstalled(bin: string) {
  try {
    await access(bin)
    return true
  } catch {
    return false
  }
}

async function commandSucceeds(bin: string, args: string[]) {
  try {
    await execFileAsync(bin, args, { timeout: 15_000, maxBuffer: 256_000 })
    return true
  } catch {
    return false
  }
}

export async function getRuntimeStatus(id: LocalRuntimeId): Promise<RuntimeStatus> {
  const runtime = RUNTIMES[id]
  const installed = await isInstalled(runtime.bin)
  if (!installed) {
    return { id, label: runtime.label, version: null, installed: false, authenticated: false, localOnly: true }
  }

  const [{ stdout }, authenticated] = await Promise.all([
    execFileAsync(runtime.bin, ["--version"], { timeout: 15_000, maxBuffer: 256_000 }),
    id === "codex"
      ? commandSucceeds(runtime.bin, ["login", "status"])
      : commandSucceeds(runtime.bin, ["auth", "status"]),
  ])

  return {
    id,
    label: runtime.label,
    version: stdout.trim(),
    installed: true,
    authenticated,
    localOnly: true,
  }
}

export async function runLocalAgent(input: {
  runtime: LocalRuntimeId
  prompt: string
  model: string
  effort: AgentEffort
}) {
  const runtime = RUNTIMES[input.runtime]
  const modelArgs = input.model === "default" ? [] : ["--model", input.model]
  const args = input.runtime === "codex"
    ? [
        "exec",
        "--ephemeral",
        "--color",
        "never",
        "--sandbox",
        "workspace-write",
        "-C",
        process.cwd(),
        ...modelArgs,
        "-c",
        `model_reasoning_effort="${input.effort}"`,
        input.prompt,
      ]
    : [
        "-p",
        "--output-format",
        "text",
        "--permission-mode",
        "acceptEdits",
        "--no-session-persistence",
        ...modelArgs,
        "--effort",
        input.effort,
        input.prompt,
      ]

  const { stdout, stderr } = await execFileAsync(runtime.bin, args, {
    cwd: process.cwd(),
    timeout: 180_000,
    maxBuffer: 2_000_000,
  })

  return (stdout || stderr).trim()
}
