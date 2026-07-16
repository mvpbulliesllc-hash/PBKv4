"use client"

import * as React from "react"
import {
  Download,
  Loader2,
  Music,
  Pause,
  Play,
  RefreshCw,
  Volume2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

const VOICES = [
  { value: "alloy", label: "Alloy (Neutral)" },
  { value: "echo", label: "Echo (Male)" },
  { value: "fable", label: "Fable (British)" },
  { value: "onyx", label: "Onyx (Deep)" },
  { value: "nova", label: "Nova (Female)" },
  { value: "shimmer", label: "Shimmer (Soft)" },
]

const MUSIC_STYLES = [
  { value: "ambient", label: "Ambient" },
  { value: "cinematic", label: "Cinematic" },
  { value: "electronic", label: "Electronic" },
  { value: "jazz", label: "Jazz" },
  { value: "classical", label: "Classical" },
  { value: "lofi", label: "Lo-Fi Hip Hop" },
]

const BAR_COUNT = 48

// Deterministic waveform shape — layered sines instead of Math.random(),
// so server and client render the same bars (no hydration mismatch)
function waveformBars(seed: number): number[] {
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    const v =
      Math.sin(i * 0.4 + seed) +
      Math.sin(i * 0.17 + seed * 3) * 0.6 +
      Math.sin(i * 0.83 + seed * 7) * 0.4
    return Math.round(54 + v * 21)
  })
}

export default function AiAudioGenerator01() {
  const [mode, setMode] = React.useState("tts")
  const [prompt, setPrompt] = React.useState(
    "Welcome to our AI-powered platform. We're excited to help you build amazing products."
  )
  const [musicPrompt, setMusicPrompt] = React.useState(
    "Calm ambient background music with soft piano and gentle synth pads, suitable for a productivity app."
  )
  const [voice, setVoice] = React.useState("nova")
  const [musicStyle, setMusicStyle] = React.useState("ambient")
  const [duration, setDuration] = React.useState([30])
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [isGenerated, setIsGenerated] = React.useState(false)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [playProgress, setPlayProgress] = React.useState(0)
  const [seed, setSeed] = React.useState(7)

  const bars = React.useMemo(() => waveformBars(seed), [seed])
  const totalSeconds = duration[0]

  // Playback progress paced to the selected duration
  React.useEffect(() => {
    if (!isPlaying) return
    const tick = Math.max(50, (totalSeconds * 1000) / 100)
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
  }, [isPlaying, totalSeconds])

  const handleGenerate = async () => {
    setIsGenerating(true)
    setIsGenerated(false)
    setProgress(0)
    setIsPlaying(false)
    setPlayProgress(0)
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 150))
      setProgress(i)
    }
    setSeed((s) => s + 1)
    setIsGenerating(false)
    setIsGenerated(true)
  }

  const handleModeChange = (value: string) => {
    setMode(value)
    setIsGenerated(false)
    setIsPlaying(false)
    setPlayProgress(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const durationLabel = formatTime(totalSeconds)
  const playedLabel = formatTime(
    Math.round((playProgress / 100) * totalSeconds)
  )
  const activePrompt = mode === "tts" ? prompt : musicPrompt

  return (
    <div className="container mx-auto py-8">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Audio generator</CardTitle>
          <CardDescription>
            Generate speech from text or music from a prompt.
          </CardDescription>
          <CardAction>
            <Badge variant="secondary">Beta</Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={mode} onValueChange={handleModeChange}>
            <TabsList className="w-full">
              <TabsTrigger value="tts" className="flex-1">
                Text to speech
              </TabsTrigger>
              <TabsTrigger value="music" className="flex-1">
                Music
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tts" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="audio-tts-text">Text to speak</Label>
                <Textarea
                  id="audio-tts-text"
                  placeholder="Enter text to convert to speech..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <p className="text-muted-foreground text-right font-mono text-xs">
                  {prompt.length} characters
                </p>
              </div>
              <div className="space-y-2">
                <Label>Voice</Label>
                <Select value={voice} onValueChange={setVoice}>
                  <SelectTrigger>
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
              </div>
            </TabsContent>

            <TabsContent value="music" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="audio-music-prompt">Music prompt</Label>
                <Textarea
                  id="audio-music-prompt"
                  placeholder="Describe the music you want to generate..."
                  value={musicPrompt}
                  onChange={(e) => setMusicPrompt(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label>Style</Label>
                <Select value={musicStyle} onValueChange={setMusicStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MUSIC_STYLES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          {/* Duration slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Duration</Label>
              <span className="text-muted-foreground font-mono text-xs">
                {durationLabel}
              </span>
            </div>
            <Slider
              value={duration}
              onValueChange={setDuration}
              min={5}
              max={120}
              step={5}
              className="w-full"
            />
          </div>

          {/* Generate button */}
          <Button
            className="w-full"
            onClick={handleGenerate}
            disabled={isGenerating || !activePrompt.trim()}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Music className="mr-2 h-4 w-4" />
                Generate audio
              </>
            )}
          </Button>

          {/* Generation progress */}
          {isGenerating && (
            <div className="animate-in fade-in-0 space-y-2 duration-300">
              <Progress value={progress} className="h-1" />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Processing audio...
                </span>
                <span className="text-muted-foreground font-mono text-xs">
                  {progress}%
                </span>
              </div>
            </div>
          )}

          {/* Player */}
          {isGenerated && (
            <div className="animate-in fade-in-0 slide-in-from-bottom-2 space-y-3 rounded-xl border p-4 duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm font-medium">
                    {mode === "tts"
                      ? VOICES.find((v) => v.value === voice)?.label
                      : MUSIC_STYLES.find((s) => s.value === musicStyle)?.label}
                  </span>
                </div>
                <span className="text-muted-foreground font-mono text-xs">
                  {durationLabel}
                </span>
              </div>

              {/* Waveform — the orange sweep doubles as the progress bar */}
              <div className="flex h-16 items-center gap-px">
                {bars.map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-full transition-colors duration-150 ${
                      (i / BAR_COUNT) * 100 <= playProgress
                        ? "bg-orange-500"
                        : "bg-muted-foreground/20"
                    }`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>

              {/* Player controls */}
              <div className="flex items-center gap-3">
                <Button
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-full"
                  onClick={() => setIsPlaying((p) => !p)}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <span className="text-muted-foreground font-mono text-xs">
                  {playedLabel} / {durationLabel}
                </span>
                <div className="ml-auto flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={handleGenerate}
                    title="Regenerate"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    title="Download"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
