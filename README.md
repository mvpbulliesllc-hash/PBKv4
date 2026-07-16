# PBKv4 Operator OS

PBKv4 is the independent Next.js deployment for the frozen Operations Command Center.

The repository intentionally has one deployable root. Horizon Pro, FullStackHero, Astro, Vite, the production website, and raw n8n template collections are not root applications here.

## Run locally

```bash
pnpm install --frozen-lockfile
pnpm dev
```

## Verify

```bash
pnpm run typecheck
pnpm run build
bash scripts/secret-scan.sh
```

## Foundation direction

- Supabase: authentication, PostgreSQL, storage, and Row Level Security
- Native connectors/skills: first integration path
- Composio Pro: managed provider authentication and actions
- n8n: private orchestration, approvals, retries, and cross-provider workflows
- Horizon Pro: reviewed backend patterns only; never a second frontend root

See `docs/superpowers/specs/2026-07-15-operator-os-foundation-design.md` for the approved architecture contract.
