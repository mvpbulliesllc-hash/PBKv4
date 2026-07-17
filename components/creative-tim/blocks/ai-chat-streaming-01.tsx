"use client"

import * as React from "react"
import { Brain, Loader2, Send } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const AI_PROVIDERS = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
]

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  execution?: string
  isStreaming?: boolean
}

export default function AIChatStreamingBlock() {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "AY.0 model console ready. Choose an authenticated provider and send an instruction.",
    },
  ])
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [provider, setProvider] = React.useState("openai")
  const [showExecution, setShowExecution] = React.useState(false)
  const [providerStatus, setProviderStatus] = React.useState<Record<string, string>>({})
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    let active = true
    fetch("/api/ay0/connectors/health", { cache: "no-store" })
      .then(async (response) => response.ok ? response.json() as Promise<{ connectors?: Array<{ capability: string; status: string }> }> : { connectors: [] })
      .then((data) => {
        if (!active) return
        setProviderStatus(Object.fromEntries((data.connectors ?? []).map((connector) => [connector.capability, connector.status])))
      })
      .catch(() => { if (active) setProviderStatus({}) })
    return () => { active = false }
  }, [])

  const simulateStreaming = async (text: string, model: string) => {
    const words = text.split(" ")
    let currentText = ""

    const messageId = Date.now().toString()
    setMessages((prev) => [
      ...prev,
      {
        id: messageId,
        role: "assistant",
        content: "",
        execution: showExecution
          ? `Verified server response · ${model}`
          : undefined,
        isStreaming: true,
      },
    ])

    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? " " : "") + words[i]
      await new Promise((resolve) => setTimeout(resolve, 50))

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                content: currentText,
                isStreaming: i < words.length - 1,
              }
            : msg
        )
      )
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/ay0/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, prompt: userMessage.content }),
      })
      const payload = await response.json() as { text?: string; model?: string; error?: string }
      if (!response.ok || !payload.text || !payload.model) throw new Error(payload.error || "Provider request failed")
      await simulateStreaming(payload.text, payload.model)
    } catch (error) {
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: error instanceof Error ? error.message : "Provider request failed." }])
    }
    setIsLoading(false)
  }

  React.useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="container mx-auto py-8">
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AY.0 Model Console
          </CardTitle>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="provider">AI Provider</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger id="provider">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {AI_PROVIDERS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Server vault</Label>
              <div className="flex h-9 items-center rounded-md border px-3 text-sm text-muted-foreground">
                {providerStatus[`llm.${provider}`] === "authenticated" ? "Authenticated" : "Check connector health"}
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="showThinking"
              checked={showExecution}
              onChange={(e) => setShowExecution(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="showThinking" className="cursor-pointer text-sm">
              Show verified execution status
            </Label>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea
            className="h-[400px] rounded-md border p-4"
            ref={scrollAreaRef}
          >
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        AI
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[80%] space-y-2 ${
                      message.role === "user" ? "order-first" : ""
                    }`}
                  >
                    {message.execution && (
                      <div className="bg-muted/50 mb-2 rounded-lg border border-dashed p-3">
                        <p className="text-muted-foreground flex items-center gap-2 text-sm">
                          <Brain className="h-4 w-4" />
                          <span className="italic">{message.execution}</span>
                        </p>
                      </div>
                    )}
                    <div
                      className={`rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">
                        {message.content}
                        {message.isStreaming && (
                          <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-current" />
                        )}
                      </p>
                    </div>
                  </div>
                  {message.role === "user" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading &&
                messages[messages.length - 1]?.role !== "assistant" && (
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        AI
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted flex items-center gap-2 rounded-lg p-3">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Waiting for provider...</span>
                    </div>
                  </div>
                )}
            </div>
          </ScrollArea>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex gap-2"
          >
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading || providerStatus[`llm.${provider}`] !== "authenticated"}
            />
            <Button
              type="submit"
              disabled={isLoading || providerStatus[`llm.${provider}`] !== "authenticated" || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          {providerStatus[`llm.${provider}`] !== "authenticated" && (
            <p className="text-muted-foreground text-center text-sm">
              Provider access stays server-side. Open Connectors to verify this provider.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
