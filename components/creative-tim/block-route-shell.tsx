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

export function LockedBlock({ name }: { name: string }) {
  return (
    <BlockRouteShell title={name}>
      <section className="mx-auto flex min-h-[70vh] max-w-2xl items-center px-6">
        <div className="w-full rounded-xl border bg-card p-8 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">Creative Tim Pro access required</p>
          <h2 className="mt-3 text-2xl font-semibold">Protected registry block</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            This route is wired and intentionally honest: the registry returned 401, so AY.0 did not fabricate or copy a substitute. Add a newly rotated Creative Tim credential server-side, then rerun the block installer.
          </p>
        </div>
      </section>
    </BlockRouteShell>
  )
}
