"use client"

import * as React from "react"
import {
  AudioLines,
  Download,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const VOICES = [
  { value: "nova", label: "Nova" },
  { value: "alloy", label: "Alloy" },
  { value: "echo", label: "Echo" },
  { value: "fable", label: "Fable" },
  { value: "onyx", label: "Onyx" },
  { value: "shimmer", label: "Shimmer" },
]

const STYLES = [
  { value: "ambient", label: "Ambient" },
  { value: "cinematic", label: "Cinematic" },
  { value: "electronic", label: "Electronic" },
  { value: "jazz", label: "Jazz" },
  { value: "classical", label: "Classical" },
  { value: "lofi", label: "Lo-Fi" },
]

const DURATIONS = [15, 30, 60, 120]
const SPEEDS = [1, 1.5, 2, 0.5]
const BAR_COUNT = 56

// Deterministic waveform from layered sines — SSR-safe, and each seed
// produces a distinct but stable shape
function waveformBars(seed: number, count: number = BAR_COUNT): number[] {
  return Array.from({ length: count }, (_, i) => {
    const v =
      Math.sin(i * 0.42 + seed) +
      Math.sin(i * 0.19 + seed * 3) * 0.6 +
      Math.sin(i * 0.77 + seed * 7) * 0.4
    return Math.round(54 + v * 22)
  })
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

interface Track {
  id: number
  name: string
  kind: "speech" | "music"
  meta: string
  seconds: number
  seed: number
  createdLabel: string
}

const INITIAL_TRACKS: Track[] = [
  {
    id: 1,
    name: "Welcome narration",
    kind: "speech",
    meta: "Nova",
    seconds: 14,
    seed: 3,
    createdLabel: "2h ago",
  },
  {
    id: 2,
    name: "Ambient focus loop",
    kind: "music",
    meta: "Ambient",
    seconds: 60,
    seed: 11,
    createdLabel: "Yesterday",
  },
]

export default function AiAudioGenerator02() {
  const [mode, setMode] = React.useState<"speech" | "music">("speech")
  const [speechText, setSpeechText] = React.useState(
    "Welcome to our AI-powered platform. We're excited to help you build amazing products."
  )
  const [musicText, setMusicText] = React.useState(
    "Calm ambient track with soft piano and gentle synth pads for deep focus."
  )
  const [voice, setVoice] = React.useState("nova")
  const [style, setStyle] = React.useState("ambient")
  const [musicDuration, setMusicDuration] = React.useState(30)
  const [tracks, setTracks] = React.useState<Track[]>(INITIAL_TRACKS)
  const [activeId, setActiveId] = React.useState(1)
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [genProgress, setGenProgress] = React.useState(0)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [playProgress, setPlayProgress] = React.useState(0)
  const [speedIdx, setSpeedIdx] = React.useState(0)
  const nextId = React.useRef(3)

  const active = tracks.find((t) => t.id === activeId) ?? tracks[0]
  const bars = React.useMemo(() => waveformBars(active.seed), [active.seed])
  const speed = SPEEDS[speedIdx]

  const prompt = mode === "speech" ? speechText : musicText
  const wordCount = prompt.split(/\s+/).filter(Boolean).length
  // ~2.5 spoken words per second
  const speechEstimate = Math.max(2, Math.round(wordCount / 2.5))

  // Playback paced to track length and speed
  React.useEffect(() => {
    if (!isPlaying) return
    const tick = Math.max(40, (active.seconds * 1000) / 100 / speed)
    const interval = setInterval(() => {
      setPlayProgress((p) => {
        if (p >= 100) {
          setIsPlaying(false)
          return 0
        }
        return p + 1
      })
    }, tick)
    return () => clearInterval(interval)
  }, [isPlaying, active.seconds, speed])

  const handleGenerate = async () => {
    if (isGenerating || !prompt.trim()) return
    setIsPlaying(false)
    setPlayProgress(0)

    const id = nextId.current++
    const track: Track = {
      id,
      name: prompt.trim().split(/\s+/).slice(0, 4).join(" "),
      kind: mode,
      meta:
        mode === "speech"
          ? (VOICES.find((v) => v.value === voice)?.label ?? "Nova")
          : (STYLES.find((s) => s.value === style)?.label ?? "Ambient"),
      seconds: mode === "speech" ? speechEstimate : musicDuration,
      seed: id * 13 + 5,
      createdLabel: "Just now",
    }
    setTracks((prev) => [track, ...prev].slice(0, 5))
    setActiveId(id)

    setIsGenerating(true)
    setGenProgress(0)
    for (let i = 0; i <= 100; i += 4) {
      await new Promise((r) => setTimeout(r, 70))
      setGenProgress(i)
    }
    setIsGenerating(false)
  }

  const selectTrack = (id: number) => {
    if (id === activeId) return
    setActiveId(id)
    setIsPlaying(false)
    setPlayProgress(0)
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isGenerating) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    setPlayProgress(Math.min(100, Math.max(0, pct)))
  }

  const playedLabel = formatTime(
    Math.round((playProgress / 100) * active.seconds)
  )

  return (
    <div className="container mx-auto py-8">
      <div className="bg-card text-card-foreground mx-auto w-full max-w-2xl rounded-2xl border shadow-sm">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3 border-b px-5 py-3.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-500/10">
            <AudioLines className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
          <span className="text-sm font-semibold">Audio Studio</span>
          <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
            {isGenerating ? (
              <>
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500" />
                Generating
              </>
            ) : (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Ready
              </>
            )}
          </span>

          {/* Mode segmented control */}
          <div className="bg-muted/60 ml-auto flex rounded-lg p-0.5">
            {(["speech", "music"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                  mode === m
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "speech" ? "Speech" : "Music"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-5 p-5">
          {/* Composer */}
          <div className="focus-within:border-ring rounded-xl border transition-colors">
            <Textarea
              value={prompt}
              onChange={(e) =>
                mode === "speech"
                  ? setSpeechText(e.target.value)
                  : setMusicText(e.target.value)
              }
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  handleGenerate()
                }
              }}
              placeholder={
                mode === "speech"
                  ? "Enter text to convert to speech..."
                  : "Describe the music you want to generate..."
              }
              rows={3}
              className="resize-none rounded-b-none border-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
            />
            <div className="flex flex-wrap items-center gap-2 border-t px-2.5 py-2">
              {mode === "speech" ? (
                <Select value={voice} onValueChange={setVoice}>
                  <SelectTrigger
                    className="hover:bg-muted h-8 gap-1.5 border-0 bg-transparent px-2.5 shadow-none"
                    aria-label="Voice"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VOICES.map((v) => (
                      <SelectItem key={v.value} value={v.value}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger
                      className="hover:bg-muted h-8 gap-1.5 border-0 bg-transparent px-2.5 shadow-none"
                      aria-label="Style"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STYLES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="bg-muted/60 flex rounded-lg p-0.5">
                    {DURATIONS.map((d) => (
                      <button
                        key={d}
                        onClick={() => setMusicDuration(d)}
                        aria-pressed={musicDuration === d}
                        className={`rounded-md px-2 py-1 font-mono text-xs transition-colors ${
                          musicDuration === d
                            ? "bg-background shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {formatTime(d)}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div className="ml-auto flex items-center gap-3">
                <span className="text-muted-foreground hidden font-mono text-xs sm:inline">
                  {mode === "speech"
                    ? `${prompt.length} chars · ≈ ${formatTime(speechEstimate)}`
                    : formatTime(musicDuration)}
                </span>
                <Button
                  size="sm"
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="gap-2 bg-gradient-to-b from-orange-500 to-orange-600 text-white shadow-sm hover:from-orange-600 hover:to-orange-600"
                >
                  {isGenerating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  Generate
                  <kbd className="pointer-events-none hidden items-center rounded border border-white/20 bg-white/10 px-1 font-mono text-xs sm:flex">
                    ⌘↵
                  </kbd>
                </Button>
              </div>
            </div>
          </div>

          {/* Player */}
          <div className="rounded-xl border p-4">
            <div
              key={active.id}
              className="animate-in fade-in-0 space-y-3 duration-200"
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{active.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {active.meta} ·{" "}
                    {active.kind === "speech" ? "Speech" : "Music"}
                  </p>
                </div>
                <span className="text-muted-foreground shrink-0 font-mono text-xs">
                  {isGenerating
                    ? `${genProgress}%`
                    : `${playedLabel} / ${formatTime(active.seconds)}`}
                </span>
              </div>

              {/* Waveform — generation draws it in, playback sweeps it,
                  click to seek */}
              <div
                className={`flex h-20 items-center gap-px ${
                  isGenerating ? "" : "cursor-pointer"
                }`}
                onClick={handleSeek}
                role="slider"
                aria-label="Seek"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={playProgress}
              >
                {bars.map((h, i) => {
                  const pct = (i / BAR_COUNT) * 100
                  const drawn = !isGenerating || pct <= genProgress
                  const played = !isGenerating && pct <= playProgress
                  return (
                    <div
                      key={i}
                      className={`w-full flex-1 rounded-full transition-all duration-150 ${
                        played
                          ? "bg-orange-500"
                          : drawn
                            ? "bg-muted-foreground/25"
                            : "bg-muted-foreground/10"
                      }`}
                      style={{ height: drawn ? `${h}%` : "8%" }}
                    />
                  )
                })}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                <Button
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-full"
                  onClick={() => setIsPlaying((p) => !p)}
                  disabled={isGenerating}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <button
                  onClick={() => setSpeedIdx((i) => (i + 1) % SPEEDS.length)}
                  className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-full border px-2 py-0.5 font-mono text-xs transition-colors"
                  aria-label={`Playback speed ${speed}x`}
                >
                  {speed}×
                </button>
                <div className="ml-auto flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    title="Regenerate"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    disabled={isGenerating}
                    title="Download"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2">
              <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Recent
              </span>
              <span className="text-muted-foreground font-mono text-xs">
                {tracks.length}
              </span>
            </div>
            {tracks.map((t) => (
              <button
                key={t.id}
                onClick={() => selectTrack(t.id)}
                className={`group animate-in fade-in-0 flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors duration-200 ${
                  t.id === activeId ? "bg-muted/60" : "hover:bg-muted/40"
                }`}
              >
                <div className="flex h-6 w-12 shrink-0 items-center gap-px">
                  {waveformBars(t.seed, 14).map((h, i) => (
                    <div
                      key={i}
                      className={`w-full flex-1 rounded-full transition-colors ${
                        t.id === activeId
                          ? "bg-orange-500/60"
                          : "bg-muted-foreground/30"
                      }`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {t.meta} · {formatTime(t.seconds)} · {t.createdLabel}
                  </p>
                </div>
                {t.id === activeId && isPlaying && (
                  <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-orange-500" />
                )}
                <Download className="text-muted-foreground h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
