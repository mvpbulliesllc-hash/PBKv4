"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type {
  AgentEffort,
  LocalRuntimeId,
  RuntimeRun,
  RuntimeStatus,
} from "@/lib/local-agent-types"

type LocalAgentContextValue = {
  statuses: Partial<Record<LocalRuntimeId, RuntimeStatus>>
  runs: Partial<Record<LocalRuntimeId, RuntimeRun>>
  statusError: string | null
  runAgent: (input: {
    runtime: LocalRuntimeId
    prompt: string
    model: string
    effort: AgentEffort
  }) => Promise<RuntimeRun>
}

const LocalAgentContext = createContext<LocalAgentContextValue | null>(null)

export function LocalAgentProvider({ children }: { children: React.ReactNode }) {
  const [statuses, setStatuses] = useState<Partial<Record<LocalRuntimeId, RuntimeStatus>>>({})
  const [runs, setRuns] = useState<Partial<Record<LocalRuntimeId, RuntimeRun>>>({})
  const [statusError, setStatusError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    fetch("/api/local-agents/status", { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json()) as { runtimes?: RuntimeStatus[]; error?: string }
        if (!response.ok) throw new Error(data.error || "Runtime status unavailable.")
        if (!active) return
        setStatuses(Object.fromEntries((data.runtimes ?? []).map((runtime) => [runtime.id, runtime])))
      })
      .catch((error: unknown) => {
        if (active) setStatusError(error instanceof Error ? error.message : "Runtime status unavailable.")
      })
    return () => {
      active = false
    }
  }, [])

  const runAgent = useCallback(async (input: {
    runtime: LocalRuntimeId
    prompt: string
    model: string
    effort: AgentEffort
  }) => {
    const run: RuntimeRun = {
      id: crypto.randomUUID(),
      ...input,
      output: "Launching local runtime…",
      startedAt: new Date().toISOString(),
      status: "running",
    }
    setRuns((current) => ({ ...current, [input.runtime]: run }))

    try {
      const response = await fetch("/api/local-agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
      const data = (await response.json()) as { output?: string; error?: string }
      if (!response.ok) throw new Error(data.error || "Runtime execution failed.")
      const complete: RuntimeRun = {
        ...run,
        output: data.output || "Runtime completed without text output.",
        finishedAt: new Date().toISOString(),
        status: "complete",
      }
      setRuns((current) => ({ ...current, [input.runtime]: complete }))
      return complete
    } catch (error) {
      const failed: RuntimeRun = {
        ...run,
        output: error instanceof Error ? error.message : "Runtime execution failed.",
        finishedAt: new Date().toISOString(),
        status: "error",
      }
      setRuns((current) => ({ ...current, [input.runtime]: failed }))
      return failed
    }
  }, [])

  const value = useMemo(
    () => ({ statuses, runs, statusError, runAgent }),
    [statuses, runs, statusError, runAgent],
  )

  return <LocalAgentContext.Provider value={value}>{children}</LocalAgentContext.Provider>
}

export function useLocalAgents() {
  const value = useContext(LocalAgentContext)
  if (!value) throw new Error("useLocalAgents must be used inside LocalAgentProvider")
  return value
}
