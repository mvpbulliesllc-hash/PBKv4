"use client"

import { useRef, useState } from "react"
import type { ImperativePanelHandle } from "react-resizable-panels"
import { PanelLeftOpen, PanelRightOpen, PanelBottomOpen } from "lucide-react"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { LeftNav } from "./left-nav"
import { AgentPanel } from "./agent-panel"
import { PanelContainer } from "./panel-container"
import { TopBar } from "./top-bar"
import type { ModuleId } from "./module-registry"
import { LocalAgentProvider } from "./local-agent-context"
import { RuntimeTerminal } from "./runtime-terminal"

export function Workbench() {
  const leftRef = useRef<ImperativePanelHandle>(null)
  const rightRef = useRef<ImperativePanelHandle>(null)
  const dockRef = useRef<ImperativePanelHandle>(null)

  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [rightCollapsed, setRightCollapsed] = useState(false)
  const [dockCollapsed, setDockCollapsed] = useState(false)
  const [active, setActive] = useState("ws-gmail")
  const [hubId, setHubId] = useState("workspace")
  const [mainModule, setMainModule] = useState<ModuleId>("gmail")

  return (
    <LocalAgentProvider>
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-background">
      <TopBar
        rightCollapsed={rightCollapsed}
        onToggleRight={() => (rightCollapsed ? rightRef.current?.expand() : rightRef.current?.collapse())}
      />

      <div className="relative min-h-0 flex-1">
        {/* Floating openers when a side pane is collapsed */}
        {leftCollapsed ? (
          <FloatingOpener side="left" onClick={() => leftRef.current?.expand()}>
            <PanelLeftOpen className="size-4" />
          </FloatingOpener>
        ) : null}
        {rightCollapsed ? (
          <FloatingOpener side="right" onClick={() => rightRef.current?.expand()}>
            <PanelRightOpen className="size-4" />
          </FloatingOpener>
        ) : null}

        <ResizablePanelGroup direction="horizontal" autoSaveId="operator-os-matrix-h-v1">
          {/* LEFT — navigation (0–20%) */}
          <ResizablePanel
            ref={leftRef}
            id="nav"
            order={1}
            defaultSize={16}
            minSize={12}
            maxSize={20}
            collapsible
            collapsedSize={0}
            onCollapse={() => setLeftCollapsed(true)}
            onExpand={() => setLeftCollapsed(false)}
          >
            <LeftNav
              active={active}
              onSelect={setActive}
              onCollapse={() => leftRef.current?.collapse()}
              hubId={hubId}
              onHubChange={setHubId}
              onOpenModule={setMainModule}
            />
          </ResizablePanel>

          <ResizableHandle />

          {/* MIDDLE — agent chat (10–35%) */}
          <ResizablePanel id="agents" order={2} defaultSize={24} minSize={22} maxSize={35}>
            <AgentPanel />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* CENTER — main surface: stacked configurable containers */}
          <ResizablePanel id="main" order={3} defaultSize={42} minSize={30}>
            <ResizablePanelGroup direction="vertical" autoSaveId="obsidian-shell-v">
              <ResizablePanel id="surface" order={1} defaultSize={64} minSize={20}>
                <PanelContainer
                  defaultModule="browser"
                  module={mainModule}
                  onModuleChange={setMainModule}
                />
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* BOTTOM DOCK — configurable + collapsible */}
              <ResizablePanel
                ref={dockRef}
                id="dock"
                order={2}
                defaultSize={36}
                minSize={12}
                collapsible
                collapsedSize={0}
                onCollapse={() => setDockCollapsed(true)}
                onExpand={() => setDockCollapsed(false)}
              >
                <PanelContainer
                  defaultModule="env"
                  collapseIcon="x"
                  onCollapse={() => dockRef.current?.collapse()}
                />
              </ResizablePanel>
            </ResizablePanelGroup>

            {dockCollapsed ? (
              <button
                onClick={() => dockRef.current?.expand()}
                title="Open dock"
                className="gloss-elevated absolute bottom-2 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1.5 rounded-md border border-line px-2.5 py-1 text-xs text-text-muted transition-colors hover:text-text"
              >
                <PanelBottomOpen className="size-3.5" />
                Dock
              </button>
            ) : null}
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* RIGHT — configurable slide-in pane (0–25%) */}
          <ResizablePanel
            ref={rightRef}
            id="rightcfg"
            order={4}
            defaultSize={18}
            minSize={18}
            maxSize={28}
            collapsible
            collapsedSize={0}
            onCollapse={() => setRightCollapsed(true)}
            onExpand={() => setRightCollapsed(false)}
          >
            <ResizablePanelGroup direction="vertical" autoSaveId="matrix-env-runtimes-v">
              <ResizablePanel id="codex-env" order={1} defaultSize={50} minSize={24}>
                <RuntimeTerminal runtime="codex" onCollapse={() => rightRef.current?.collapse()} />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel id="claude-env" order={2} defaultSize={50} minSize={24}>
                <RuntimeTerminal runtime="claude" />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
    </LocalAgentProvider>
  )
}

function FloatingOpener({
  side,
  onClick,
  children,
}: {
  side: "left" | "right"
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={side === "left" ? "Open sidebar" : "Open config"}
      className={cnSide(side)}
    >
      {children}
    </button>
  )
}

function cnSide(side: "left" | "right") {
  const base =
    "gloss-elevated absolute top-2 z-40 grid size-8 place-items-center rounded-md border border-line text-text-muted transition-colors hover:text-text"
  return side === "left" ? `${base} left-2` : `${base} right-2`
}
