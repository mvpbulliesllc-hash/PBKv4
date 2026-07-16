"use client"

import * as React from "react"
import { Check, Copy, FileCode2, Loader2, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
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
import { Textarea } from "@/components/ui/textarea"

interface DiffLine {
  type: "context" | "added" | "removed" | "hunk"
  old?: number
  new?: number
  content: string
}

const EXAMPLES: Record<string, { file: string; lines: DiffLine[] }> = {
  typescript: {
    file: "lib/fetch-user.ts",
    lines: [
      { type: "hunk", content: "@@ -1,6 +1,9 @@" },
      { type: "removed", old: 1, content: "function fetchUser(id) {" },
      {
        type: "added",
        new: 1,
        content: "async function fetchUser(id: string): Promise<User> {",
      },
      {
        type: "removed",
        old: 2,
        content: "  return fetch('/api/user/' + id)",
      },
      { type: "removed", old: 3, content: "    .then(res => res.json())" },
      { type: "removed", old: 4, content: "    .then(data => data)" },
      {
        type: "removed",
        old: 5,
        content: "    .catch(err => console.log(err))",
      },
      { type: "added", new: 2, content: "  try {" },
      {
        type: "added",
        new: 3,
        content: "    const res = await fetch(`/api/user/${id}`)",
      },
      {
        type: "added",
        new: 4,
        content: "    if (!res.ok) throw new Error(`HTTP ${res.status}`)",
      },
      {
        type: "added",
        new: 5,
        content: "    return (await res.json()) as User",
      },
      { type: "added", new: 6, content: "  } catch (err) {" },
      {
        type: "added",
        new: 7,
        content: "    throw new Error(`Failed to fetch user: ${err}`)",
      },
      { type: "added", new: 8, content: "  }" },
      { type: "context", old: 6, new: 9, content: "}" },
    ],
  },
  python: {
    file: "utils/totals.py",
    lines: [
      { type: "hunk", content: "@@ -1,5 +1,3 @@" },
      { type: "removed", old: 1, content: "def calculate_total(items):" },
      {
        type: "added",
        new: 1,
        content: "def calculate_total(items: list[dict]) -> float:",
      },
      { type: "removed", old: 2, content: "  total = 0" },
      { type: "removed", old: 3, content: "  for item in items:" },
      {
        type: "removed",
        old: 4,
        content: "    total = total + item['price']",
      },
      { type: "removed", old: 5, content: "  return total" },
      {
        type: "added",
        new: 2,
        content: '  """Calculate total price with type safety."""',
      },
      {
        type: "added",
        new: 3,
        content: "  return sum(item.get('price', 0.0) for item in items)",
      },
    ],
  },
  go: {
    file: "pkg/math/divide.go",
    lines: [
      { type: "hunk", content: "@@ -1,3 +1,6 @@" },
      { type: "removed", old: 1, content: "func divide(a, b int) int {" },
      {
        type: "added",
        new: 1,
        content: "func divide(a, b int) (int, error) {",
      },
      { type: "removed", old: 2, content: "  return a / b" },
      { type: "added", new: 2, content: "  if b == 0 {" },
      {
        type: "added",
        new: 3,
        content: '    return 0, errors.New("division by zero")',
      },
      { type: "added", new: 4, content: "  }" },
      { type: "added", new: 5, content: "  return a / b, nil" },
      { type: "context", old: 3, new: 6, content: "}" },
    ],
  },
  rust: {
    file: "src/parse.rs",
    lines: [
      { type: "hunk", content: "@@ -1,3 +1,3 @@" },
      {
        type: "removed",
        old: 1,
        content: "fn parse_number(s: &str) -> i32 {",
      },
      {
        type: "added",
        new: 1,
        content: "fn parse_number(s: &str) -> Result<i32, ParseIntError> {",
      },
      { type: "removed", old: 2, content: "  s.parse().unwrap()" },
      { type: "added", new: 2, content: "  s.trim().parse::<i32>()" },
      { type: "context", old: 3, new: 3, content: "}" },
    ],
  },
}

function DiffWindow({ file, lines }: { file: string; lines: DiffLine[] }) {
  const [copied, setCopied] = React.useState(false)
  const [applied, setApplied] = React.useState(false)

  const added = lines.filter((l) => l.type === "added").length
  const removed = lines.filter((l) => l.type === "removed").length

  const handleCopy = () => {
    const code = lines
      .filter((l) => l.type === "added" || l.type === "context")
      .map((l) => l.content)
      .join("\n")
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-2 overflow-hidden rounded-lg border duration-300">
      <div className="bg-muted/50 flex items-center gap-3 border-b px-3 py-2">
        <FileCode2 className="text-muted-foreground h-4 w-4 shrink-0" />
        <span className="truncate font-mono text-xs">{file}</span>
        <span className="ml-auto flex shrink-0 items-center gap-2 font-mono text-xs">
          <span className="text-emerald-600 dark:text-emerald-400">
            +{added}
          </span>
          <span className="text-red-600 dark:text-red-400">−{removed}</span>
        </span>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={handleCopy}
            title="Copy result"
          >
            {copied ? (
              <Check className="animate-in zoom-in-50 h-3.5 w-3.5 text-emerald-600 duration-200 dark:text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            size="sm"
            variant={applied ? "outline" : "default"}
            className="h-7 px-2.5"
            onClick={() => setApplied(true)}
            disabled={applied}
          >
            {applied ? (
              <>
                <Check className="animate-in zoom-in-50 mr-1 h-3.5 w-3.5 duration-200" />
                Applied
              </>
            ) : (
              "Apply"
            )}
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full font-mono text-xs">
          <tbody>
            {lines.map((line, i) =>
              line.type === "hunk" ? (
                <tr key={i} className="bg-muted/50">
                  <td
                    colSpan={4}
                    className="text-muted-foreground px-3 py-1 select-none"
                  >
                    {line.content}
                  </td>
                </tr>
              ) : (
                <tr
                  key={i}
                  className={
                    line.type === "added"
                      ? "bg-emerald-500/10"
                      : line.type === "removed"
                        ? "bg-red-500/10"
                        : undefined
                  }
                >
                  <td className="text-muted-foreground/50 w-10 px-2 py-0.5 text-right select-none">
                    {line.old ?? ""}
                  </td>
                  <td className="text-muted-foreground/50 w-10 px-2 py-0.5 text-right select-none">
                    {line.new ?? ""}
                  </td>
                  <td
                    className={`w-6 py-0.5 text-center select-none ${
                      line.type === "added"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : line.type === "removed"
                          ? "text-red-600 dark:text-red-400"
                          : "text-muted-foreground/50"
                    }`}
                  >
                    {line.type === "added"
                      ? "+"
                      : line.type === "removed"
                        ? "−"
                        : ""}
                  </td>
                  <td className="py-0.5 pr-3 whitespace-pre">{line.content}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function AiCodeAssistant01() {
  const [language, setLanguage] = React.useState("typescript")
  const [prompt, setPrompt] = React.useState(
    "Refactor this function to use async/await with proper error handling and type safety."
  )
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [showDiff, setShowDiff] = React.useState(false)

  const handleGenerate = async () => {
    setIsGenerating(true)
    setShowDiff(false)
    await new Promise((r) => setTimeout(r, 1500))
    setIsGenerating(false)
    setShowDiff(true)
  }

  const example = EXAMPLES[language] ?? EXAMPLES.typescript

  return (
    <div className="container mx-auto py-8">
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle>Code assistant</CardTitle>
          <CardDescription>
            Describe a change and review the generated diff before applying.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code-assistant-prompt">Prompt</Label>
            <Textarea
              id="code-assistant-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to do with the code..."
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <Select
              value={language}
              onValueChange={(v) => {
                setLanguage(v)
                setShowDiff(false)
              }}
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="go">Go</SelectItem>
                <SelectItem value="rust">Rust</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="ml-auto"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate diff
                </>
              )}
            </Button>
          </div>

          {showDiff ? (
            <DiffWindow
              key={language}
              file={example.file}
              lines={example.lines}
            />
          ) : (
            <div className="flex items-center justify-center rounded-lg border border-dashed py-14">
              <div
                key={isGenerating ? "generating" : "empty"}
                className="animate-in fade-in-0 text-center duration-300"
              >
                {isGenerating ? (
                  <Loader2 className="text-muted-foreground mx-auto mb-2 h-5 w-5 animate-spin" />
                ) : (
                  <FileCode2 className="text-muted-foreground/60 mx-auto mb-2 h-5 w-5" />
                )}
                <p className="text-muted-foreground text-sm">
                  {isGenerating
                    ? "Generating diff..."
                    : "The generated diff will appear here"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
