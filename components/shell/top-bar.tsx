"use client"

import { useState } from "react"
import { Hexagon, ChevronRight, Circle, Command, Bell, GitPullRequestArrow, PanelRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function TopBar({
  rightCollapsed,
  onToggleRight,
}: {
  rightCollapsed: boolean
  onToggleRight: () => void
}) {
  const [commandOpen, setCommandOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [deployStatus, setDeployStatus] = useState("Ready")
  const [notices, setNotices] = useState([
    "CRM health check needs production env confirmation.",
    "Slack connector installed in Vercel Connect.",
    "Local Matrix ENV bridge is loopback-only.",
  ])

  const runCommand = async (command: string) => {
    setCommandOpen(false)
    if (command === "Open Matrix ENV") {
      setNotices(["Matrix ENV lives in the left agent panel. Production dispatch requires the signed local bridge."])
      setNotificationsOpen(true)
      return
    }

    const endpoint = command === "Check CRM health" ? "/api/crm/health" : "/api/ay0/readiness"
    setDeployStatus("Checking")
    try {
      const response = await fetch(endpoint, { cache: "no-store" })
      const payload = await response.json().catch(() => ({})) as Record<string, unknown>
      const status = typeof payload.status === "string" ? payload.status : response.ok ? "ready" : "needs attention"
      setNotices([`${command}: ${status}`, `HTTP ${response.status}`, `Checked ${new Date().toLocaleTimeString()}`])
      setDeployStatus(response.ok ? "Checked" : "Review")
    } catch {
      setNotices([`${command}: failed to reach ${endpoint}`, "Check deployment logs or local dev server."])
      setDeployStatus("Review")
    }
    setNotificationsOpen(true)
  }

  return (
    <header className="gloss flex h-11 shrink-0 items-center gap-3 border-b border-line px-3">
      <div className="flex items-center gap-2">
        <span className="grid size-6 place-items-center rounded-md bg-accent text-void">
          <Hexagon className="size-3.5" />
        </span>
        <span className="text-sm font-semibold tracking-tight text-text">Paragon Exterior</span>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-text-muted">
        <ChevronRight className="size-3.5 text-text-faint" />
        <span className="rounded-md px-1.5 py-0.5 hover:bg-hover">bbb5</span>
        <ChevronRight className="size-3.5 text-text-faint" />
        <span className="rounded-md px-1.5 py-0.5 text-text hover:bg-hover">Launch Campaign</span>
      </div>

      <div className="relative ml-3 hidden md:block">
      <button
        onClick={() => setCommandOpen((value) => !value)}
        className="flex items-center gap-2 rounded-md border border-line bg-void px-2.5 py-1 text-xs text-text-faint transition-colors hover:border-line-strong"
      >
        <Command className="size-3" />
        Command palette
        <span className="rounded bg-elevated px-1 text-[10px]">⌘K</span>
      </button>
      {commandOpen ? (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-lg border border-line-strong bg-elevated p-2 shadow-2xl shadow-black/60">
          <input
            autoFocus
            placeholder="Search modules, commands, agents..."
            className="w-full rounded-md border border-line bg-void px-2 py-1.5 text-xs text-text placeholder:text-text-faint focus:outline-none"
          />
          <div className="mt-2 space-y-1 text-xs text-text-muted">
            {["Open Matrix ENV", "Check CRM health", "Open connector status"].map((item) => (
              <button key={item} onClick={() => void runCommand(item)} className="block w-full rounded px-2 py-1 text-left hover:bg-hover hover:text-text">
                {item}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <span className="flex items-center gap-1.5 rounded-md border border-line bg-void px-2 py-1 text-[11px] text-text-muted">
          <Circle className="size-2 fill-accent text-accent" />
          Live
        </span>
        <div className="relative">
        <button
          onClick={() => setNotificationsOpen((value) => !value)}
          title="Notifications"
          className="grid size-8 place-items-center rounded-md text-text-muted transition-colors hover:bg-hover hover:text-text"
        >
          <Bell className="size-4" />
        </button>
        {notificationsOpen ? (
          <div className="absolute right-0 top-full z-50 mt-1 w-64 rounded-lg border border-line-strong bg-elevated p-2 text-xs shadow-2xl shadow-black/60">
            {notices.map((item) => (
              <p key={item} className="border-b border-line px-2 py-1.5 text-text-muted last:border-b-0">{item}</p>
            ))}
          </div>
        ) : null}
        </div>
        <button
          onClick={onToggleRight}
          title="Toggle config pane"
          className={cn(
            "grid size-8 place-items-center rounded-md transition-colors hover:bg-hover hover:text-text",
            rightCollapsed ? "text-text-muted" : "bg-hover text-text",
          )}
        >
          <PanelRight className="size-4" />
        </button>
        <button
          onClick={() => {
            void runCommand("Open connector status")
          }}
          className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-void"
          title={`Deploy status: ${deployStatus}`}
        >
          <GitPullRequestArrow className="size-3.5" />
          {deployStatus === "Ready" ? "Deploy" : deployStatus}
        </button>
      </div>
    </header>
  )
}
