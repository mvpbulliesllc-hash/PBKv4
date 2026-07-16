"use client"

import * as React from "react"
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Circle,
  Cpu,
  Loader2,
  Play,
  RotateCcw,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type NodeStatus = "idle" | "running" | "done" | "error"

interface AgentNode {
  id: string
  name: string
  role: string
  status: NodeStatus
  lastAction: string
  tokens: number
}

const INITIAL_NODES: AgentNode[] = [
  {
    id: "research",
    name: "Research Agent",
    role: "Data gathering",
    status: "idle",
    lastAction: "Waiting for task",
    tokens: 0,
  },
  {
    id: "summarizer",
    name: "Summarizer",
    role: "Content compression",
    status: "idle",
    lastAction: "Waiting for input",
    tokens: 0,
  },
  {
    id: "fact-checker",
    name: "Fact Checker",
    role: "Verification",
    status: "idle",
    lastAction: "Waiting for draft",
    tokens: 0,
  },
  {
    id: "writer",
    name: "Writer",
    role: "Content creation",
    status: "idle",
    lastAction: "Waiting for facts",
    tokens: 0,
  },
  {
    id: "editor",
    name: "Editor",
    role: "Quality review",
    status: "idle",
    lastAction: "Waiting for draft",
    tokens: 0,
  },
  {
    id: "publisher",
    name: "Publisher",
    role: "Delivery",
    status: "idle",
    lastAction: "Waiting for approval",
    tokens: 0,
  },
]

const NODE_ACTIONS: Record<string, string[]> = {
  research: [
    "Querying knowledge base...",
    "Found 12 relevant sources",
    "Extracted key data points",
  ],
  summarizer: [
    "Processing 3,400 tokens...",
    "Condensing to key points",
    "Summary ready (420 tokens)",
  ],
  "fact-checker": [
    "Verifying 8 claims...",
    "Cross-referencing sources",
    "All claims verified ✓",
  ],
  writer: [
    "Drafting article outline...",
    "Writing introduction",
    "Draft complete (1,200 words)",
  ],
  editor: [
    "Checking grammar and tone...",
    "Improving readability",
    "Approved with minor edits",
  ],
  publisher: [
    "Formatting for delivery...",
    "Applying metadata",
    "Published successfully",
  ],
}

const STATUS_CONFIG: Record<
  NodeStatus,
  {
    badge: string
    icon: React.ComponentType<{ className?: string }>
    label: string
  }
> = {
  idle: {
    badge: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    icon: Circle,
    label: "Idle",
  },
  running: {
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    icon: Loader2,
    label: "Running",
  },
  done: {
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
    icon: CheckCircle2,
    label: "Done",
  },
  error: {
    badge: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    icon: AlertCircle,
    label: "Error",
  },
}

export default function AiWorkflowStatus01() {
  const [nodes, setNodes] = React.useState<AgentNode[]>(INITIAL_NODES)
  const [isRunning, setIsRunning] = React.useState(false)
  const [isDone, setIsDone] = React.useState(false)

  const reset = () => {
    setNodes(INITIAL_NODES)
    setIsRunning(false)
    setIsDone(false)
  }

  const startWorkflow = async () => {
    setIsRunning(true)
    setIsDone(false)
    setNodes(INITIAL_NODES)

    for (let i = 0; i < INITIAL_NODES.length; i++) {
      const node = INITIAL_NODES[i]
      const actions = NODE_ACTIONS[node.id] ?? ["Processing...", "Done"]

      // Set to running
      setNodes((prev) =>
        prev.map((n, idx) =>
          idx === i ? { ...n, status: "running", lastAction: actions[0] } : n
        )
      )

      // Step through actions
      for (let a = 1; a < actions.length; a++) {
        await new Promise((r) => setTimeout(r, 600))
        setNodes((prev) =>
          prev.map((n, idx) =>
            idx === i
              ? {
                  ...n,
                  lastAction: actions[a],
                  tokens: Math.round(Math.random() * 800 + 200),
                }
              : n
          )
        )
      }

      await new Promise((r) => setTimeout(r, 400))

      // Set to done
      setNodes((prev) =>
        prev.map((n, idx) =>
          idx === i
            ? {
                ...n,
                status: "done",
                tokens: Math.round(Math.random() * 1200 + 300),
              }
            : n
        )
      )

      await new Promise((r) => setTimeout(r, 200))
    }

    setIsRunning(false)
    setIsDone(true)
  }

  const totalTokens = nodes.reduce((s, n) => s + n.tokens, 0)
  const doneCount = nodes.filter((n) => n.status === "done").length

  return (
    <div className="container mx-auto py-8">
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-orange-500" />
              Multi-Agent Workflow Pipeline
            </CardTitle>
            <div className="flex items-center gap-2">
              {totalTokens > 0 && (
                <Badge variant="outline" className="text-xs">
                  {totalTokens.toLocaleString()} tokens
                </Badge>
              )}
              {isDone ? (
                <Button size="sm" variant="outline" onClick={reset}>
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Reset
                </Button>
              ) : (
                <Button size="sm" onClick={startWorkflow} disabled={isRunning}>
                  {isRunning ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Running ({doneCount}/{nodes.length})
                    </>
                  ) : (
                    <>
                      <Play className="mr-1.5 h-3.5 w-3.5" />
                      Start Workflow
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Pipeline */}
          <div className="flex flex-wrap items-center gap-2">
            {nodes.map((node, i) => {
              const config = STATUS_CONFIG[node.status]
              const StatusIcon = config.icon

              return (
                <React.Fragment key={node.id}>
                  <div
                    className={`min-w-35 flex-1 rounded-xl border p-3 transition-all duration-300 ${
                      node.status === "running"
                        ? "border-amber-300 shadow-md shadow-amber-100 dark:border-amber-700 dark:shadow-amber-950/50"
                        : node.status === "done"
                          ? "border-emerald-200 dark:border-emerald-800"
                          : "border-border"
                    }`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {node.name}
                        </p>
                        <p className="text-muted-foreground truncate text-sm">
                          {node.role}
                        </p>
                      </div>
                      <Badge className={`shrink-0 text-xs ${config.badge}`}>
                        <StatusIcon
                          className={`mr-1 h-3 w-3 ${node.status === "running" ? "animate-spin" : ""}`}
                        />
                        {config.label}
                      </Badge>
                    </div>

                    <p
                      className={`text-sm leading-tight ${
                        node.status === "running"
                          ? "text-amber-700 dark:text-amber-300"
                          : "text-muted-foreground"
                      }`}
                    >
                      {node.lastAction}
                    </p>

                    {node.tokens > 0 && (
                      <p className="text-muted-foreground mt-1.5 text-xs">
                        {node.tokens.toLocaleString()} tokens
                      </p>
                    )}

                    {/* Running animation bar */}
                    {node.status === "running" && (
                      <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-amber-100 dark:bg-amber-900">
                        <div className="h-full w-1/2 animate-[shimmer_1s_ease-in-out_infinite] rounded-full bg-amber-400" />
                      </div>
                    )}
                    {node.status === "done" && (
                      <div className="mt-2 h-0.5 rounded-full bg-emerald-400" />
                    )}
                  </div>

                  {i < nodes.length - 1 && (
                    <ChevronRight
                      className={`h-5 w-5 shrink-0 transition-colors ${
                        nodes[i].status === "done"
                          ? "text-emerald-500"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  )}
                </React.Fragment>
              )
            })}
          </div>

          {/* Summary */}
          {isDone && (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm dark:border-emerald-800 dark:bg-emerald-950/30">
              <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                Workflow completed successfully
              </p>
              <p className="text-muted-foreground mt-0.5 text-sm">
                6 agents ran in sequence &bull; {totalTokens.toLocaleString()}{" "}
                total tokens &bull; ~18s wall time
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
