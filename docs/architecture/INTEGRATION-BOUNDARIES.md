# Integration Boundaries

## Selection order

1. Native connector, installed plugin, or trusted skill.
2. Composio Pro managed authentication/action.
3. Direct official provider API.
4. n8n workflow for orchestration, scheduling, transformation, retries, or approvals.

## n8n boundary

n8n is private orchestration infrastructure. It is not the database, public API, authentication authority, or frontend. The Operator OS calls a server-side workflow registry using stable internal workflow keys. Each run receives an idempotency key, correlation ID, durable status, audit record, bounded retry policy, and signed callback.

Raw community templates are untrusted until reviewed. Remove credential references, document IDs, account URLs, webhook IDs, and destructive steps before staging them.

## Horizon boundary

Horizon Pro is a local design and implementation reference. Its example authentication, Supabase, Stripe, and storage patterns may inform original PBKv4 implementations after review. Its root layout, styling, frontend components, package manifest, and paid source are not copied into this repository.

## Frontend boundary

The existing Command Center remains frozen. Real services replace fixture readers behind stable typed contracts. No provider SDK or privileged credential is imported into a client component.

## Matrix ENV local runtime bridge

- Matrix ENV dispatches Ayo prompts to the locally installed Codex and Claude Code CLIs through server-only route handlers.
- The bridge accepts requests only from the loopback development server and is disabled in production builds.
- Codex runs with `workspace-write`; Claude Code runs with `acceptEdits`. Neither runtime receives a dangerous permission-bypass flag.
- Provider and connector credentials remain server-side environment values. The browser receives runtime status and sanitized command output only.
- Deployed Vercel instances require a separately authenticated remote worker before Matrix ENV can execute agent commands outside the local Mac.
