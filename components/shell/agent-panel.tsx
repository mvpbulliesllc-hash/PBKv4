"use client"

import { useState } from "react"
import {
  AudioLines,
  Bot,
  ChevronDown,
  Clock,
  LoaderCircle,
  Mic,
  Network,
  Paperclip,
  Plus,
  Radio,
  Send,
  SlidersHorizontal,
  Sparkles,
  User,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  RUNTIME_MODELS,
  type AgentEffort,
  type LocalRuntimeId,
} from "@/lib/local-agent-types"
import { useLocalAgents } from "./local-agent-context"

type Mode = { id: string; label: string; icon: typeof User }
type ChatTab = "workflow" | "matrix"
type ChatMessage = { id: string; who: string; role?: string; text: string; self?: boolean }

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

const MATRIX_WELCOME: ChatMessage = {
  id: "ayo-welcome",
  who: "Ayo",
  role: "Matrix Operator",
  text: "Matrix ENV online. Choose Codex or Claude Code, set the model and effort, then give me the objective. I will dispatch it into the real local workspace runtime.",
}

export function AgentPanel() {
  const { runAgent, statuses } = useLocalAgents()
  const [chatTab, setChatTab] = useState<ChatTab>("workflow")
  const [mode, setMode] = useState("team")
  const [humeLive, setHumeLive] = useState(false)
  const [draft, setDraft] = useState("")
  const [runtime, setRuntime] = useState<LocalRuntimeId>("codex")
  const [model, setModel] = useState("default")
  const [effort, setEffort] = useState<AgentEffort>("high")
  const [matrixMessages, setMatrixMessages] = useState<ChatMessage[]>([MATRIX_WELCOME])
  const [sending, setSending] = useState(false)

  const selectRuntime = (next: LocalRuntimeId) => {
    setRuntime(next)
    setModel("default")
  }

  const sendMatrixPrompt = async () => {
    const prompt = draft.trim()
    if (!prompt || sending) return
    setSending(true)
    setDraft("")
    setMatrixMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), who: "You", self: true, text: prompt },
    ])

    const result = await runAgent({ runtime, prompt, model, effort })
    setMatrixMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        who: "Ayo",
        role: runtime === "codex" ? "via Codex" : "via Claude Code",
        text: result.output,
      },
    ])
    setSending(false)
  }

  return (
    <div className="gloss flex h-full flex-col border-r border-line">
      <div className="shrink-0 border-b border-line px-3 py-2.5">
        <div className="flex items-center gap-1 rounded-lg bg-void p-1">
          <ChatTabButton active={chatTab === "workflow"} onClick={() => setChatTab("workflow")}>
            <Radio className="size-3.5" />
            Workflow
          </ChatTabButton>
          <ChatTabButton active={chatTab === "matrix"} onClick={() => setChatTab("matrix")}>
            <Sparkles className="size-3.5" />
            Matrix ENV
          </ChatTabButton>
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

        <button className="mt-1.5 flex min-w-0 items-center gap-1.5 rounded-md px-1.5 py-1 text-sm font-medium text-text transition-colors hover:bg-hover">
          {chatTab === "matrix" ? <Bot className="size-3.5 shrink-0 text-accent" /> : <Radio className="size-3.5 shrink-0 text-accent" />}
          <span className="truncate">{chatTab === "matrix" ? "Ayo 1.0 · Matrix Operator" : "Workflow · Launch Campaign"}</span>
          <ChevronDown className="size-3.5 shrink-0 text-text-faint" />
        </button>

        <div className="mt-1.5 flex items-center gap-1 rounded-lg bg-void p-1">
          {MODES.map((item) => {
            const Icon = item.icon
            const isActive = mode === item.id
            return (
              <button
                key={item.id}
                onClick={() => setMode(item.id)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1 rounded-md px-1 py-1.5 text-xs font-medium transition-colors",
                  isActive ? "gloss-elevated text-text" : "text-text-muted hover:text-text",
                )}
              >
                <Icon className="size-3.5" />
                {item.label}
              </button>
            )
          })}
        </div>

        {chatTab === "matrix" ? (
          <div className="mt-2 space-y-1.5">
            <div className="flex rounded-md border border-line bg-void p-0.5">
              <ProviderButton active={runtime === "codex"} ready={statuses.codex?.authenticated} onClick={() => selectRuntime("codex")}>ChatGPT</ProviderButton>
              <ProviderButton active={runtime === "claude"} ready={statuses.claude?.authenticated} onClick={() => selectRuntime("claude")}>Claude</ProviderButton>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <select
                value={model}
                onChange={(event) => setModel(event.target.value)}
                aria-label="Model"
                className="min-w-0 rounded-md border border-line bg-void px-1.5 text-[10px] text-text-muted focus:outline-none"
              >
                {RUNTIME_MODELS[runtime].map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
              <select
                value={effort}
                onChange={(event) => setEffort(event.target.value as AgentEffort)}
                aria-label="Effort"
                className="min-w-0 rounded-md border border-line bg-void px-1.5 text-[10px] text-text-muted focus:outline-none"
              >
                {(["low", "medium", "high", "xhigh"] as AgentEffort[]).map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>
          </div>
        ) : null}
      </div>

      <div className="shrink-0 border-b border-line px-3 py-2.5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-text-faint">Roster · 5</p>
          <button className="text-[10px] text-text-muted transition-colors hover:text-text">Manage</button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ROSTER.map((agent) => (
            <div
              key={agent.id}
              className="flex items-center gap-1.5 rounded-md border border-line bg-void px-2 py-1"
              title={`${agent.name} — ${agent.role}`}
            >
              <span className={cn("size-1.5 rounded-full", agent.live ? "bg-accent shadow-[0_0_6px_var(--color-accent)]" : "bg-line-strong")} />
              <span className="text-xs text-text">{agent.name}</span>
              <span className="text-[10px] text-text-faint">{agent.role}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-4">
        {chatTab === "matrix" ? (
          <>
            <SystemLine text={`${runtime === "codex" ? "Codex" : "Claude Code"} selected · ${mode} mode · ${effort} effort`} />
            {matrixMessages.map((message) => <Message key={message.id} {...message} />)}
            {sending ? <SystemLine text="Ayo is working in the local runtime" loading /> : null}
          </>
        ) : (
          <>
            <SystemLine text="Team mode active — Hermes is coordinating 4 agents." />
            <Message who="Hermes" role="Coordinator" text="Standing by. Roster online. Tell me the objective and I'll delegate — research and content will run headless while the builder works here." />
            <Message who="You" self text="Kick off the Q3 launch. Scrape competitor socials, draft the announcement, and prep the landing copy." />
            <SystemLine text="Athena → dispatched (social scrape)   ·   Calliope → dispatched (draft)" />
          </>
        )}
      </div>

      <div className="shrink-0 border-t border-line p-2.5">
        <div className="gloss-elevated rounded-xl border border-line p-2 focus-within:border-line-strong">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (chatTab === "matrix" && event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                void sendMatrixPrompt()
              }
            }}
            rows={2}
            placeholder={chatTab === "matrix" ? 'Prompt Ayo, or say "Ayo"…' : 'Prompt the team, or say "Elliana"…'}
            className="max-h-40 min-h-9 w-full resize-none bg-transparent px-1.5 py-1 text-sm text-text placeholder:text-text-faint focus:outline-none"
          />
          <div className="mt-1 flex items-center gap-1">
            <IconBtn title="Attach"><Paperclip className="size-4" /></IconBtn>
            <IconBtn title={chatTab === "matrix" ? "Voice prompt (Ayo)" : "Voice prompt (Elliana)"}><Mic className="size-4" /></IconBtn>
            <button
              onClick={() => setHumeLive((value) => !value)}
              title="Hume live voice"
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                humeLive ? "bg-accent text-void" : "text-text-muted hover:bg-hover hover:text-text",
              )}
            >
              <AudioLines className="size-4" />
              {humeLive ? "Live" : "Hume"}
            </button>
            <button
              onClick={() => chatTab === "matrix" ? void sendMatrixPrompt() : undefined}
              disabled={!draft.trim() || sending}
              className="ml-auto grid size-8 place-items-center rounded-md bg-accent text-void transition-opacity disabled:opacity-30"
              title="Send"
            >
              {sending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
            </button>
          </div>
        </div>
        {humeLive ? (
          <div className="mt-1.5 flex items-center gap-2 px-1 text-[11px] text-accent-soft">
            <AudioLines className="size-3.5 animate-pulse" />
            {chatTab === "matrix" ? "Ayo is listening — speak naturally." : "Elliana is live — speak naturally, she's coordinating the team."}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function ChatTabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
        active ? "gloss-elevated text-text" : "text-text-muted hover:text-text",
      )}
    >
      {children}
    </button>
  )
}

function ProviderButton({ active, ready, onClick, children }: { active: boolean; ready?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-1 rounded px-1.5 py-1 text-[10px] font-medium transition-colors",
        active ? "bg-hover text-text" : "text-text-faint hover:text-text-muted",
      )}
    >
      <span className={cn("size-1 rounded-full", ready ? "bg-live" : "bg-line-strong")} />
      {children}
    </button>
  )
}

function IconBtn({ children, title }: { children: React.ReactNode; title: string }) {
  return <button title={title} className="grid size-8 place-items-center rounded-md text-text-muted transition-colors hover:bg-hover hover:text-text">{children}</button>
}

function SystemLine({ text, loading = false }: { text: string; loading?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-px flex-1 bg-line" />
      {loading ? <LoaderCircle className="size-3 animate-spin text-text-faint" /> : null}
      <p className="text-center text-[10px] uppercase tracking-wider text-text-faint">{text}</p>
      <div className="h-px flex-1 bg-line" />
    </div>
  )
}

function Message({ who, role, text, self }: Omit<ChatMessage, "id">) {
  return (
    <div className="flex gap-2.5">
      <span className={cn("mt-0.5 grid size-6 shrink-0 place-items-center rounded-md text-[10px] font-semibold", self ? "bg-elevated text-text" : "bg-accent text-void")}>
        {who.slice(0, 2).toUpperCase()}
      </span>
      <div className="min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs font-medium text-text">{who}</span>
          {role ? <span className="text-[10px] text-text-faint">{role}</span> : null}
        </div>
        <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-text-muted">{text}</p>
      </div>
    </div>
  )
}
