"use client"

import * as React from "react"
import { Bot, CornerDownLeft, FileText, Sparkles, Wand2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const PROMPTS = [
  "Summarize this report",
  "Draft a launch email",
  "Create a checklist",
  "Generate meeting notes",
]

const HISTORY = [
  {
    title: "Q1 roadmap summary",
    time: "2 hours ago",
  },
  {
    title: "Billing FAQ draft",
    time: "Yesterday",
  },
  {
    title: "Support macros",
    time: "2 days ago",
  },
]

export default function AIAssistantPanel() {
  const [input, setInput] = React.useState("")
  const [history, setHistory] = React.useState(HISTORY)
  const [output, setOutput] = React.useState(
    "Create a concise executive summary highlighting usage growth, key wins, and next actions."
  )
  const [copied, setCopied] = React.useState(false)
  const [isGenerating, setIsGenerating] = React.useState(false)

  const suggestions = [
    "Draft a concise summary for leadership.",
    "Turn this into a checklist with 5 steps.",
    "Write a short announcement for the team.",
  ]

  const handleSubmit = () => {
    if (!input.trim()) return
    setIsGenerating(true)
    const nextOutput = `Draft:\n${input.trim()}\n\nKey points:\n• Highlight the primary outcomes.\n• Call out the next action.\n• Keep it under 150 words.`
    setOutput(nextOutput)
    setHistory((prev) => [{ title: input.trim(), time: "Just now" }, ...prev])
    setInput("")
    setTimeout(() => setIsGenerating(false), 500)
  }

  const handleRegenerate = () => {
    const next = suggestions[Math.floor(Math.random() * suggestions.length)]
    setOutput(next)
  }

  const handleInsert = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div className="mx-auto flex max-w-5xl items-center justify-center p-6">
      <Card className="bg-card border p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              AI Assistant Panel
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              A contextual side panel with prompts, history, and insert actions.
            </p>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button>
                <Bot className="mr-2 h-4 w-4" />
                Open Assistant
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Creative AI Assistant
                </SheetTitle>
                <SheetDescription>
                  Generate drafts, summaries, and action items.
                </SheetDescription>
              </SheetHeader>

              <div className="mt-4 space-y-4">
                <div className="bg-muted/40 rounded-lg border p-3">
                  <p className="text-sm font-semibold">Suggested prompts</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {PROMPTS.map((prompt) => (
                      <Button
                        key={prompt}
                        variant="outline"
                        size="sm"
                        onClick={() => setInput(prompt)}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">History</p>
                    <Badge variant="secondary">{history.length}</Badge>
                  </div>
                  <ScrollArea className="bg-background mt-3 h-36 rounded-lg border p-3">
                    <div className="space-y-3">
                      {history.map((item) => (
                        <div
                          key={item.title}
                          className="flex items-center gap-3"
                        >
                          <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.title}</p>
                            <p className="text-muted-foreground text-xs">
                              {item.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div className="bg-background rounded-lg border p-3">
                  <div className="flex items-start gap-2">
                    <Sparkles className="text-primary mt-1 h-4 w-4" />
                    <div>
                      <p className="text-sm font-semibold">Draft output</p>
                      <p className="text-muted-foreground text-xs">
                        AI responses will appear here for quick review.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <p className="text-sm whitespace-pre-line">{output}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleRegenerate}
                      >
                        <Wand2 className="mr-2 h-4 w-4" />
                        Regenerate
                      </Button>
                      <Button size="sm" onClick={handleInsert}>
                        {copied ? "Copied" : "Insert into doc"}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-background flex items-center gap-2 rounded-lg border p-2">
                  <Input
                    placeholder="Ask the assistant..."
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    className="border-0 focus-visible:ring-0"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault()
                        handleSubmit()
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    onClick={handleSubmit}
                    disabled={isGenerating}
                  >
                    <CornerDownLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Card>
    </div>
  )
}
