# PBKv4 Operator OS

This repository deploys one application: the Next.js Operator OS Command Center.

## Frozen frontend contract

The current rendered Command Center is the approved visual source of truth. Do not change layout, styling, spacing, typography, color, icons, animation, labels, responsive behavior, or visible interaction design without explicit user approval.

Backend and integration work must preserve the typed view models consumed by the existing interface. Replace fixtures behind stable contracts and prove visual parity with baseline screenshots.

## Architecture boundaries

- `app/`, `components/`, `lib/`, and `public/` contain the deployed Command Center.
- Server credentials are never exposed to browser code or committed files.
- Supabase is the planned authentication, PostgreSQL, storage, and tenant-isolation foundation.
- Native connectors and skills are preferred first, Composio second, direct provider APIs third, and n8n for multi-step orchestration.
- Horizon Pro is local reference material only. Do not copy its paid source or root application into this public repository.
- n8n workflow exports must be sanitized and curated individually before they are committed.
- The existing production website and .NET system are external systems and must never be deployed from this repository.

## Required checks

Before committing:

```bash
pnpm run typecheck
pnpm run build
bash scripts/secret-scan.sh
```

For any frontend-source change, also run the browser regression flow against the approved landing and Workbench baselines.
