"use client"

import * as React from "react"
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Circle,
  ListChecks,
  Loader2,
  Play,
  RotateCcw,
  ShieldCheck,
  Zap,
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
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"

type Phase = "idle" | "planning" | "executing" | "verifying" | "done"
type StepStatus = "pending" | "running" | "done"

interface PlanStep {
  id: number
  label: string
  detail: string
  status: StepStatus
  duration: string
}

const PLAN_STEPS: Omit<PlanStep, "status">[] = [
  {
    id: 1,
    label: "Gather requirements",
    detail: "analyze task scope and identify dependencies",
    duration: "0.7s",
  },
  {
    id: 2,
    label: "Research context",
    detail: "search knowledge base and external sources",
    duration: "1.2s",
  },
  {
    id: 3,
    label: "Draft solution",
    detail: "generate initial implementation plan",
    duration: "0.8s",
  },
  {
    id: 4,
    label: "Execute steps",
    detail: "run sub-tasks in parallel where possible",
    duration: "1.4s",
  },
  {
    id: 5,
    label: "Verify output",
    detail: "cross-check results against acceptance criteria",
    duration: "0.6s",
  },
]

const VERIFY_RESULTS = [
  { label: "Accuracy", passed: true, score: "98%" },
  { label: "Completeness", passed: true, score: "100%" },
  { label: "Safety check", passed: true, score: "Pass" },
  { label: "Edge cases covered", passed: false, score: "82%" },
]

const PHASES = [
  {
    key: "planning",
    label: "Plan",
    description: "Break the task into ordered steps",
    icon: ListChecks,
    duration: "1.8s",
  },
  {
    key: "executing",
    label: "Execute",
    description: "Run each step and track progress",
    icon: Zap,
    duration: "4.7s",
  },
  {
    key: "verifying",
    label: "Verify",
    description: "Check results against acceptance criteria",
    icon: ShieldCheck,
    duration: "2.0s",
  },
] as const

const PHASE_ORDER: Phase[] = [
  "idle",
  "planning",
  "executing",
  "verifying",
  "done",
]

export default function AiMultiStepAgent01() {
  const [task, setTask] = React.useState(
    "Analyze our Q4 sales data and generate a comprehensive report with actionable insights"
  )
  const [phase, setPhase] = React.useState<Phase>("idle")
  const [steps, setSteps] = React.useState<PlanStep[]>(
    PLAN_STEPS.map((s) => ({ ...s, status: "pending" }))
  )
  const [planRevealed, setPlanRevealed] = React.useState(0)
  const [progress, setProgress] = React.useState(0)

  const reset = () => {
    setPhase("idle")
    setSteps(PLAN_STEPS.map((s) => ({ ...s, status: "pending" })))
    setPlanRevealed(0)
    setProgress(0)
  }

  const runAgent = async () => {
    reset()
    await new Promise((r) => setTimeout(r, 50))

    // Phase 1: Planning — reveal plan steps one by one
    setPhase("planning")
    for (let i = 1; i <= PLAN_STEPS.length; i++) {
      await new Promise((r) => setTimeout(r, 320))
      setPlanRevealed(i)
    }

    // Phase 2: Executing
    setPhase("executing")
    for (let i = 0; i < PLAN_STEPS.length; i++) {
      setSteps((prev) =>
        prev.map((s) => (s.id === i + 1 ? { ...s, status: "running" } : s))
      )
      setProgress(Math.round(((i + 0.5) / PLAN_STEPS.length) * 100))
      await new Promise((r) => setTimeout(r, 900))
      setSteps((prev) =>
        prev.map((s) => (s.id === i + 1 ? { ...s, status: "done" } : s))
      )
      setProgress(Math.round(((i + 1) / PLAN_STEPS.length) * 100))
    }

    // Phase 3: Verifying
    setPhase("verifying")
    await new Promise((r) => setTimeout(r, 2000))

    setPhase("done")
  }

  const phaseStatus = (key: (typeof PHASES)[number]["key"]) => {
    const current = PHASE_ORDER.indexOf(phase)
    const target = PHASE_ORDER.indexOf(key)
    if (current > target) return "done"
    if (current === target) return "active"
    return "pending"
  }

  const isRunning = phase !== "idle" && phase !== "done"
  const doneCount = steps.filter((s) => s.status === "done").length

  return (
    <div className="container mx-auto py-8">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Multi-step agent</CardTitle>
          <CardDescription>
            Plans, executes, and verifies each task before reporting back.
          </CardDescription>
          <CardAction>
            {isRunning && (
              <Badge variant="outline" className="gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500" />
                Running
              </Badge>
            )}
            {phase === "done" && (
              <Badge variant="outline" className="gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Complete
              </Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Task input */}
          <div className="flex gap-2">
            <Input
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Describe the task for the agent..."
              disabled={phase !== "idle"}
            />
            {phase === "idle" ? (
              <Button onClick={runAgent} disabled={!task.trim()}>
                <Play className="mr-1.5 h-4 w-4" />
                Run
              </Button>
            ) : phase === "done" ? (
              <Button variant="outline" onClick={reset}>
                <RotateCcw className="mr-1.5 h-4 w-4" />
                Reset
              </Button>
            ) : (
              <Button disabled variant="outline">
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Running
              </Button>
            )}
          </div>

          {/* Phase timeline */}
          {phase !== "idle" && (
            <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
              {PHASES.map((p, i) => {
                const status = phaseStatus(p.key)
                const Icon = p.icon
                return (
                  <div
                    key={p.key}
                    className="relative flex gap-4 pb-7 last:pb-0"
                  >
                    {i < PHASES.length - 1 && (
                      <div className="bg-border absolute top-8 bottom-0 left-3.5 w-px" />
                    )}

                    {/* Node */}
                    <div
                      className={`bg-background relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
                        status === "active"
                          ? "border-orange-500/50 text-orange-600 dark:text-orange-400"
                          : status === "done"
                            ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                            : "text-muted-foreground/50"
                      }`}
                    >
                      {status === "done" ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Icon className="h-3.5 w-3.5" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1 pt-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium transition-colors duration-300 ${
                            status === "pending" ? "text-muted-foreground" : ""
                          }`}
                        >
                          {p.label}
                        </span>
                        {status === "active" && (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-orange-500" />
                        )}
                        <span className="text-muted-foreground ml-auto font-mono text-xs">
                          {status === "done"
                            ? p.duration
                            : p.key === "executing" && status === "active"
                              ? `${doneCount}/${PLAN_STEPS.length}`
                              : ""}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-0.5 text-sm">
                        {p.description}
                      </p>

                      {/* Plan: numbered steps reveal one by one */}
                      {p.key === "planning" && status !== "pending" && (
                        <ol className="mt-3 space-y-2">
                          {PLAN_STEPS.slice(
                            0,
                            status === "done" ? PLAN_STEPS.length : planRevealed
                          ).map((s, idx) => (
                            <li
                              key={s.id}
                              className="animate-in fade-in-0 slide-in-from-bottom-1 flex items-baseline gap-3 text-sm duration-300"
                            >
                              <span className="text-muted-foreground/60 font-mono text-xs">
                                0{idx + 1}
                              </span>
                              <span className="min-w-0">
                                <span className="font-medium">{s.label},</span>{" "}
                                <span className="text-muted-foreground">
                                  {s.detail}
                                </span>
                              </span>
                            </li>
                          ))}
                        </ol>
                      )}

                      {/* Execute: steps tick off with durations */}
                      {p.key === "executing" && status !== "pending" && (
                        <div className="animate-in fade-in-0 slide-in-from-bottom-1 mt-3 space-y-2.5 duration-300">
                          <Progress value={progress} className="h-1" />
                          {steps.map((step) => (
                            <div
                              key={step.id}
                              className="flex items-center gap-2.5 text-sm"
                            >
                              {step.status === "done" ? (
                                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                              ) : step.status === "running" ? (
                                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-orange-500" />
                              ) : (
                                <Circle className="text-muted-foreground/40 h-3.5 w-3.5 shrink-0" />
                              )}
                              <span
                                className={`transition-colors duration-300 ${
                                  step.status === "pending"
                                    ? "text-muted-foreground"
                                    : ""
                                }`}
                              >
                                {step.label}
                              </span>
                              {step.status === "done" && (
                                <span className="text-muted-foreground/60 animate-in fade-in-0 ml-auto font-mono text-xs duration-300">
                                  {step.duration}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Verify: check results */}
                      {p.key === "verifying" && status === "done" && (
                        <div className="animate-in fade-in-0 slide-in-from-bottom-1 mt-3 divide-y rounded-lg border duration-300">
                          {VERIFY_RESULTS.map((r) => (
                            <div
                              key={r.label}
                              className="flex items-center justify-between px-3 py-2 text-sm"
                            >
                              <span className="flex items-center gap-2">
                                {r.passed ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                )}
                                {r.label}
                              </span>
                              <span className="text-muted-foreground font-mono text-xs">
                                {r.score}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Final summary */}
          {phase === "done" && (
            <div className="bg-muted/50 animate-in fade-in-0 slide-in-from-bottom-2 rounded-lg border p-4 duration-300">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Run complete
                <span className="text-muted-foreground ml-auto font-mono text-xs">
                  8.5s total
                </span>
              </div>
              <p className="text-muted-foreground mt-1.5 text-sm">
                All 5 steps executed. Report generated with 3 actionable
                insights, 2 trend analyses, and 1 risk flag. Ready for review.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
