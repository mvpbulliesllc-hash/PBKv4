"use client"

import { Bot, CheckCircle2, CircleAlert, LoaderCircle, PanelLeftClose, TerminalSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LocalRuntimeId } from "@/lib/local-agent-types"
import { useLocalAgents } from "./local-agent-context"

export function RuntimeTerminal({ runtime, onCollapse }: { runtime: LocalRuntimeId; onCollapse?: () => void }) {
  const { statuses, runs, statusError } = useLocalAgents()
  const status = statuses[runtime]
  const run = runs[runtime]
  const isCodex = runtime === "codex"
  const label = isCodex ? "Codex ENV" : "Claude Code ENV"
  const Icon = isCodex ? TerminalSquare : Bot

  return (
    <section className="flex h-full min-h-0 flex-col bg-panel" aria-label={label}>
      <header className="flex h-9 shrink-0 items-center gap-2 border-b border-line px-2.5">
        <Icon className="size-3.5 text-accent" />
        <span className="text-xs font-medium text-text">{label}</span>
        <span className="ml-auto flex items-center gap-1.5 text-[10px] text-text-faint">
          <span
            className={cn(
              "size-1.5 rounded-full",
              status?.installed && status.authenticated ? "bg-live" : status?.installed ? "bg-warn" : "bg-line-strong",
            )}
          />
          {status ? (status.authenticated ? "Ready" : status.installed ? "Sign-in needed" : "Not installed") : "Checking"}
        </span>
        {onCollapse ? (
          <button
            onClick={onCollapse}
            title="Collapse Matrix environments"
            className="grid size-7 place-items-center rounded-md text-text-muted transition-colors hover:bg-hover hover:text-text"
          >
            <PanelLeftClose className="size-3.5" />
          </button>
        ) : null}
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-2.5 font-mono text-[11px]">
        <div className="flex items-center justify-between border-b border-line pb-2 text-text-faint">
          <span>{status?.version || (statusError ? "Bridge unavailable" : "Detecting local runtime…")}</span>
          <span>LOCAL</span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto rounded-md border border-line bg-void p-2.5 text-text-muted">
          {run ? (
            <>
              <div className="mb-2 flex items-center gap-1.5 text-text-faint">
                {run.status === "running" ? <LoaderCircle className="size-3 animate-spin" /> : null}
                {run.status === "complete" ? <CheckCircle2 className="size-3 text-live" /> : null}
                {run.status === "error" ? <CircleAlert className="size-3 text-warn" /> : null}
                <span>{run.model} · {run.effort}</span>
              </div>
              <pre className="whitespace-pre-wrap break-words font-mono leading-relaxed">{run.output}</pre>
            </>
          ) : (
            <div className="space-y-1.5 text-text-faint">
              <p>$ {isCodex ? "codex exec" : "claude -p"}</p>
              <p>Waiting for AY.0 to dispatch a Matrix ENV prompt.</p>
              <p className="text-[10px]">Workspace: PBKv4 Operator OS</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
