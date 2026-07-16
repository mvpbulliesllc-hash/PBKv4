"use client"

import { useState, useRef } from "react"
import {
  Upload,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  ChevronRight,
  X,
  Mic,
  CheckCircle2,
  LayoutDashboard,
  Receipt,
  DollarSign,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  Tutorial bubbles — shown once on first load, dismissible           */
/* ------------------------------------------------------------------ */

const TIPS = [
  {
    id: "avatar",
    anchor: "avatar",
    text: "This is Elliana — your AI ops lead. Ask her anything: reports, emails, scheduling, research. Voice or text.",
  },
  {
    id: "expense",
    anchor: "expense",
    text: "Snap or upload any receipt. Elliana reads it, categorises it, and logs it to your P&L automatically.",
  },
  {
    id: "revenue",
    anchor: "revenue",
    text: "Upload a paid invoice, Zelle screenshot, Cash App receipt — anything. She knows if it's income or a pending payment and files it correctly.",
  },
  {
    id: "enter",
    anchor: "enter",
    text: "When you're ready to go deeper — agents, pipelines, outbound — the full platform is one click away.",
  },
]

/* ------------------------------------------------------------------ */
/*  Quick-action upload card                                            */
/* ------------------------------------------------------------------ */

function UploadCard({
  id,
  icon: Icon,
  label,
  sublabel,
  accent,
  onFile,
}: {
  id: string
  icon: React.ElementType
  label: string
  sublabel: string
  accent: string
  onFile: (f: File) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  const [done, setDone] = useState(false)
  const [fileName, setFileName] = useState("")

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFileName(f.name)
    setDone(true)
    onFile(f)
  }

  return (
    <button
      id={id}
      onClick={() => !done && ref.current?.click()}
      className={cn(
        "group relative flex flex-col items-center gap-4 rounded-2xl border bg-panel px-8 py-10 text-center transition-all duration-200",
        "hover:border-line-strong hover:bg-elevated hover:shadow-2xl hover:shadow-black/60",
        done ? "border-live/40" : "border-line",
      )}
    >
      <input ref={ref} type="file" accept="image/*,.pdf" className="hidden" onChange={pick} />

      <div
        className={cn(
          "grid size-16 place-items-center rounded-2xl border text-2xl transition-colors",
          done
            ? "border-live/30 bg-live/10 text-live"
            : `border-line ${accent} group-hover:border-line-strong`,
        )}
      >
        {done ? <CheckCircle2 className="size-8" /> : <Icon className="size-8" />}
      </div>

      <div>
        <p className="text-base font-semibold text-text">{done ? "Logged" : label}</p>
        <p className="mt-1 text-sm text-text-muted">
          {done ? (
            <span className="flex items-center justify-center gap-1.5 text-live">
              <CheckCircle2 className="size-3.5" />
              {fileName.length > 28 ? fileName.slice(0, 28) + "…" : fileName}
            </span>
          ) : (
            sublabel
          )}
        </p>
      </div>

      {!done && (
        <div className="flex items-center gap-1.5 rounded-full border border-line px-4 py-1.5 text-xs text-text-muted transition-colors group-hover:border-line-strong group-hover:text-text">
          <Upload className="size-3.5" />
          Upload file
        </div>
      )}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Pending items strip                                                 */
/* ------------------------------------------------------------------ */

const PENDING = [
  { dir: "owed-to-us", label: "Invoice #1042 — Acme Corp", amount: "$3,200", age: "5d" },
  { dir: "we-owe", label: "Supplier — lumber delivery", amount: "$840", age: "2d" },
  { dir: "owed-to-us", label: "Invoice #1039 — Martinez", amount: "$1,750", age: "8d" },
]

function PendingStrip() {
  return (
    <div className="w-full max-w-3xl space-y-2">
      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-text-faint">
        Pending — Elliana is watching these
      </p>
      {PENDING.map((p) => (
        <div
          key={p.label}
          className="flex items-center gap-3 rounded-xl border border-line bg-panel px-5 py-3"
        >
          {p.dir === "owed-to-us" ? (
            <ArrowDownLeft className="size-4 shrink-0 text-live" />
          ) : (
            <ArrowUpRight className="size-4 shrink-0 text-warn" />
          )}
          <span className="flex-1 text-sm text-text-muted">{p.label}</span>
          <span
            className={cn(
              "text-sm font-semibold",
              p.dir === "owed-to-us" ? "text-live" : "text-warn",
            )}
          >
            {p.amount}
          </span>
          <span className="flex items-center gap-1 text-xs text-text-faint">
            <Clock className="size-3.5" />
            {p.age}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tutorial bubble                                                     */
/* ------------------------------------------------------------------ */

function TipBubble({
  tip,
  index,
  onDismiss,
}: {
  tip: (typeof TIPS)[0]
  index: number
  onDismiss: (id: string) => void
}) {
  return (
    <div
      className={cn(
        "pointer-events-auto flex max-w-xs items-start gap-3 rounded-2xl border border-line-strong bg-elevated px-4 py-3 shadow-2xl shadow-black/80",
        "animate-in fade-in slide-in-from-bottom-2 duration-300",
      )}
      style={{ animationDelay: `${index * 120}ms` }}
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-accent" />
      <p className="flex-1 text-xs leading-relaxed text-text-muted">{tip.text}</p>
      <button
        onClick={() => onDismiss(tip.id)}
        className="mt-0.5 shrink-0 text-text-faint transition-colors hover:text-text"
        aria-label="Dismiss tip"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main dashboard home                                                 */
/* ------------------------------------------------------------------ */

export function DashboardHome({ onEnter }: { onEnter: () => void }) {
  const [tips, setTips] = useState(TIPS.map((t) => t.id))
  const [voiceActive, setVoiceActive] = useState(false)

  function dismissTip(id: string) {
    setTips((prev) => prev.filter((t) => t !== id))
  }

  function dismissAll() {
    setTips([])
  }

  const visibleTips = TIPS.filter((t) => tips.includes(t.id))

  return (
    <div className="relative flex min-h-screen flex-col items-center gap-10 overflow-hidden bg-void px-4 pb-16 pt-12">
      {/* subtle grid texture */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-line) 1px,transparent 1px),linear-gradient(90deg,var(--color-line) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden="true"
      />

      {/* ---- wordmark ---- */}
      <div className="text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-text-faint">
          Paragon Exterior NJ
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-text">
          Good to have you back.
        </h1>
      </div>

      {/* ---- Elliana avatar screen ---- */}
      <div
        id="avatar"
        className="gloss-elevated relative w-full max-w-3xl overflow-hidden rounded-3xl border border-line-strong shadow-2xl shadow-black/80"
      >
        {/* screen bezel top bar */}
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <div className="flex items-center gap-2.5">
            <span className="size-2 animate-pulse rounded-full bg-live" />
            <span className="text-xs font-medium text-text-muted">
              Elliana — Ops Lead
            </span>
          </div>
          <button
            onClick={() => setVoiceActive((v) => !v)}
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
              voiceActive
                ? "border-live/40 bg-live/10 text-live"
                : "border-line text-text-muted hover:border-line-strong hover:text-text",
            )}
          >
            <Mic className={cn("size-3.5", voiceActive && "animate-pulse")} />
            {voiceActive ? "Listening…" : "Talk to Elliana"}
          </button>
        </div>

        {/* Elliana avatar — Hume iframe mounts here when wired */}
        <div className="relative flex aspect-video w-full overflow-hidden bg-void">
          {/* full-bleed photo */}
          <img
            src="/elliana.png"
            alt="Elliana — Paragon AI Ops Lead"
            className="h-full w-full object-cover object-top"
          />
          {/* subtle dark vignette so text is readable over the photo */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          {/* name + intro copy pinned to bottom-left */}
          <div className="absolute bottom-0 left-0 p-5">
            <p className="text-base font-semibold text-white">Hi, I&apos;m Elliana.</p>
            <p className="mt-1 max-w-xs text-sm leading-relaxed text-white/70">
              I run your back office. Ask me anything — reports, emails,
              invoices, scheduling. Upload a receipt and I&apos;ll handle the rest.
            </p>
          </div>
          {/* Hume EVI mount point — drop your iframe here */}
          <div
            id="hume-mount"
            className="absolute inset-0"
            aria-label="Hume EVI embed point"
          />
        </div>
      </div>

      {/* ---- quick action cards ---- */}
      <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
        <UploadCard
          id="expense"
          icon={Receipt}
          label="Log an Expense"
          sublabel="Photo or PDF of any receipt, bill, or invoice you paid"
          accent="text-text-faint"
          onFile={(_f) => {}}
        />
        <UploadCard
          id="revenue"
          icon={DollarSign}
          label="Log Revenue"
          sublabel="Paid invoice, Zelle, Cash App, check — anything coming in"
          accent="text-live"
          onFile={(_f) => {}}
        />
      </div>

      {/* ---- pending strip ---- */}
      <PendingStrip />

      {/* ---- enter platform CTA ---- */}
      <div id="enter" className="flex flex-col items-center gap-3">
        <button
          onClick={onEnter}
          className="flex items-center gap-2.5 rounded-2xl border border-line-strong bg-panel px-8 py-4 text-sm font-semibold text-text shadow-lg shadow-black/40 transition-all hover:bg-elevated hover:shadow-black/60 active:scale-[0.98]"
        >
          <LayoutDashboard className="size-4 text-text-muted" />
          Enter the Platform
          <ChevronRight className="size-4 text-text-faint" />
        </button>
        <p className="text-xs text-text-faint">Full workbench — agents, pipeline, outbound, dev suite</p>
      </div>

      {/* ---- tutorial bubbles overlay (bottom-right) ---- */}
      {visibleTips.length > 0 && (
        <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
          {visibleTips.map((tip, i) => (
            <TipBubble key={tip.id} tip={tip} index={i} onDismiss={dismissTip} />
          ))}
          <button
            onClick={dismissAll}
            className="pointer-events-auto mt-1 text-[11px] text-text-faint transition-colors hover:text-text"
          >
            Dismiss all tips
          </button>
        </div>
      )}
    </div>
  )
}
