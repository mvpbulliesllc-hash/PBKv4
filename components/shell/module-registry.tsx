"use client"

import { useEffect, useState } from "react"
import type { LucideIcon } from "lucide-react"
import {
  Globe,
  TerminalSquare,
  Video,
  Radio,
  ImagePlus,
  Instagram,
  FolderOpen,
  KeyRound,
  SendHorizontal,
  Search,
  FileText,
  BarChart3,
  SlidersHorizontal,
  LayoutGrid,
  Upload,
  Waypoints,
  Webhook,
  Mail,
  MessageCircle,
  Phone,
  Contact,
  NotebookPen,
  HardDrive,
  Inbox,
  Users,
  Star,
  Paperclip,
  PhoneCall,
  Mic,
  Plus,
  ScrollText,
  Workflow,
  ArrowDownToLine,
  ArrowUpFromLine,
  Filter,
  Circle,
  ClipboardList,
  Archive,
  Sheet,
  BookOpen,
  Tag,
  Clock,
  ExternalLink,
  FolderPlus,
  Link2,
  Sparkles,
  ScanSearch,
  Globe2,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { BrowserView } from "./browser-view"
import { BrandIcon, type BrandSlug } from "./brand-icon"
import { cn } from "@/lib/utils"

export type ModuleId =
  | "browser"
  | "terminal"
  | "logs"
  | "pipeline"
  | "video"
  | "live"
  | "image"
  | "social"
  | "files"
  | "env"
  | "outbound"
  | "research"
  | "brief"
  | "assets"
  | "sheets"
  | "docs"
  | "notes"
  | "analytics"
  | "connectors"
  | "webhooks"
  | "config"
  | "gmail"
  | "gchat"
  | "gvoice"
  | "contacts"
  | "notion"
  | "drive"
  | "messages"
  | "office"
  | "meet"
  | "empty"

export type ModuleGroup =
  | "Surface"
  | "Workspace"
  | "Comms"
  | "Social"
  | "Research"
  | "Dev"
  | "Creative"
  | "System"

export type ModuleDef = {
  id: ModuleId
  label: string
  icon: LucideIcon
  group: ModuleGroup
  render: () => React.ReactNode
}

/**
 * Central registry of every module a container can become.
 * Add new capabilities here and they become available in every panel picker.
 */
export const MODULES: ModuleDef[] = [
  { id: "browser", label: "Browser", icon: Globe, group: "Surface", render: () => <BrowserView /> },
  { id: "office", label: "Virtual Office", icon: Users, group: "Surface", render: () => <OfficeModule /> },
  { id: "meet", label: "Meet & Zoom", icon: Video, group: "Surface", render: () => <MeetModule /> },
  { id: "video", label: "Video", icon: Video, group: "Surface", render: () => <VideoModule /> },
  { id: "live", label: "Live Feed", icon: Radio, group: "Surface", render: () => <LiveModule /> },
  { id: "analytics", label: "Analytics", icon: BarChart3, group: "Surface", render: () => <AnalyticsModule /> },

  { id: "gmail", label: "Gmail", icon: Mail, group: "Comms", render: () => <GmailModule /> },
  { id: "gchat", label: "Google Chat", icon: MessageCircle, group: "Comms", render: () => <GChatModule /> },
  { id: "gvoice", label: "Google Voice", icon: Phone, group: "Comms", render: () => <GVoiceModule /> },
  { id: "messages", label: "Message Hub", icon: Inbox, group: "Comms", render: () => <MessagesModule /> },

  { id: "pipeline", label: "Pipeline (CRM · In · Out)", icon: Workflow, group: "Workspace", render: () => <PipelineModule /> },
  { id: "contacts", label: "Contacts / CRM", icon: Contact, group: "Workspace", render: () => <ContactsModule /> },
  { id: "notion", label: "NotebookLM", icon: BookOpen, group: "Workspace", render: () => <NotionModule /> },
  { id: "drive", label: "Drive", icon: HardDrive, group: "Workspace", render: () => <DriveModule /> },

  { id: "social", label: "Socials", icon: Instagram, group: "Social", render: () => <SocialModule /> },
  { id: "outbound", label: "Outbound", icon: SendHorizontal, group: "Social", render: () => <OutboundModule /> },

  { id: "terminal", label: "Terminal", icon: TerminalSquare, group: "Dev", render: () => <TerminalModule /> },
  { id: "logs", label: "Logs", icon: ScrollText, group: "Dev", render: () => <LogsModule /> },
  { id: "files", label: "Files", icon: FolderOpen, group: "Dev", render: () => <FilesModule /> },
  { id: "env", label: "Env Vault", icon: KeyRound, group: "Dev", render: () => <EnvModule /> },
  { id: "webhooks", label: "Webhooks", icon: Webhook, group: "Dev", render: () => <WebhooksModule /> },
  { id: "connectors", label: "Connectors", icon: Waypoints, group: "Dev", render: () => <ConnectorsModule /> },

  { id: "brief", label: "Research Brief", icon: ClipboardList, group: "Research", render: () => <BriefModule /> },
  { id: "assets", label: "Asset Vault", icon: Archive, group: "Research", render: () => <AssetVaultModule /> },
  { id: "sheets", label: "Sheets", icon: Sheet, group: "Research", render: () => <SheetsModule /> },
  { id: "docs", label: "Docs", icon: FileText, group: "Research", render: () => <DocsModule /> },

  { id: "image", label: "Image Gen", icon: ImagePlus, group: "Creative", render: () => <ImageModule /> },
  { id: "notes", label: "Notes", icon: FileText, group: "Creative", render: () => <NotesModule /> },

  { id: "research", label: "Live Results", icon: Search, group: "Research", render: () => <ResearchModule /> },
  { id: "config", label: "Config", icon: SlidersHorizontal, group: "System", render: () => <ConfigModule /> },
  { id: "empty", label: "Empty", icon: LayoutGrid, group: "System", render: () => <EmptyModule /> },
]

export const MODULE_MAP: Record<ModuleId, ModuleDef> = Object.fromEntries(
  MODULES.map((m) => [m.id, m]),
) as Record<ModuleId, ModuleDef>

/* ---------------------------------- bodies --------------------------------- */

function Pad({ children }: { children: React.ReactNode }) {
  return <div className="h-full overflow-auto p-3">{children}</div>
}

/* ------------------------------- comms suite ------------------------------- */

const GMAIL_ACCOUNTS = [
  { addr: "jarad@mvpmgmtgroup.com", unread: 4, dot: "bg-accent" },
  { addr: "ops@ecoaisolutions.com", unread: 6, dot: "bg-info" },
  { addr: "deals@paragon.vc", unread: 2, dot: "bg-warn" },
  { addr: "me@skalventures.io", unread: 0, dot: "bg-text-faint" },
]

const GMAIL_THREADS = [
  { from: "Stripe", subj: "Payout of $12,480 is on the way", time: "9:02", unread: true, acct: "bg-info" },
  { from: "Athena (Agent)", subj: "Outreach batch #7 — 41 replies queued for review", time: "8:41", unread: true, acct: "bg-accent" },
  { from: "Notion", subj: "3 pages shared in Paragon workspace", time: "8:03", unread: true, acct: "bg-warn" },
  { from: "Zoom", subj: "Recording ready: Discovery — Acme Corp", time: "Yesterday", unread: false, acct: "bg-info" },
  { from: "Linear", subj: "5 issues moved to In Review", time: "Yesterday", unread: false, acct: "bg-accent" },
]

function GmailModule() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Account switcher — many gmails, one app */}
      <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-line px-2 py-1.5">
        {GMAIL_ACCOUNTS.map((a, i) => (
          <button
            key={a.addr}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] transition-colors",
              i === 0 ? "border-line-strong bg-hover text-text" : "border-line text-text-muted hover:bg-hover/60",
            )}
          >
            <span className={cn("size-1.5 rounded-full", a.dot)} />
            {a.addr.split("@")[0]}
            {a.unread > 0 ? <span className="text-text-faint">{a.unread}</span> : null}
          </button>
        ))}
        <button className="grid size-6 shrink-0 place-items-center rounded-md text-text-muted hover:bg-hover hover:text-text">
          <Plus className="size-3.5" />
        </button>
      </div>
      <div className="flex shrink-0 items-center gap-2 border-b border-line px-3 py-1.5 text-[11px] text-text-faint">
        <span className="rounded bg-hover px-1.5 py-0.5 text-text-muted">All inboxes</span>
        <span>Primary</span>
        <span>Updates</span>
        <button className="ml-auto flex items-center gap-1 rounded bg-accent px-2 py-1 text-void">
          <Mail className="size-3" /> Compose
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {GMAIL_THREADS.map((t) => (
          <div
            key={t.subj}
            className="flex cursor-pointer items-center gap-2.5 border-b border-line/60 px-3 py-2 transition-colors hover:bg-hover/50"
          >
            <Star className="size-3.5 shrink-0 text-text-faint" />
            <span className={cn("size-1.5 shrink-0 rounded-full", t.acct)} />
            <span className={cn("w-28 shrink-0 truncate text-xs", t.unread ? "font-semibold text-text" : "text-text-muted")}>
              {t.from}
            </span>
            <span className={cn("min-w-0 flex-1 truncate text-xs", t.unread ? "text-text" : "text-text-faint")}>
              {t.subj}
            </span>
            <span className="shrink-0 text-[10px] text-text-faint">{t.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function GChatModule() {
  const rooms = ["# founders", "# ops-war-room", "# agents-live", "@ Hermes", "@ Athena"]
  return (
    <div className="flex h-full">
      <div className="w-32 shrink-0 space-y-0.5 border-r border-line p-2">
        {rooms.map((r, i) => (
          <button
            key={r}
            className={cn(
              "flex w-full items-center rounded-md px-2 py-1 text-left text-[11px] transition-colors",
              i === 1 ? "bg-hover text-text" : "text-text-muted hover:bg-hover/60",
            )}
          >
            <span className="truncate">{r}</span>
          </button>
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-2 overflow-auto p-3 text-xs">
          <Bubble who="Hermes" tone="accent">Batch #7 done — 41 replies staged for your review.</Bubble>
          <Bubble who="You">Approve the top 20, hold the rest.</Bubble>
          <Bubble who="Hermes" tone="accent">Copy. Dispatching Athena to send now.</Bubble>
        </div>
        <ComposerBar placeholder="Message ops-war-room…" />
      </div>
    </div>
  )
}

function GVoiceModule() {
  const calls = [
    { name: "Acme Corp", num: "+1 415 555 0142", dir: "in", time: "9:12" },
    { name: "Missed — Unknown", num: "+1 702 555 0199", dir: "miss", time: "8:40" },
    { name: "Athena voicemail", num: "agent", dir: "vm", time: "8:04" },
  ]
  return (
    <Pad>
      <div className="mb-2 flex items-center gap-2 rounded-md border border-line bg-void px-2.5 py-1.5">
        <Phone className="size-3.5 text-text-faint" />
        <input placeholder="Dial or search…" className="flex-1 bg-transparent text-xs text-text placeholder:text-text-faint focus:outline-none" />
        <button className="grid size-6 place-items-center rounded bg-accent text-void"><PhoneCall className="size-3.5" /></button>
      </div>
      <div className="space-y-1">
        {calls.map((c) => (
          <div key={c.num} className="flex items-center gap-2 rounded-md border border-line bg-void px-2.5 py-1.5 text-xs">
            <PhoneCall className={cn("size-3.5", c.dir === "miss" ? "text-warn" : "text-text-faint")} />
            <span className="min-w-0 flex-1 truncate text-text-muted">{c.name}</span>
            <span className="shrink-0 text-[10px] text-text-faint">{c.time}</span>
          </div>
        ))}
      </div>
    </Pad>
  )
}

function MessagesModule() {
  const channels: { app: string; brand: BrandSlug; who: string; msg: string }[] = [
    { app: "Slack", brand: "slack", who: "#clients", msg: "Acme signed the SOW" },
    { app: "Telegram", brand: "telegram", who: "Vlad", msg: "sent the wallet address" },
    { app: "WhatsApp", brand: "whatsapp", who: "Supplier", msg: "Stock back Monday" },
    { app: "Instagram", brand: "instagram", who: "@lead_42", msg: "interested — send pricing" },
    { app: "LinkedIn", brand: "linkedin", who: "R. Okafor", msg: "accepted your connection" },
  ]
  const filters: { label: string; brand?: BrandSlug }[] = [
    { label: "All" },
    { label: "Slack", brand: "slack" },
    { label: "Telegram", brand: "telegram" },
    { label: "WhatsApp", brand: "whatsapp" },
    { label: "IG", brand: "instagram" },
    { label: "LinkedIn", brand: "linkedin" },
  ]
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-line px-2 py-1.5 text-[11px] text-text-muted">
        {filters.map((f, i) => (
          <button
            key={f.label}
            className={cn(
              "flex shrink-0 items-center gap-1 rounded px-2 py-0.5",
              i === 0 ? "bg-hover text-text" : "hover:bg-hover/60",
            )}
          >
            {f.brand ? <BrandIcon slug={f.brand} size={12} /> : null}
            {f.label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {channels.map((c) => (
          <div key={c.app + c.who} className="flex items-center gap-2.5 border-b border-line/60 px-3 py-2 hover:bg-hover/50">
            <BrandIcon slug={c.brand} size={18} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-text">{c.who} <span className="text-text-faint">· {c.app}</span></p>
              <p className="truncate text-[11px] text-text-faint">{c.msg}</p>
            </div>
          </div>
        ))}
      </div>
      <ComposerBar placeholder="Reply from any channel…" />
    </div>
  )
}

/* ------------------------------ office suite ------------------------------- */

function OfficeModule() {
  const rooms = [
    { name: "War Room", people: 4, live: true },
    { name: "Client — Acme", people: 2, live: true },
    { name: "Focus Room", people: 1, live: false },
    { name: "Lounge", people: 0, live: false },
  ]
  return (
    <Pad>
      <div className="grid grid-cols-2 gap-2">
        {rooms.map((r) => (
          <button
            key={r.name}
            className="flex flex-col gap-2 rounded-lg border border-line bg-void p-3 text-left transition-colors hover:border-line-strong"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text">{r.name}</span>
              {r.live ? <span className="size-2 animate-pulse rounded-full bg-accent" /> : null}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-text-faint">
              <Users className="size-3.5" /> {r.people} present
            </div>
          </button>
        ))}
      </div>
    </Pad>
  )
}

function MeetModule() {
  return (
    <Pad>
      <div className="grid min-h-40 grid-cols-2 gap-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="grid aspect-video place-items-center rounded-lg border border-line bg-void">
            <Users className="size-5 text-text-faint" />
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-center gap-2">
        <button className="flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs text-text-muted transition-colors hover:bg-hover hover:text-text">
          <BrandIcon slug="google-meet" size={14} /> Start Meet
        </button>
        <button className="flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs text-text-muted transition-colors hover:bg-hover hover:text-text">
          <BrandIcon slug="zoom" size={14} /> Join Zoom
        </button>
      </div>
    </Pad>
  )
}

/* ---------------------- full-stack pipeline (CRM/In/Out) ------------------- */

const PIPE_STAGES = [
  { key: "in", label: "Inbound Intake", icon: ArrowDownToLine, count: 24, tone: "text-info" },
  { key: "crm", label: "CRM / Qualify", icon: Contact, count: 11, tone: "text-text" },
  { key: "out", label: "Outbound / Drip", icon: ArrowUpFromLine, count: 38, tone: "text-warn" },
  { key: "won", label: "Closed Won", icon: Circle, count: 6, tone: "text-live" },
]

const PIPE_CARDS: Record<string, { name: string; sub: string; src?: BrandSlug }[]> = {
  in: [
    { name: "Acme Corp", sub: "Web form · pricing", src: "gmail" },
    { name: "@lead_42", sub: "IG DM · demo?", src: "instagram" },
    { name: "R. Okafor", sub: "LinkedIn reply", src: "linkedin" },
  ],
  crm: [
    { name: "Sarah Chen", sub: "Discovery booked", src: "google-meet" },
    { name: "Marcus Vega", sub: "Proposal sent", src: "gmail" },
  ],
  out: [
    { name: "Cohort · Q3 SaaS", sub: "Drip step 3/6", src: "gmail" },
    { name: "WhatsApp blast", sub: "412 sent · 38 replies", src: "whatsapp" },
    { name: "Slack community", sub: "warm intro", src: "slack" },
  ],
  won: [{ name: "Skal Ventures", sub: "$48k · Stripe", src: "stripe" }],
}

function PipelineModule() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* toolbar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-line px-3 py-1.5">
        <Workflow className="size-3.5 text-accent" />
        <span className="text-xs font-medium text-text">Revenue Pipeline</span>
        <span className="text-[11px] text-text-faint">CRM · Inbound · Outbound</span>
        <div className="ml-auto flex items-center gap-1">
          <button className="flex items-center gap-1 rounded border border-line px-2 py-1 text-[11px] text-text-muted hover:bg-hover hover:text-text">
            <Filter className="size-3" /> Filter
          </button>
          <button className="flex items-center gap-1 rounded bg-accent px-2 py-1 text-[11px] font-medium text-void">
            <Plus className="size-3" /> New
          </button>
        </div>
      </div>
      {/* kanban */}
      <div className="grid min-h-0 flex-1 grid-cols-4 gap-px overflow-hidden bg-line">
        {PIPE_STAGES.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.key} className="flex min-h-0 flex-col bg-panel">
              <div className="flex shrink-0 items-center gap-1.5 border-b border-line px-2.5 py-2">
                <Icon className={cn("size-3.5", s.tone)} />
                <span className="truncate text-[11px] font-medium text-text-muted">{s.label}</span>
                <span className="ml-auto rounded bg-hover px-1.5 text-[10px] text-text-faint">{s.count}</span>
              </div>
              <div className="min-h-0 flex-1 space-y-1.5 overflow-auto p-2">
                {(PIPE_CARDS[s.key] ?? []).map((c) => (
                  <div
                    key={c.name}
                    className="rounded-md border border-line bg-void p-2 transition-colors hover:border-line-strong"
                  >
                    <div className="flex items-center gap-1.5">
                      {c.src ? <BrandIcon slug={c.src} size={13} /> : null}
                      <span className="min-w-0 flex-1 truncate text-[11px] text-text">{c.name}</span>
                    </div>
                    <p className="mt-0.5 truncate text-[10px] text-text-faint">{c.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ---------------------------- knowledge suite ------------------------------ */

function ContactsModule() {
  const people = [
    { n: "Sarah Chen", c: "Acme Corp", s: "Deal — $48k", stage: "bg-accent" },
    { n: "Marcus Vega", c: "Paragon", s: "Warm lead", stage: "bg-warn" },
    { n: "Lena Ortiz", c: "Skal", s: "Customer", stage: "bg-info" },
  ]
  return (
    <Pad>
      <div className="mb-2 flex items-center gap-2 rounded-md border border-line bg-void px-2.5 py-1.5">
        <Search className="size-3.5 text-text-faint" />
        <input placeholder="Search CRM…" className="flex-1 bg-transparent text-xs text-text placeholder:text-text-faint focus:outline-none" />
      </div>
      <div className="space-y-1">
        {people.map((p) => (
          <div key={p.n} className="flex items-center gap-2.5 rounded-md border border-line bg-void px-2.5 py-2">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-hover text-[10px] font-semibold text-text">
              {p.n.split(" ").map((x) => x[0]).join("")}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-text">{p.n}</p>
              <p className="truncate text-[11px] text-text-faint">{p.c}</p>
            </div>
            <span className="flex items-center gap-1 text-[10px] text-text-faint">
              <span className={cn("size-1.5 rounded-full", p.stage)} />
              {p.s}
            </span>
          </div>
        ))}
      </div>
    </Pad>
  )
}

function NotionModule() {
  const pages = ["Company Wiki", "Q3 GTM Plan", "Agent Playbooks", "Client — Acme", "SOPs / Ops"]
  return (
    <Pad>
      <div className="space-y-0.5 text-xs">
        {pages.map((p) => (
          <div key={p} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-text-muted transition-colors hover:bg-hover">
            <NotebookPen className="size-3.5 text-text-faint" />
            {p}
          </div>
        ))}
      </div>
    </Pad>
  )
}

function DriveModule() {
  const files = [
    { n: "Pitch Deck v4.key", t: "Presentation" },
    { n: "Financial Model.xlsx", t: "Sheet" },
    { n: "Brand Assets", t: "Folder" },
    { n: "Contracts", t: "Folder" },
    { n: "Recordings", t: "Folder" },
  ]
  return (
    <Pad>
      <div className="space-y-0.5 text-xs">
        {files.map((f) => (
          <div key={f.n} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-text-muted transition-colors hover:bg-hover">
            <HardDrive className="size-3.5 text-text-faint" />
            <span className="min-w-0 flex-1 truncate">{f.n}</span>
            <span className="shrink-0 text-[10px] text-text-faint">{f.t}</span>
          </div>
        ))}
      </div>
    </Pad>
  )
}

/* ------------------------------- shared bits ------------------------------- */

function Bubble({ who, tone, children }: { who: string; tone?: "accent"; children: React.ReactNode }) {
  return (
    <div>
      <p className={cn("mb-0.5 text-[10px] font-medium", tone === "accent" ? "text-accent" : "text-text-faint")}>{who}</p>
      <p className="rounded-md rounded-tl-none border border-line bg-void px-2.5 py-1.5 text-text-muted">{children}</p>
    </div>
  )
}

function ComposerBar({ placeholder }: { placeholder: string }) {
  return (
    <div className="flex shrink-0 items-center gap-2 border-t border-line px-2.5 py-2">
      <button className="grid size-7 place-items-center rounded-md text-text-muted hover:bg-hover hover:text-text">
        <Paperclip className="size-3.5" />
      </button>
      <input
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-md border border-line bg-void px-2.5 py-1.5 text-xs text-text placeholder:text-text-faint focus:outline-none"
      />
      <button className="grid size-7 place-items-center rounded-md text-text-muted hover:bg-hover hover:text-text">
        <Mic className="size-3.5" />
      </button>
      <button className="grid size-7 place-items-center rounded-md bg-accent text-void">
        <SendHorizontal className="size-3.5" />
      </button>
    </div>
  )
}

function VideoModule() {
  return (
    <Pad>
      <div className="grid h-full min-h-40 place-items-center rounded-lg border border-line bg-void">
        <div className="text-center">
          <Video className="mx-auto size-6 text-text-faint" />
          <p className="mt-1 text-xs text-text-faint">Video surface — embed, stream, or agent capture</p>
        </div>
      </div>
    </Pad>
  )
}

function LiveModule() {
  return (
    <Pad>
      <div className="flex items-center gap-2 rounded-md border border-line bg-void px-2.5 py-1.5 text-xs">
        <span className="size-2 animate-pulse rounded-full bg-accent" />
        <span className="text-text-muted">Live session</span>
        <span className="ml-auto font-mono text-text-faint">00:00:00</span>
      </div>
      <div className="mt-2 grid min-h-32 place-items-center rounded-lg border border-line bg-void">
        <Radio className="size-6 text-text-faint" />
      </div>
    </Pad>
  )
}

function AnalyticsModule() {
  return (
    <Pad>
      <div className="grid grid-cols-2 gap-2">
        {["Sessions", "Leads", "Replies", "Conversions"].map((k) => (
          <div key={k} className="rounded-lg border border-line bg-void p-3">
            <p className="text-[11px] text-text-faint">{k}</p>
            <p className="mt-1 font-mono text-lg text-text">—</p>
          </div>
        ))}
      </div>
    </Pad>
  )
}

function SocialModule() {
  return (
    <Pad>
      <div className="grid grid-cols-3 gap-1.5">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-md border border-line bg-void" />
        ))}
      </div>
      <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-md border border-line py-1.5 text-xs text-text-muted transition-colors hover:bg-hover hover:text-text">
        <Upload className="size-3.5" />
        Connect account
      </button>
    </Pad>
  )
}

function OutboundModule() {
  return (
    <div className="flex h-full flex-col gap-2 p-3">
      <textarea
        placeholder="Compose outbound message…"
        className="flex-1 resize-none rounded-md border border-line bg-void p-2.5 text-xs text-text placeholder:text-text-faint focus:outline-none"
      />
      <button className="flex items-center justify-center gap-2 rounded-md bg-accent px-3 py-2 text-xs font-medium text-void">
        <SendHorizontal className="size-3.5" />
        Send
      </button>
    </div>
  )
}

function TerminalModule() {
  return (
    <div className="h-full overflow-auto bg-void p-3 font-mono text-xs leading-relaxed text-text-muted">
      <p>
        <span className="text-accent-soft">$</span> agent run --team launch-campaign
      </p>
      <p className="text-text-faint">→ hermes: delegating 4 tasks…</p>
      <p className="text-text-faint">→ athena: scraping 3 sources…</p>
      <p className="mt-1">
        <span className="text-accent-soft">$</span> <span className="animate-pulse">▋</span>
      </p>
    </div>
  )
}

function LogsModule() {
  const lines = [
    { t: "06:56:54.384Z", tag: "SERVER", msg: "Installing dependencies…", tone: "text-text-faint" },
    { t: "06:56:55.146Z", tag: "BUILD", msg: "✓ Compiled successfully", tone: "text-live" },
    { t: "06:57:01.902Z", tag: "AGENT", msg: "hermes: dispatched 4 tasks", tone: "text-text-muted" },
    { t: "06:57:02.114Z", tag: "HOOK", msg: "POST /hooks/inbound 200", tone: "text-info" },
    { t: "06:57:03.550Z", tag: "WARN", msg: "rate limit near cap (IG)", tone: "text-warn" },
    { t: "06:57:04.771Z", tag: "AGENT", msg: "athena: 41 replies staged", tone: "text-text-muted" },
  ]
  return (
    <div className="flex h-full min-h-0 flex-col bg-void">
      <div className="flex shrink-0 items-center gap-2 border-b border-line px-3 py-1.5 text-[11px]">
        {["All", "Server", "Build", "Agent", "Hooks"].map((f, i) => (
          <button key={f} className={cn("rounded px-1.5 py-0.5", i === 0 ? "bg-hover text-text" : "text-text-muted hover:bg-hover/60")}>
            {f}
          </button>
        ))}
        <span className="ml-auto flex items-center gap-1 text-text-faint">
          <span className="size-1.5 animate-pulse rounded-full bg-live" /> live
        </span>
      </div>
      <div className="min-h-0 flex-1 space-y-0.5 overflow-auto p-3 font-mono text-[11px] leading-relaxed">
        {lines.map((l, i) => (
          <p key={i} className="flex gap-2">
            <span className="shrink-0 text-text-faint">{l.t}</span>
            <span className="shrink-0 rounded bg-hover px-1 text-[10px] text-text-muted">{l.tag}</span>
            <span className={l.tone}>{l.msg}</span>
          </p>
        ))}
      </div>
    </div>
  )
}

function FilesModule() {
  return (
    <Pad>
      <div className="space-y-0.5 text-xs">
        {["app/", "components/", "lib/", "public/", "package.json", ".env.local"].map((f) => (
          <div
            key={f}
            className="flex items-center gap-2 rounded-md px-2 py-1 text-text-muted transition-colors hover:bg-hover"
          >
            <FolderOpen className="size-3.5 text-text-faint" />
            {f}
          </div>
        ))}
      </div>
    </Pad>
  )
}

function EnvModule() {
  const [tools, setTools] = useState<Array<{ id: string; label: string; status: string }>>([])

  useEffect(() => {
    let active = true
    fetch("/api/ay0/catalog", { cache: "no-store" })
      .then(async (response) => response.ok ? response.json() as Promise<{ tools?: Array<{ id: string; label: string; status: string }> }> : { tools: [] })
      .then((data) => { if (active) setTools(data.tools ?? []) })
      .catch(() => { if (active) setTools([]) })
    return () => { active = false }
  }, [])

  return (
    <Pad>
      <div className="space-y-1.5 font-mono text-xs">
        {(tools.length ? tools : [{ id: "vault", label: "AY.0 vault", status: "loading" }]).slice(0, 10).map((tool) => (
          <div key={tool.id} className="flex items-center justify-between rounded-md border border-line bg-void px-2.5 py-1.5">
            <span className="truncate text-text-muted">{tool.label}</span>
            <span className={cn("ml-2 shrink-0 text-[10px]", tool.status === "env-ready" ? "text-live" : tool.status === "quarantined" ? "text-warn" : "text-text-faint")}>{tool.status}</span>
          </div>
        ))}
      </div>
    </Pad>
  )
}

function WebhooksModule() {
  return (
    <Pad>
      <div className="space-y-1.5 text-xs">
        {["POST /hooks/inbound", "POST /hooks/stripe", "POST /hooks/twilio"].map((w) => (
          <div key={w} className="flex items-center justify-between rounded-md border border-line bg-void px-2.5 py-1.5 font-mono">
            <span className="text-text-muted">{w}</span>
            <span className="size-1.5 rounded-full bg-accent" />
          </div>
        ))}
      </div>
    </Pad>
  )
}

function ConnectorsModule() {
  const [connectors, setConnectors] = useState<Array<{ capability: string; label: string; status: string }>>([])

  useEffect(() => {
    let active = true
    fetch("/api/ay0/connectors/health", { cache: "no-store" })
      .then(async (response) => response.ok ? response.json() as Promise<{ connectors?: Array<{ capability: string; label: string; status: string }> }> : { connectors: [] })
      .then((data) => { if (active) setConnectors(data.connectors ?? []) })
      .catch(() => { if (active) setConnectors([]) })
    return () => { active = false }
  }, [])

  return (
    <Pad>
      <div className="grid grid-cols-2 gap-2">
        {(connectors.length ? connectors : [{ capability: "loading", label: "Checking vault", status: "loading" }]).map((connector) => (
          <button
            key={connector.capability}
            className="flex items-center gap-2 rounded-md border border-line bg-void px-2.5 py-2 text-xs text-text-muted transition-colors hover:border-line-strong hover:bg-hover hover:text-text"
          >
            <Waypoints className="size-4 shrink-0 text-text-faint" />
            <span className="min-w-0 flex-1 truncate text-left">{connector.label}</span>
            <span className={cn("size-1.5 shrink-0 rounded-full", connector.status === "authenticated" ? "bg-live" : connector.status === "env-ready" ? "bg-info" : "bg-warn")} />
          </button>
        ))}
      </div>
    </Pad>
  )
}

function ImageModule() {
  return (
    <div className="flex h-full flex-col gap-2 p-3">
      <div className="grid flex-1 place-items-center rounded-lg border border-dashed border-line bg-void">
        <div className="text-center">
          <ImagePlus className="mx-auto size-6 text-text-faint" />
          <p className="mt-1 text-xs text-text-faint">Generated output</p>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-md border border-line bg-void px-2.5 py-1.5">
        <input
          placeholder="Describe an image…"
          className="flex-1 bg-transparent text-xs text-text placeholder:text-text-faint focus:outline-none"
        />
        <button className="rounded bg-accent px-2 py-1 text-[11px] font-medium text-void">Gen</button>
      </div>
    </div>
  )
}

function NotesModule() {
  return (
    <div className="h-full p-3">
      <textarea
        placeholder="Scratch notes…"
        className="h-full w-full resize-none rounded-md border border-line bg-void p-2.5 text-xs leading-relaxed text-text placeholder:text-text-faint focus:outline-none"
      />
    </div>
  )
}

/* ----------------------- Research Brief Builder ---------------------------- */

const BRIEF_SECTIONS = [
  {
    id: "target",
    title: "Target Profile",
    fields: ["Industry / Vertical", "Company size", "Geo / Region", "Job title / Persona", "Revenue range"],
  },
  {
    id: "signals",
    title: "Intent Signals",
    fields: ["Hiring for...", "Funding round", "Tech stack", "Recent news trigger", "Social activity keywords"],
  },
  {
    id: "scrape",
    title: "Scrape & Sources",
    fields: ["Domains to scrape", "LinkedIn filters", "Apollo / Hunter query", "Reddit / Twitter keywords", "Review sites (G2, Capterra)"],
  },
  {
    id: "output",
    title: "Output Config",
    fields: ["Export to Sheet", "Auto-enrich (email/phone)", "Tag pipeline stage", "Assign agent", "Drip sequence to trigger"],
  },
]

function BriefModule() {
  const [open, setOpen] = useState<string[]>(["target"])
  const toggle = (id: string) =>
    setOpen((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* header bar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-line px-3 py-1.5">
        <ScanSearch className="size-3.5 text-accent" />
        <span className="text-xs font-medium text-text">Lead Gen Research Brief</span>
        <div className="ml-auto flex items-center gap-1.5">
          <button className="flex items-center gap-1 rounded border border-line px-2 py-1 text-[11px] text-text-muted hover:bg-hover hover:text-text">
            <Sparkles className="size-3" /> Auto-fill AI
          </button>
          <button className="flex items-center gap-1 rounded bg-accent px-2 py-1 text-[11px] font-medium text-void">
            <Globe2 className="size-3" /> Run Scrape
          </button>
        </div>
      </div>

      {/* progress bar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-line px-3 py-1.5">
        {BRIEF_SECTIONS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1.5">
            {i > 0 ? <div className="h-px w-4 bg-line" /> : null}
            <button
              onClick={() => toggle(s.id)}
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] transition-colors",
                open.includes(s.id)
                  ? "bg-accent text-void"
                  : "border border-line text-text-muted hover:bg-hover hover:text-text",
              )}
            >
              {i + 1} {s.title}
            </button>
          </div>
        ))}
      </div>

      {/* accordion fields */}
      <div className="min-h-0 flex-1 overflow-auto">
        {BRIEF_SECTIONS.map((s) => (
          <div key={s.id} className="border-b border-line">
            <button
              onClick={() => toggle(s.id)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-text transition-colors hover:bg-hover/40"
            >
              {open.includes(s.id) ? (
                <ChevronDown className="size-3.5 text-text-faint" />
              ) : (
                <ChevronRight className="size-3.5 text-text-faint" />
              )}
              {s.title}
              <span className="ml-auto text-[10px] text-text-faint">{s.fields.length} fields</span>
            </button>
            {open.includes(s.id) ? (
              <div className="grid grid-cols-2 gap-2 px-4 pb-3">
                {s.fields.map((f) => (
                  <div key={f} className="flex flex-col gap-1">
                    <label className="text-[10px] font-medium uppercase tracking-wide text-text-faint">{f}</label>
                    <input
                      className="rounded-md border border-line bg-void px-2.5 py-1.5 text-xs text-text placeholder:text-text-faint focus:border-line-strong focus:outline-none"
                      placeholder={`Enter ${f.toLowerCase()}…`}
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}

        {/* saved briefs */}
        <div className="p-3">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-text-faint">Saved Briefs</p>
          <div className="space-y-1">
            {["SaaS CFOs — Series A", "E-com brands $1M–10M", "Agencies scaling headcount"].map((b) => (
              <div
                key={b}
                className="flex items-center gap-2 rounded-md border border-line px-2.5 py-1.5 text-xs text-text-muted hover:bg-hover"
              >
                <ClipboardList className="size-3.5 shrink-0 text-text-faint" />
                <span className="min-w-0 flex-1 truncate">{b}</span>
                <Globe2 className="size-3.5 shrink-0 text-text-faint hover:text-text" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ----------------------- Asset Vault --------------------------------------- */

const ASSET_TYPES = ["All", "Doc", "Sheet", "Image", "Video", "Audio", "Link", "Brief"] as const
type AssetType = (typeof ASSET_TYPES)[number]

const VAULT_ITEMS: {
  name: string
  type: AssetType
  tags: string[]
  source: string
  ago: string
}[] = [
  { name: "Q3 GTM Deck v4", type: "Doc", tags: ["strategy", "deck"], source: "AI generated", ago: "2h" },
  { name: "Lead list — SaaS CFOs", type: "Sheet", tags: ["leads", "q3"], source: "Brief run", ago: "3h" },
  { name: "Hero shot — dark bg", type: "Image", tags: ["brand", "creative"], source: "Image gen", ago: "4h" },
  { name: "Outreach script v2", type: "Doc", tags: ["copy", "outbound"], source: "AI generated", ago: "5h" },
  { name: "Podcast ep12 raw", type: "Audio", tags: ["content"], source: "Recording", ago: "1d" },
  { name: "Competitor teardown", type: "Sheet", tags: ["research"], source: "Agent scrape", ago: "1d" },
  { name: "IG carousel — Aug", type: "Image", tags: ["social", "creative"], source: "Image gen", ago: "2d" },
  { name: "Loom — product demo", type: "Video", tags: ["sales"], source: "Screen record", ago: "2d" },
  { name: "SEO keyword map", type: "Sheet", tags: ["seo", "research"], source: "Brief run", ago: "3d" },
  { name: "Brand voice guide", type: "Doc", tags: ["brand"], source: "AI generated", ago: "4d" },
]

const TYPE_COLORS: Record<string, string> = {
  Doc: "text-info",
  Sheet: "text-live",
  Image: "text-warn",
  Video: "text-warn",
  Audio: "text-accent",
  Link: "text-text-faint",
  Brief: "text-accent",
}

function AssetVaultModule() {
  const [filter, setFilter] = useState<AssetType>("All")
  const [search, setSearch] = useState("")

  const visible = VAULT_ITEMS.filter((item) => {
    const matchType = filter === "All" || item.type === filter
    const matchSearch =
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some((t) => t.includes(search.toLowerCase()))
    return matchType && matchSearch
  })

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* toolbar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-line px-3 py-1.5">
        <Archive className="size-3.5 text-accent" />
        <span className="text-xs font-medium text-text">Asset Vault</span>
        <span className="text-[11px] text-text-faint">{VAULT_ITEMS.length} assets</span>
        <div className="ml-auto flex items-center gap-1">
          <button className="flex items-center gap-1 rounded border border-line px-2 py-1 text-[11px] text-text-muted hover:bg-hover hover:text-text">
            <FolderPlus className="size-3" /> New folder
          </button>
          <button className="flex items-center gap-1 rounded border border-line px-2 py-1 text-[11px] text-text-muted hover:bg-hover hover:text-text">
            <Link2 className="size-3" /> Import
          </button>
        </div>
      </div>

      {/* search + type filter */}
      <div className="flex shrink-0 flex-col gap-1.5 border-b border-line px-3 py-2">
        <div className="flex items-center gap-2 rounded-md border border-line bg-void px-2.5 py-1.5">
          <Search className="size-3.5 shrink-0 text-text-faint" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, tag, source…"
            className="flex-1 bg-transparent text-xs text-text placeholder:text-text-faint focus:outline-none"
          />
          {search ? (
            <button onClick={() => setSearch("")} className="text-text-faint hover:text-text">
              <Filter className="size-3" />
            </button>
          ) : null}
        </div>
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          {ASSET_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[11px] transition-colors",
                filter === t
                  ? "bg-hover text-text"
                  : "border border-line text-text-muted hover:bg-hover/60",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* asset list */}
      <div className="min-h-0 flex-1 overflow-auto">
        {visible.length === 0 ? (
          <p className="p-4 text-center text-xs text-text-faint">No assets match.</p>
        ) : (
          visible.map((item) => (
            <div
              key={item.name}
              className="group flex items-center gap-2.5 border-b border-line/60 px-3 py-2 transition-colors hover:bg-hover/40"
            >
              <span className={cn("w-10 shrink-0 text-[10px] font-medium", TYPE_COLORS[item.type] ?? "text-text-faint")}>
                {item.type}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-text">{item.name}</p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="text-[10px] text-text-faint">{item.source}</span>
                  {item.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-0.5 rounded bg-hover px-1 text-[10px] text-text-faint">
                      <Tag className="size-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <span className="flex shrink-0 items-center gap-1 text-[10px] text-text-faint">
                <Clock className="size-3" /> {item.ago}
              </span>
              <button className="invisible size-6 place-items-center rounded text-text-faint hover:text-text group-hover:grid">
                <ExternalLink className="size-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

/* ----------------------- Sheets / Docs wrappers ---------------------------- */

function SheetsModule() {
  const sheets = [
    { name: "Lead list — SaaS CFOs", rows: 412, updated: "2h" },
    { name: "Competitor teardown", rows: 88, updated: "1d" },
    { name: "SEO keyword map", rows: 230, updated: "3d" },
    { name: "Financial model 2026", rows: 540, updated: "5d" },
  ]
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-line px-3 py-1.5">
        <BrandIcon slug="google-sheets" size={14} />
        <span className="text-xs font-medium text-text">Sheets</span>
        <div className="ml-auto flex items-center gap-1">
          <button className="flex items-center gap-1 rounded bg-accent px-2 py-1 text-[11px] font-medium text-void">
            <Plus className="size-3" /> New sheet
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {sheets.map((s) => (
          <div
            key={s.name}
            className="flex items-center gap-2.5 border-b border-line/60 px-3 py-2 transition-colors hover:bg-hover/40"
          >
            <BrandIcon slug="google-sheets" size={16} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-text">{s.name}</p>
              <p className="text-[11px] text-text-faint">{s.rows} rows</p>
            </div>
            <span className="flex items-center gap-1 text-[10px] text-text-faint">
              <Clock className="size-3" /> {s.updated}
            </span>
            <button className="grid size-6 place-items-center rounded text-text-faint hover:text-text">
              <ExternalLink className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function DocsModule() {
  const docsItems = [
    { name: "Q3 GTM Deck", type: "Doc", updated: "2h" },
    { name: "Outreach script v2", type: "Doc", updated: "5h" },
    { name: "Brand voice guide", type: "Doc", updated: "4d" },
    { name: "Company Wiki", type: "Doc", updated: "1w" },
  ]
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-line px-3 py-1.5">
        <BrandIcon slug="google-docs" size={14} />
        <span className="text-xs font-medium text-text">Docs</span>
        <div className="ml-auto flex items-center gap-1">
          <button className="flex items-center gap-1 rounded bg-accent px-2 py-1 text-[11px] font-medium text-void">
            <Plus className="size-3" /> New doc
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {docsItems.map((d) => (
          <div
            key={d.name}
            className="flex items-center gap-2.5 border-b border-line/60 px-3 py-2 transition-colors hover:bg-hover/40"
          >
            <BrandIcon slug="google-docs" size={16} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-text">{d.name}</p>
              <p className="text-[11px] text-text-faint">{d.type}</p>
            </div>
            <span className="flex items-center gap-1 text-[10px] text-text-faint">
              <Clock className="size-3" /> {d.updated}
            </span>
            <button className="grid size-6 place-items-center rounded text-text-faint hover:text-text">
              <ExternalLink className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------------------- Live Research Results ------------------------------ */

function ResearchModule() {
  return (
    <Pad>
      <div className="flex items-center gap-2 rounded-md border border-line bg-void px-2.5 py-1.5">
        <Search className="size-3.5 text-text-faint" />
        <input
          placeholder="Research query…"
          className="flex-1 bg-transparent text-xs text-text placeholder:text-text-faint focus:outline-none"
        />
      </div>
      <p className="mt-2 text-xs text-text-faint">Agent research results render here.</p>
    </Pad>
  )
}

function ConfigModule() {
  return (
    <Pad>
      <div className="space-y-3 text-xs">
        <Section title="Workspace">
          {["Theme: Obsidian", "Density: Comfortable", "Autosave layout: On"].map((r) => (
            <Row key={r}>{r}</Row>
          ))}
        </Section>
        <Section title="Agent defaults">
          {["Voice: Hume EVI", "Coordinator: Hermes", "Max swarm size: 12"].map((r) => (
            <Row key={r}>{r}</Row>
          ))}
        </Section>
      </div>
    </Pad>
  )
}

function EmptyModule() {
  return (
    <div className="grid h-full place-items-center p-6">
      <div className="text-center">
        <LayoutGrid className="mx-auto size-6 text-text-faint" />
        <p className="mt-1 text-xs text-text-faint">Empty container — pick a module from the header.</p>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-text-faint">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-line bg-void px-2.5 py-1.5 text-text-muted">
      {children}
    </div>
  )
}
