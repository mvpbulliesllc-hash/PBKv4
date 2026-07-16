"use client"

import { useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Plus,
  X,
  Lock,
  Share2,
  SquareArrowOutUpRight,
  LayoutPanelTop,
  Monitor,
  Mic,
  Video,
  ScreenShare,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Tab = { id: string; title: string; url: string }

const INITIAL_TABS: Tab[] = [
  { id: "1", title: "Workbench", url: "app.obsidian.dev/workbench" },
  { id: "2", title: "Analytics", url: "app.obsidian.dev/analytics" },
]

export function BrowserView() {
  const [tabs, setTabs] = useState(INITIAL_TABS)
  const [activeTab, setActiveTab] = useState("1")
  const [recAudio, setRecAudio] = useState(false)
  const [recVideo, setRecVideo] = useState(false)
  const [recScreen, setRecScreen] = useState(false)
  const recording = recAudio || recVideo || recScreen

  return (
    <div className="flex h-full flex-col bg-void">
      {/* Tab strip */}
      <div className="flex shrink-0 items-end gap-1 border-b border-line px-2 pt-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "group flex max-w-44 items-center gap-2 rounded-t-lg border border-b-0 px-3 py-1.5 text-xs transition-colors",
              activeTab === t.id
                ? "gloss border-line text-text"
                : "border-transparent text-text-muted hover:bg-hover/50",
            )}
          >
            <Monitor className="size-3.5 shrink-0 text-text-faint" />
            <span className="truncate">{t.title}</span>
            <span
              onClick={(e) => {
                e.stopPropagation()
                if (tabs.length > 1) {
                  const next = tabs.filter((x) => x.id !== t.id)
                  setTabs(next)
                  if (activeTab === t.id) setActiveTab(next[0].id)
                }
              }}
              className="grid size-4 place-items-center rounded opacity-0 transition-opacity hover:bg-hover group-hover:opacity-100"
            >
              <X className="size-3" />
            </span>
          </button>
        ))}
        <button
          onClick={() => {
            const id = String(Date.now())
            setTabs([...tabs, { id, title: "New Tab", url: "about:blank" }])
            setActiveTab(id)
          }}
          className="mb-1 grid size-6 place-items-center rounded-md text-text-muted transition-colors hover:bg-hover hover:text-text"
        >
          <Plus className="size-3.5" />
        </button>
      </div>

      {/* Chrome / omnibox */}
      <div className="flex shrink-0 items-center gap-1.5 border-b border-line px-2 py-1.5">
        <ChromeBtn title="Back">
          <ArrowLeft className="size-4" />
        </ChromeBtn>
        <ChromeBtn title="Forward">
          <ArrowRight className="size-4" />
        </ChromeBtn>
        <ChromeBtn title="Reload">
          <RotateCw className="size-4" />
        </ChromeBtn>

        <div className="mx-1 flex min-w-0 flex-1 items-center gap-2 rounded-md border border-line bg-panel px-3 py-1.5">
          <Lock className="size-3.5 shrink-0 text-text-faint" />
          <span className="truncate text-xs text-text-muted">
            {tabs.find((t) => t.id === activeTab)?.url ?? "about:blank"}
          </span>
        </div>

        {/* Record push-buttons — hard-wired capture */}
        <div className="mx-1 flex items-center gap-0.5 rounded-md border border-line bg-panel px-0.5 py-0.5">
          <RecBtn title="Record audio" active={recAudio} onClick={() => setRecAudio((v) => !v)}>
            <Mic className="size-4" />
          </RecBtn>
          <RecBtn title="Record video" active={recVideo} onClick={() => setRecVideo((v) => !v)}>
            <Video className="size-4" />
          </RecBtn>
          <RecBtn title="Record screen" active={recScreen} onClick={() => setRecScreen((v) => !v)}>
            <ScreenShare className="size-4" />
          </RecBtn>
          {recording ? (
            <span className="flex items-center gap-1 pl-1 pr-1.5 text-[10px] font-medium text-live">
              <span className="size-1.5 animate-pulse rounded-full bg-live" />
              REC
            </span>
          ) : null}
        </div>

        <ChromeBtn title="Share">
          <Share2 className="size-4" />
        </ChromeBtn>
        <ChromeBtn title="Open external">
          <SquareArrowOutUpRight className="size-4" />
        </ChromeBtn>
        <ChromeBtn title="Layout">
          <LayoutPanelTop className="size-4" />
        </ChromeBtn>
      </div>

      {/* Viewport */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="grid h-full place-items-center p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 grid size-12 place-items-center rounded-xl border border-line bg-panel">
              <Monitor className="size-5 text-text-faint" />
            </div>
            <p className="text-sm font-medium text-text">Main viewport</p>
            <p className="mx-auto mt-1 max-w-sm text-pretty text-xs leading-relaxed text-text-faint">
              This is the 60% work surface. Wire Hume here as the backbone, render live app previews,
              embedded browsers, or agent output. Fully configurable per hub.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function RecBtn({
  children,
  title,
  active,
  onClick,
}: {
  children: React.ReactNode
  title: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={cn(
        "grid size-7 place-items-center rounded transition-colors",
        active ? "bg-live/15 text-live" : "text-text-muted hover:bg-hover hover:text-text",
      )}
    >
      {children}
    </button>
  )
}

function ChromeBtn({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <button
      title={title}
      className="grid size-8 shrink-0 place-items-center rounded-md text-text-muted transition-colors hover:bg-hover hover:text-text"
    >
      {children}
    </button>
  )
}
