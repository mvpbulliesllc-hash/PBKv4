import Link from "next/link"

const blocks = [
  ["ai-workflow-status-01", "installed"],
  ["ai-assistant-panel", "credential required"],
  ["ai-chat-streaming-01", "credential required"],
  ["ai-multi-step-agent-01", "installed"],
  ["ai-image-generator-01", "installed"],
  ["ai-video-generator-01", "installed"],
  ["ai-audio-generator-01", "installed"],
  ["ai-audio-generator-02", "installed"],
  ["ai-code-assistant-01", "installed"],
  ["ai-file-attachment-01", "installed"],
  ["ai-voice-transcription-01", "installed"],
  ["ai-tool-use-01", "installed"],
  ["ai-document-qa-01", "installed"],
] as const

export default function BlocksIndexPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Matrix ENV</p>
        <h1 className="mt-2 text-3xl font-semibold">Creative Tim AI block lab</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Isolated routes for validating backend-machine interfaces without changing a pixel of the operations dashboard.</p>
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {blocks.map(([name, status]) => (
            <Link key={name} href={`/blocks/${name}`} className="flex items-center justify-between rounded-lg border bg-card px-4 py-4 transition-colors hover:bg-accent">
              <span className="font-medium">{name}</span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{status}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
