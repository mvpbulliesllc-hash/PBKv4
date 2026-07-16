"use client"

import * as React from "react"
import {
  ArrowUp,
  File,
  FileImage,
  FileText,
  Paperclip,
  Sparkles,
  Upload,
  X,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AttachedFile {
  id: string
  name: string
  type: "pdf" | "image" | "doc" | "other"
  size: string
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  attachments?: AttachedFile[]
}

const MOCK_FILES: AttachedFile[] = [
  { id: "f1", name: "Q4_Report.pdf", type: "pdf", size: "2.4 MB" },
  { id: "f2", name: "dashboard_screenshot.png", type: "image", size: "840 KB" },
  { id: "f3", name: "requirements.docx", type: "doc", size: "156 KB" },
]

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Hello! Attach files with the paperclip or drop them anywhere in the chat. I can analyze PDFs, images, and documents.",
  },
]

const ASSISTANT_RESPONSES: Record<string, string> = {
  pdf: 'I\'ve analyzed "Q4_Report.pdf". The document shows a 23% revenue increase in Q4 compared to Q3, with strong performance in the enterprise segment. Key risks identified on page 4. Would you like a detailed summary?',
  image:
    'Looking at "dashboard_screenshot.png", I can see a metrics dashboard with 3 KPI cards. The conversion rate is highlighted in green (4.2%), suggesting above-target performance. Want me to extract specific data points?',
  doc: 'I\'ve reviewed "requirements.docx". It contains 12 functional requirements and 4 non-functional requirements. I noticed 2 potentially conflicting requirements on pages 2 and 5. Should I detail the conflicts?',
}

function FileTypeIcon({ type }: { type: AttachedFile["type"] }) {
  if (type === "pdf")
    return <FileText className="h-4 w-4 text-red-500 dark:text-red-400" />
  if (type === "image")
    return <FileImage className="h-4 w-4 text-blue-500 dark:text-blue-400" />
  return <File className="text-muted-foreground h-4 w-4" />
}

function FileCard({
  file,
  onRemove,
}: {
  file: AttachedFile
  onRemove?: (id: string) => void
}) {
  return (
    <div className="bg-background animate-in fade-in-0 zoom-in-95 flex items-center gap-2.5 rounded-lg border py-1.5 pr-2 pl-1.5 duration-200">
      <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
        <FileTypeIcon type={file.type} />
      </div>
      <div className="min-w-0">
        <p className="max-w-40 truncate text-sm font-medium">{file.name}</p>
        <p className="text-muted-foreground font-mono text-xs">{file.size}</p>
      </div>
      {onRemove && (
        <button
          onClick={() => onRemove(file.id)}
          className="text-muted-foreground hover:text-foreground ml-1 shrink-0 rounded-sm"
          aria-label={`Remove ${file.name}`}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

export default function AiFileAttachment01() {
  const [messages, setMessages] = React.useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = React.useState("")
  const [attachedFiles, setAttachedFiles] = React.useState<AttachedFile[]>([])
  const [isDragging, setIsDragging] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    // The ScrollArea ref points to the Radix root; the viewport is the
    // element that actually scrolls
    const viewport = scrollRef.current?.querySelector(
      "[data-slot='scroll-area-viewport']"
    )
    viewport?.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" })
  }, [messages, isLoading])

  const handleAttachMock = () => {
    const available = MOCK_FILES.filter(
      (f) => !attachedFiles.find((a) => a.id === f.id)
    )
    if (available.length > 0) {
      setAttachedFiles((prev) => [...prev, available[0]])
    }
  }

  const removeFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const handleSend = async () => {
    if (!input.trim() && attachedFiles.length === 0) return
    if (isLoading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim() || "Here are the attached files.",
      attachments: attachedFiles.length > 0 ? [...attachedFiles] : undefined,
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    const sentFiles = [...attachedFiles]
    setAttachedFiles([])
    setIsLoading(true)

    await new Promise((r) => setTimeout(r, 1200))

    const responseKey = sentFiles[0]?.type ?? "other"
    const responseText =
      ASSISTANT_RESPONSES[responseKey] ??
      "I've received your message. How can I help you further with this?"

    setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseText,
      },
    ])
    setIsLoading(false)
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Chat with attachments</CardTitle>
          <CardDescription>
            Attach PDFs, images, and documents for the assistant to analyze.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="relative"
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragging(false)
              handleAttachMock()
            }}
          >
            <ScrollArea className="h-95 pr-3" ref={scrollRef}>
              <div className="space-y-5 py-1">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`animate-in fade-in-0 slide-in-from-bottom-2 flex gap-3 duration-300 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarFallback className="bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
                          <Sparkles className="h-3.5 w-3.5" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-4/5 space-y-1.5 ${msg.role === "user" ? "items-end" : ""}`}
                    >
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {msg.attachments.map((f) => (
                            <FileCard key={f.id} file={f} />
                          ))}
                        </div>
                      )}
                      <div
                        className={`rounded-lg px-3.5 py-2.5 text-sm ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="animate-in fade-in-0 slide-in-from-bottom-2 flex gap-3 duration-300">
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className="bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
                        <Sparkles className="h-3.5 w-3.5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted flex items-center gap-1 rounded-lg px-3.5 py-3.5">
                      <span className="bg-muted-foreground/60 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:-300ms]" />
                      <span className="bg-muted-foreground/60 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:-150ms]" />
                      <span className="bg-muted-foreground/60 h-1.5 w-1.5 animate-bounce rounded-full" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Composer */}
            <div className="focus-within:ring-ring/50 mt-3 rounded-xl border transition-shadow duration-200 focus-within:ring-1">
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 border-b p-2">
                  {attachedFiles.map((f) => (
                    <FileCard key={f.id} file={f} onRemove={removeFile} />
                  ))}
                </div>
              )}
              <div className="flex items-center gap-1 p-1.5">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 shrink-0"
                  onClick={handleAttachMock}
                  title="Attach file"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your files..."
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && handleSend()
                  }
                  disabled={isLoading}
                  className="flex-1 border-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
                />
                <Button
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-lg"
                  onClick={handleSend}
                  disabled={
                    isLoading || (!input.trim() && attachedFiles.length === 0)
                  }
                  aria-label="Send message"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Drag overlay */}
            {isDragging && (
              <div className="bg-background/80 animate-in fade-in-0 absolute inset-0 z-10 flex items-center justify-center rounded-xl border-2 border-dashed border-orange-500/50 backdrop-blur-sm duration-150">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">
                    <Upload className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <p className="text-sm font-medium">Drop files to attach</p>
                  <p className="text-muted-foreground mt-0.5 text-sm">
                    PDF, PNG, and DOCX up to 10 MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
