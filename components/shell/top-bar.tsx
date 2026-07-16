"use client"

import { Hexagon, ChevronRight, Circle, Command, Bell, GitPullRequestArrow, PanelRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function TopBar({
  rightCollapsed,
  onToggleRight,
}: {
  rightCollapsed: boolean
  onToggleRight: () => void
}) {
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

      <button className="ml-3 hidden items-center gap-2 rounded-md border border-line bg-void px-2.5 py-1 text-xs text-text-faint transition-colors hover:border-line-strong md:flex">
        <Command className="size-3" />
        Command palette
        <span className="rounded bg-elevated px-1 text-[10px]">⌘K</span>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <span className="flex items-center gap-1.5 rounded-md border border-line bg-void px-2 py-1 text-[11px] text-text-muted">
          <Circle className="size-2 fill-accent text-accent" />
          Live
        </span>
        <button className="grid size-8 place-items-center rounded-md text-text-muted transition-colors hover:bg-hover hover:text-text">
          <Bell className="size-4" />
        </button>
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
        <button className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-void">
          <GitPullRequestArrow className="size-3.5" />
          Deploy
        </button>
      </div>
    </header>
  )
}
