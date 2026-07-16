"use client"

import * as React from "react"
import {
  Bot,
  Calculator,
  ChevronDown,
  ChevronRight,
  Cloud,
  Globe,
  Loader2,
  Send,
  Wrench,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface ToolCall {
  id: string
  name: string
  input: Record<string, unknown>
  output: string
  durationMs: number
  isRunning: boolean
  isExpanded: boolean
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  toolCalls?: ToolCall[]
}

const TOOL_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  web_search: Globe,
  calculator: Calculator,
  get_weather: Cloud,
  default: Wrench,
}

const MOCK_CONVERSATIONS: Array<{
  user: string
  toolCalls: Omit<ToolCall, "id" | "isRunning" | "isExpanded">[]
  response: string
}> = [
  {
    user: "What's the weather in Paris and what is 15% of €2,450?",
    toolCalls: [
      {
        name: "get_weather",
        input: { location: "Paris, France", units: "celsius" },
        output:
          '{"temp": 18, "condition": "Partly cloudy", "humidity": "62%", "wind": "12 km/h NW"}',
        durationMs: 312,
      },
      {
        name: "calculator",
        input: { expression: "2450 * 0.15" },
        output: '{"result": 367.5, "expression": "2450 × 0.15 = 367.5"}',
        durationMs: 8,
      },
    ],
    response:
      "In Paris it's currently 18°C with partly cloudy skies. As for your calculation, 15% of €2,450 is **€367.50**.",
  },
  {
    user: "Search for the latest news on AI regulation in the EU.",
    toolCalls: [
      {
        name: "web_search",
        input: {
          query: "EU AI Act 2025 latest news regulations",
          num_results: 3,
        },
        output:
          '{"results": [{"title": "EU AI Act enters into force — August 2025 key provisions take effect", "url": "https://ec.europa.eu/...", "snippet": "The EU AI Act\'s first set of obligations now apply..."}, {"title": "GDPR vs AI Act: compliance roadmap for enterprises", "url": "https://techcrunch.com/...", "snippet": "Companies face dual compliance requirements..."}]}',
        durationMs: 847,
      },
    ],
    response:
      "Here's what I found: The EU AI Act entered into force with key August 2025 provisions now active. Enterprises face compliance requirements under both GDPR and the new AI Act, particularly for high-risk AI systems.",
  },
]

function ToolCallCard({
  tool,
  onToggle,
}: {
  tool: ToolCall
  onToggle: () => void
}) {
  const Icon = TOOL_ICONS[tool.name] ?? TOOL_ICONS.default

  return (
    <div className="bg-muted/30 my-1 rounded-lg border text-xs">
      <button
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
        onClick={onToggle}
      >
        <Wrench className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
        <Icon className="h-3.5 w-3.5 shrink-0 text-orange-500" />
        <span className="font-mono font-semibold">{tool.name}</span>
        {tool.isRunning ? (
          <Loader2 className="ml-1 h-3 w-3 animate-spin text-amber-500" />
        ) : (
          <Badge
            variant="outline"
            className="ml-1 border-emerald-200 px-1.5 py-0 text-xs text-emerald-600 dark:border-emerald-800 dark:text-emerald-400"
          >
            {tool.durationMs}ms
          </Badge>
        )}
        <span className="ml-auto">
          {tool.isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </span>
      </button>
      {tool.isExpanded && !tool.isRunning && (
        <div className="space-y-2 border-t px-3 pt-2 pb-2">
          <div>
            <p className="text-muted-foreground mb-1 text-xs font-semibold tracking-wide uppercase">
              Input
            </p>
            <pre className="bg-background overflow-x-auto rounded border p-2 font-mono text-xs leading-relaxed">
              {JSON.stringify(tool.input, null, 2)}
            </pre>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-xs font-semibold tracking-wide uppercase">
              Output
            </p>
            <pre className="bg-background overflow-x-auto rounded border p-2 font-mono text-xs leading-relaxed">
              {tool.output}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AiToolUse01() {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      content:
        "Hi! I'm an AI assistant with tool access. I can search the web, do calculations, and check the weather. Try asking me something!",
    },
  ])
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [mockIdx, setMockIdx] = React.useState(0)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const toggleTool = (msgId: string, toolId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? {
              ...m,
              toolCalls: m.toolCalls?.map((t) =>
                t.id === toolId ? { ...t, isExpanded: !t.isExpanded } : t
              ),
            }
          : m
      )
    )
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    const scenario = MOCK_CONVERSATIONS[mockIdx % MOCK_CONVERSATIONS.length]
    setMockIdx((i) => i + 1)

    // Add assistant message with running tools
    const assistantMsgId = (Date.now() + 1).toString()
    const toolsInit: ToolCall[] = scenario.toolCalls.map((t, i) => ({
      ...t,
      id: `${assistantMsgId}-tool-${i}`,
      isRunning: true,
      isExpanded: false,
    }))

    setMessages((prev) => [
      ...prev,
      {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        toolCalls: toolsInit,
      },
    ])

    // Simulate tools completing one by one
    for (let i = 0; i < toolsInit.length; i++) {
      await new Promise((r) => setTimeout(r, toolsInit[i].durationMs + 500))
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                toolCalls: m.toolCalls?.map((t) =>
                  t.id === toolsInit[i].id ? { ...t, isRunning: false } : t
                ),
              }
            : m
        )
      )
    }

    // Final response
    await new Promise((r) => setTimeout(r, 400))
    setMessages((prev) =>
      prev.map((m) =>
        m.id === assistantMsgId ? { ...m, content: scenario.response } : m
      )
    )
    setIsLoading(false)
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-orange-500" />
            AI Agent with Tool Calls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-120 rounded-md border p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-orange-100 text-xs text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                        AI
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="max-w-5/6 space-y-1">
                    {/* Tool calls */}
                    {msg.toolCalls && msg.toolCalls.length > 0 && (
                      <div>
                        {msg.toolCalls.map((tool) => (
                          <ToolCallCard
                            key={tool.id}
                            tool={tool}
                            onToggle={() => toggleTool(msg.id, tool.id)}
                          />
                        ))}
                      </div>
                    )}
                    {/* Message content */}
                    {msg.content && (
                      <div
                        className={`rounded-lg px-3 py-2 text-sm ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {msg.content}
                      </div>
                    )}
                    {/* Still running */}
                    {msg.role === "assistant" &&
                      !msg.content &&
                      msg.toolCalls?.every((t) => !t.isRunning) && (
                        <div className="bg-muted flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Composing response...
                        </div>
                      )}
                  </div>
                  {msg.role === "user" && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="text-xs">You</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          <Separator />

          <div className="text-muted-foreground flex flex-wrap gap-1.5 text-xs">
            <span className="font-medium">Available tools:</span>
            {["web_search", "calculator", "get_weather"].map((t) => {
              const Icon = TOOL_ICONS[t] ?? TOOL_ICONS.default
              return (
                <Badge
                  key={t}
                  variant="outline"
                  className="gap-1 font-mono text-xs"
                >
                  <Icon className="h-3 w-3" />
                  {t}
                </Badge>
              )
            })}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything — I'll use tools as needed..."
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
