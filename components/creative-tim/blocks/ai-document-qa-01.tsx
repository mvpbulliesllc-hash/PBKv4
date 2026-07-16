"use client"

import * as React from "react"
import { BookOpen, Bot, FileText, Loader2, Send, Upload } from "lucide-react"

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

interface DocChunk {
  id: number
  title: string
  snippet: string
  page: number
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  citations?: number[]
}

const DOC_CHUNKS: DocChunk[] = [
  {
    id: 1,
    title: "Executive Summary",
    page: 1,
    snippet:
      "Q4 2025 revenue reached $4.2M, a 28% increase year-over-year. The enterprise segment drove 62% of total revenue, with 14 new Fortune 500 clients onboarded.",
  },
  {
    id: 2,
    title: "Growth Drivers",
    page: 3,
    snippet:
      "Three key growth drivers: (1) expansion into APAC markets with 3 new regional offices, (2) product-led growth via freemium conversion rate improving to 8.4%, (3) partnership revenue from system integrators increasing 3x.",
  },
  {
    id: 3,
    title: "Risk Factors",
    page: 5,
    snippet:
      "Primary risks identified: macroeconomic headwinds affecting mid-market deal cycles (avg. elongation of 18 days), increased competition in the SMB segment, and potential regulatory changes in the EU impacting data residency requirements.",
  },
  {
    id: 4,
    title: "Q1 2026 Forecast",
    page: 7,
    snippet:
      "Q1 2026 pipeline stands at $6.8M with a projected close rate of 34%, yielding an expected bookings figure of $2.3M. Headcount is planned to grow by 22 FTEs, primarily in engineering and customer success.",
  },
  {
    id: 5,
    title: "Product Roadmap Highlights",
    page: 9,
    snippet:
      "H1 2026 priorities: AI-native workflow automation (GA in March), mobile SDK v2.0 (April), and SOC 2 Type II certification completion (May). These features address top 3 enterprise objections from 2025 sales cycles.",
  },
]

const MOCK_ANSWERS: Array<{
  keywords: string[]
  answer: string
  citations: number[]
}> = [
  {
    keywords: ["revenue", "q4", "sales", "total"],
    answer:
      "Q4 2025 revenue reached $4.2M, representing a 28% year-over-year increase. The enterprise segment was the primary driver, contributing 62% of total revenue [1]. This growth was supported by expansion into new markets and improved conversion rates [2].",
    citations: [1, 2],
  },
  {
    keywords: ["risk", "risks", "threat", "challenge"],
    answer:
      "The report identifies three primary risk factors [3]: macroeconomic headwinds elongating deal cycles by an average of 18 days, increased competition in the SMB segment, and potential EU regulatory changes affecting data residency. These risks are being actively monitored by the leadership team.",
    citations: [3],
  },
  {
    keywords: ["forecast", "q1", "2026", "prediction", "pipeline"],
    answer:
      "For Q1 2026, the pipeline stands at $6.8M with a projected 34% close rate, yielding expected bookings of ~$2.3M [4]. Headcount is planned to increase by 22 FTEs, focused on engineering and customer success roles.",
    citations: [4],
  },
  {
    keywords: ["product", "roadmap", "feature", "release"],
    answer:
      "H1 2026 product priorities include AI-native workflow automation launching in March, mobile SDK v2.0 in April, and SOC 2 Type II certification in May [5]. These releases directly address the top enterprise objections encountered during 2025 sales cycles.",
    citations: [5],
  },
]

function getAnswer(question: string): { answer: string; citations: number[] } {
  const lower = question.toLowerCase()
  for (const mock of MOCK_ANSWERS) {
    if (mock.keywords.some((k) => lower.includes(k))) {
      return { answer: mock.answer, citations: mock.citations }
    }
  }
  return {
    answer:
      "Based on the loaded document, I can answer questions about Q4 revenue, risk factors, Q1 2026 forecast, and product roadmap. Could you clarify what specific information you're looking for? [1][2]",
    citations: [1, 2],
  }
}

export default function AiDocumentQa01() {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content:
        "I've loaded \"Q4 2025 Business Report.pdf\" with 5 sections. Ask me anything about the document and I'll cite the relevant sections.",
    },
  ])
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [highlightedChunk, setHighlightedChunk] = React.useState<number | null>(
    null
  )
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

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

    await new Promise((r) => setTimeout(r, 1200))

    const { answer, citations } = getAnswer(userMsg.content)
    setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: answer,
        citations,
      },
    ])
    setIsLoading(false)
  }

  const renderContentWithCitations = (
    content: string,
    citations?: number[]
  ) => {
    const parts = content.split(/(\[\d+\])/g)
    return parts.map((part, i) => {
      const match = part.match(/^\[(\d+)\]$/)
      if (match) {
        const num = parseInt(match[1])
        return (
          <sup key={i}>
            <button
              className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded bg-orange-100 px-1 text-xs font-bold text-orange-700 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:hover:bg-orange-800"
              onMouseEnter={() => setHighlightedChunk(num)}
              onMouseLeave={() => setHighlightedChunk(null)}
            >
              {num}
            </button>
          </sup>
        )
      }
      return <span key={i}>{part}</span>
    })
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="mx-auto max-w-5xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-orange-500" />
            Document Q&A with Citations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {/* Left: Document chunks */}
            <div className="w-72 shrink-0 space-y-2">
              <div className="bg-muted/40 flex items-center gap-2 rounded-md border p-2">
                <FileText className="h-4 w-4 shrink-0 text-orange-500" />
                <span className="truncate text-sm font-medium">
                  Q4 2025 Business Report.pdf
                </span>
                <Badge variant="outline" className="ml-auto shrink-0 text-xs">
                  {DOC_CHUNKS.length} chunks
                </Badge>
              </div>

              <ScrollArea className="h-130">
                <div className="space-y-2 pr-2">
                  {DOC_CHUNKS.map((chunk) => (
                    <div
                      key={chunk.id}
                      className={`rounded-lg border p-2.5 text-xs transition-all duration-200 ${
                        highlightedChunk === chunk.id
                          ? "border-orange-300 bg-orange-50 shadow-sm dark:border-orange-700 dark:bg-orange-950/50"
                          : "bg-muted/20 hover:bg-muted/40"
                      }`}
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className="font-semibold">{chunk.title}</span>
                        <div className="flex items-center gap-1">
                          <Badge
                            variant="outline"
                            className={`px-1.5 py-0 text-xs ${
                              highlightedChunk === chunk.id
                                ? "border-orange-300 text-orange-600 dark:border-orange-600 dark:text-orange-400"
                                : ""
                            }`}
                          >
                            [{chunk.id}]
                          </Badge>
                          <span className="text-muted-foreground">
                            p.{chunk.page}
                          </span>
                        </div>
                      </div>
                      <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                        {chunk.snippet}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <button className="text-muted-foreground hover:bg-muted/30 flex w-full items-center justify-center gap-2 rounded-md border border-dashed py-2 text-xs transition-colors">
                <Upload className="h-3.5 w-3.5" />
                Upload another document
              </button>
            </div>

            <Separator orientation="vertical" className="h-auto" />

            {/* Right: Chat */}
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <ScrollArea
                className="h-125 rounded-md border p-4"
                ref={scrollRef}
              >
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
                      <div
                        className={`max-w-5/6 rounded-lg px-3 py-2 text-sm ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {msg.role === "assistant"
                          ? renderContentWithCitations(
                              msg.content,
                              msg.citations
                            )
                          : msg.content}
                      </div>
                      {msg.role === "user" && (
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="text-xs">
                            You
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-orange-100 text-xs text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                          AI
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Searching document...
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "What was Q4 revenue?",
                    "What are the risks?",
                    "Q1 2026 forecast?",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => setInput(q)}
                      className="hover:bg-muted rounded-full border px-2.5 py-1 text-xs transition-colors"
                    >
                      {q}
                    </button>
                  ))}
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
                    placeholder="Ask a question about the document..."
                    disabled={isLoading}
                  />
                  <Button type="submit" disabled={isLoading || !input.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
                <p className="text-muted-foreground text-sm">
                  Hover over citation badges [1] to highlight the source chunk.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
