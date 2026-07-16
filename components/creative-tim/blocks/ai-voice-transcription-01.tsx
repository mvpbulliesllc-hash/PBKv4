"use client"

import * as React from "react"
import {
  Check,
  Copy,
  Languages,
  Loader2,
  Mic,
  RotateCcw,
  Square,
} from "lucide-react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "pt", label: "Portuguese" },
]

const MOCK_TRANSCRIPTION =
  "Welcome to the AI voice transcription demo. This is a simulated transcription result showing how the interface handles real-time voice input. The system supports multiple languages and can translate your transcription to any supported language."

const MOCK_TRANSLATIONS: Record<string, string> = {
  es: "Bienvenido a la demostración de transcripción de voz con IA. Este es un resultado de transcripción simulado que muestra cómo la interfaz maneja la entrada de voz en tiempo real.",
  fr: "Bienvenue dans la démo de transcription vocale par IA. Ceci est un résultat de transcription simulé montrant comment l'interface gère les entrées vocales en temps réel.",
  de: "Willkommen bei der KI-Sprachtranskriptions-Demo. Dies ist ein simuliertes Transkriptionsergebnis, das zeigt, wie die Schnittstelle Spracheingaben in Echtzeit verarbeitet.",
  zh: "欢迎使用AI语音转录演示。这是一个模拟的转录结果，显示了界面如何实时处理语音输入。",
  ja: "AI音声文字起こしデモへようこそ。これは、インターフェースがリアルタイムの音声入力をどのように処理するかを示すシミュレートされた文字起こし結果です。",
  pt: "Bem-vindo à demonstração de transcrição de voz por IA. Este é um resultado de transcrição simulado mostrando como a interface lida com entrada de voz em tempo real.",
}

const BAR_COUNT = 24

export default function AiVoiceTranscription01() {
  const [isRecording, setIsRecording] = React.useState(false)
  const [isTranscribing, setIsTranscribing] = React.useState(false)
  const [isStreaming, setIsStreaming] = React.useState(false)
  const [transcription, setTranscription] = React.useState("")
  const [language, setLanguage] = React.useState("en")
  const [targetLang, setTargetLang] = React.useState("es")
  const [elapsed, setElapsed] = React.useState(0)
  const [tick, setTick] = React.useState(0)
  const [copied, setCopied] = React.useState(false)
  const [isTranslating, setIsTranslating] = React.useState(false)
  const [translation, setTranslation] = React.useState("")

  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null)
  const autoStopRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const streamRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

  // Waveform motion — layered sines over a tick counter give a smooth,
  // organic level animation instead of random jitter
  React.useEffect(() => {
    if (!isRecording) return
    const interval = setInterval(() => setTick((t) => t + 1), 120)
    return () => clearInterval(interval)
  }, [isRecording])

  const levels = React.useMemo(
    () =>
      Array.from({ length: BAR_COUNT }, (_, i) => {
        if (!isRecording) return 16
        const v =
          Math.sin(tick * 0.9 + i * 0.7) + Math.sin(tick * 0.5 + i * 1.3) * 0.6
        return Math.round(55 + v * 27)
      }),
    [tick, isRecording]
  )

  // Recording timer
  React.useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRecording])

  React.useEffect(() => {
    return () => {
      if (autoStopRef.current) clearTimeout(autoStopRef.current)
      if (streamRef.current) clearInterval(streamRef.current)
    }
  }, [])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, "0")}`
  }

  const startRecording = () => {
    setIsRecording(true)
    setElapsed(0)
    setTranscription("")
    setTranslation("")
    // Auto-stop after 4 seconds and transcribe
    autoStopRef.current = setTimeout(() => stopRecording(), 4000)
  }

  const stopRecording = () => {
    setIsRecording(false)
    if (autoStopRef.current) clearTimeout(autoStopRef.current)
    setIsTranscribing(true)
    setTimeout(() => {
      setIsTranscribing(false)
      // Stream the transcript in word by word
      setIsStreaming(true)
      const words = MOCK_TRANSCRIPTION.split(" ")
      let count = 0
      streamRef.current = setInterval(() => {
        count++
        setTranscription(words.slice(0, count).join(" "))
        if (count >= words.length) {
          if (streamRef.current) clearInterval(streamRef.current)
          setIsStreaming(false)
        }
      }, 50)
    }, 1200)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(transcription)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    if (streamRef.current) clearInterval(streamRef.current)
    setIsStreaming(false)
    setTranscription("")
    setTranslation("")
    setElapsed(0)
  }

  const handleTranslate = async () => {
    setIsTranslating(true)
    setTranslation("")
    await new Promise((r) => setTimeout(r, 1000))
    setTranslation(
      MOCK_TRANSLATIONS[targetLang] ??
        "Translation not available for selected language in demo."
    )
    setIsTranslating(false)
  }

  const wordCount = transcription.split(/\s+/).filter(Boolean).length

  return (
    <div className="container mx-auto py-8">
      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <CardTitle>Voice transcription</CardTitle>
          <CardDescription>
            Record speech and get a live transcript you can translate.
          </CardDescription>
          <CardAction>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-32" aria-label="Source language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recorder */}
          <div className="flex flex-col items-center gap-5 py-2">
            <div className="relative">
              {isRecording && (
                <>
                  <span className="absolute inset-0 animate-ping rounded-full bg-red-500 opacity-20" />
                  <span className="absolute inset-0 animate-ping rounded-full bg-red-500 opacity-10 [animation-delay:300ms]" />
                </>
              )}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isTranscribing || isStreaming}
                aria-label={isRecording ? "Stop recording" : "Start recording"}
                className={`relative flex h-16 w-16 items-center justify-center rounded-full text-white shadow-sm transition-colors duration-200 ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-orange-500 hover:bg-orange-600"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {isRecording ? (
                  <Square className="h-5 w-5 fill-current" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </button>
            </div>

            {/* Waveform */}
            <div className="flex h-12 items-center gap-1">
              {levels.map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-[height] duration-150 ${
                    isRecording ? "bg-orange-500" : "bg-muted-foreground/20"
                  }`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>

            {/* Status */}
            <div className="flex h-5 items-center">
              {isRecording ? (
                <span className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                  Recording
                  <span className="text-muted-foreground font-mono text-xs">
                    {formatTime(elapsed)}
                  </span>
                </span>
              ) : isTranscribing ? (
                <span className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-orange-500" />
                  Transcribing...
                </span>
              ) : (
                <span className="text-muted-foreground text-sm">
                  {transcription
                    ? "Tap to record again"
                    : "Tap to start recording"}
                </span>
              )}
            </div>
          </div>

          {/* Transcription */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Transcript</Label>
              {transcription && !isStreaming && (
                <span className="text-muted-foreground font-mono text-xs">
                  {wordCount} words
                </span>
              )}
            </div>
            <div className="min-h-24 rounded-lg border p-3 text-sm leading-relaxed">
              {transcription ? (
                <>
                  {transcription}
                  {isStreaming && (
                    <span className="bg-foreground ml-0.5 inline-block h-3.5 w-0.5 animate-pulse align-middle" />
                  )}
                </>
              ) : (
                <span className="text-muted-foreground">
                  Your transcript will appear here...
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          {transcription && !isStreaming && (
            <div className="animate-in fade-in-0 slide-in-from-bottom-1 flex flex-wrap items-center gap-2 duration-300">
              <Button size="sm" variant="outline" onClick={handleCopy}>
                {copied ? (
                  <Check className="animate-in zoom-in-50 mr-1.5 h-3.5 w-3.5 text-emerald-600 duration-200 dark:text-emerald-400" />
                ) : (
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button size="sm" variant="outline" onClick={handleClear}>
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Clear
              </Button>
              <div className="ml-auto flex items-center gap-1.5">
                <Select value={targetLang} onValueChange={setTargetLang}>
                  <SelectTrigger
                    className="h-8 w-32"
                    aria-label="Target language"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.filter((l) => l.value !== language).map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleTranslate}
                  disabled={isTranslating}
                >
                  {isTranslating ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Languages className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Translate
                </Button>
              </div>
            </div>
          )}

          {/* Translation */}
          {translation && (
            <div className="animate-in fade-in-0 slide-in-from-bottom-1 space-y-2 duration-300">
              <Label>
                Translation ·{" "}
                {LANGUAGES.find((l) => l.value === targetLang)?.label}
              </Label>
              <div className="bg-muted/50 rounded-lg border p-3 text-sm leading-relaxed">
                {translation}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
