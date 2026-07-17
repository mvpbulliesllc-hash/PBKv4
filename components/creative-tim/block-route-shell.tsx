import Link from "next/link"

export function BlockRouteShell({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Matrix ENV / block lab</p>
          <h1 className="text-sm font-semibold">{title}</h1>
        </div>
        <Link className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline" href="/blocks">
          All blocks
        </Link>
      </header>
      {children}
    </main>
  )
}
