"use client"

import { useState } from "react"
import {
  Plus,
  ChevronDown,
  Radio,
  Send,
  Mic,
  AudioLines,
  Paperclip,
  SlidersHorizontal,
  Clock,
  Users,
  User,
  Network,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Mode = { id: string; label: string; icon: typeof User }

const MODES: Mode[] = [
  { id: "single", label: "Single", icon: User },
  { id: "swarm", label: "Swarm", icon: Network },
  { id: "team", label: "Team", icon: Users },
  { id: "cron", label: "Cron", icon: Clock },
]

const ROSTER = [
  { id: "coordinator", name: "Hermes", role: "Coordinator", live: true },
  { id: "builder", name: "Vulcan", role: "Builder", live: false },
  { id: "research", name: "Athena", role: "Research", live: true },
  { id: "strategist", name: "Metis", role: "Strategist", live: false },
  { id: "content", name: "Calliope", role: "Content", live: false },
]

export function AgentPanel() {
  const [mode, setMode] = useState("team")
  const [humeLive, setHumeLive] = useState(false)
  const [draft, setDraft] = useState("")

  return (
    <div className="gloss flex h-full flex-col border-r border-line">
      {/* Header: session + mode */}
      <div className="shrink-0 border-b border-line px-3 py-2.5">
        <div className="flex items-center gap-2">
          <button className="flex min-w-0 items-center gap-1.5 rounded-md px-1.5 py-1 text-sm font-medium text-text transition-colors hover:bg-hover">
            <Radio className="size-3.5 shrink-0 text-accent" />
            <span className="truncate">Workflow · Launch Campaign</span>
            <ChevronDown className="size-3.5 shrink-0 text-text-faint" />
          </button>
          <button
            title="Configure agents"
            className="ml-auto grid size-7 shrink-0 place-items-center rounded-md text-text-muted transition-colors hover:bg-hover hover:text-text"
          >
            <SlidersHorizontal className="size-4" />
          </button>
          <button
            title="New session"
            className="grid size-7 shrink-0 place-items-center rounded-md text-text-muted transition-colors hover:bg-hover hover:text-text"
          >
            <Plus className="size-4" />
          </button>
        </div>

        {/* Mode chips */}
        <div className="mt-2 flex items-center gap-1 rounded-lg bg-void p-1">
          {MODES.map((m) => {
            const Icon = m.icon
            const isActive = mode === m.id
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                  isActive ? "gloss-elevated text-text" : "text-text-muted hover:text-text",
                )}
              >
                <Icon className="size-3.5" />
                {m.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Roster */}
      <div className="shrink-0 border-b border-line px-3 py-2.5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-text-faint">Roster · 5</p>
          <button className="text-[10px] text-text-muted transition-colors hover:text-text">Manage</button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ROSTER.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-1.5 rounded-md border border-line bg-void px-2 py-1"
              title={`${a.name} — ${a.role}`}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  a.live ? "bg-accent shadow-[0_0_6px_var(--color-accent)]" : "bg-line-strong",
                )}
              />
              <span className="text-xs text-text">{a.name}</span>
              <span className="text-[10px] text-text-faint">{a.role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Conversation */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-4">
        <SystemLine text="Team mode active — Hermes is coordinating 4 agents." />

        <Message
          who="Hermes"
          role="Coordinator"
          text="Standing by. Roster online. Tell me the objective and I'll delegate — research and content will run headless while the builder works here."
        />
        <Message
          who="You"
          self
          text="Kick off the Q3 launch. Scrape competitor socials, draft the announcement, and prep the landing copy."
        />
        <SystemLine text="Athena → dispatched (social scrape)   ·   Calliope → dispatched (draft)" />
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-line p-2.5">
        <div className="gloss-elevated rounded-xl border border-line p-2 focus-within:border-line-strong">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            placeholder='Prompt the team, or say "Elliana"…'
            className="max-h-40 min-h-9 w-full resize-none bg-transparent px-1.5 py-1 text-sm text-text placeholder:text-text-faint focus:outline-none"
          />
          <div className="mt-1 flex items-center gap-1">
            <IconBtn title="Attach">
              <Paperclip className="size-4" />
            </IconBtn>
            <IconBtn title="Voice prompt (Elliana)">
              <Mic className="size-4" />
            </IconBtn>
            <button
              onClick={() => setHumeLive((v) => !v)}
              title="Hume live voice"
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                humeLive
                  ? "bg-accent text-void"
                  : "text-text-muted hover:bg-hover hover:text-text",
              )}
            >
              <AudioLines className="size-4" />
              {humeLive ? "Live" : "Hume"}
            </button>

            <button
              disabled={!draft.trim()}
              className="ml-auto grid size-8 place-items-center rounded-md bg-accent text-void transition-opacity disabled:opacity-30"
              title="Send"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
        {humeLive ? (
          <div className="mt-1.5 flex items-center gap-2 px-1 text-[11px] text-accent-soft">
            <AudioLines className="size-3.5 animate-pulse" />
            Elliana is live — speak naturally, she&apos;s coordinating the team.
          </div>
        ) : null}
      </div>
    </div>
  )
}

function IconBtn({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <button
      title={title}
      className="grid size-8 place-items-center rounded-md text-text-muted transition-colors hover:bg-hover hover:text-text"
    >
      {children}
    </button>
  )
}

function SystemLine({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-px flex-1 bg-line" />
      <p className="text-[10px] uppercase tracking-wider text-text-faint">{text}</p>
      <div className="h-px flex-1 bg-line" />
    </div>
  )
}

function Message({
  who,
  role,
  text,
  self,
}: {
  who: string
  role?: string
  text: string
  self?: boolean
}) {
  return (
    <div className="flex gap-2.5">
      <span
        className={cn(
          "mt-0.5 grid size-6 shrink-0 place-items-center rounded-md text-[10px] font-semibold",
          self ? "bg-elevated text-text" : "bg-accent text-void",
        )}
      >
        {who.slice(0, 2).toUpperCase()}
      </span>
      <div className="min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs font-medium text-text">{who}</span>
          {role ? <span className="text-[10px] text-text-faint">{role}</span> : null}
        </div>
        <p className="mt-0.5 text-sm leading-relaxed text-text-muted">{text}</p>
      </div>
    </div>
  )
}
