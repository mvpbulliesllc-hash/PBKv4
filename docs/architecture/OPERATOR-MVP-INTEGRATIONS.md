# PBKv4 Operator MVP integration plan

PBKv4 must not be bolted to the public business site until it is a protected, working admin system. The visual dashboard is the operator shell; this document defines the backend and bridge required to make the controls real.

## Runtime split

| Layer | Runs where | Owns | Current implementation |
| --- | --- | --- | --- |
| Public site | Existing business/personal site deployment | Marketing pages, SEO, public lead capture | Keep separate. Do not merge PBKv4 source into it. |
| PBKv4 cloud admin | Vercel project `pb-kv4` | Auth, CRM APIs, connector health, Blob, Neon, Slack Connect, model/API calls, n8n webhooks | Next.js app with `/api/crm/*`, `/api/ay0/*`, `/triggers/slack`. |
| Local agent bridge | Operator Mac or a controlled workstation | Codex, Claude Code, live browser control, real vault/filesystem, desktop video/screen/audio tooling | Required next. Vercel cannot run installed desktop apps or control the local browser. |
| Automation fabric | n8n / Composio / provider APIs | Long-running workflows, OAuth apps, social publishing, cross-app plumbing | Registered as capabilities; action adapters still need to be built provider by provider. |

## What is real now

- `GET /api/crm/health` checks the Neon CRM schema and returns `ready`, `needs-migration`, or `unavailable`.
- `GET /api/ay0/connectors/health` checks configured connector status without returning secret values.
- `GET /api/ay0/readiness` summarizes cloud connectors, database, Blob, and the required local-agent bridge.
- The top-bar command palette now calls real readiness/CRM checks instead of only closing the menu.
- Local Codex/Claude dispatch routes remain loopback-only by design.

## Why the Matrix ENV cannot be only a Vercel app

Vercel serverless functions do not have the operator's installed ChatGPT app, Claude Code binary, Chrome session, filesystem vault, microphone, camera, screen recorder, or local shell state. A production admin page can request those actions, but a trusted agent running on the Mac must execute them.

The correct shape is:

1. PBKv4 stores a signed task request in a queue.
2. The local agent bridge checks in with a heartbeat.
3. The bridge pulls approved jobs for browser/coding/video/vault work.
4. The bridge runs Codex, Claude Code, Chrome/browser automation, or local file operations.
5. Results stream back to PBKv4 as logs, artifacts, status, and links.

Until that exists, production Matrix ENV can show status and accept intent, but it should not claim to control the local machine.

## Capability registry

The capability registry is value-free. It stores provider names, required environment-variable names, seats, and approved read-only health probes only.

Configured cloud capabilities include:

- OpenAI, Anthropic, OpenRouter, Vercel AI Gateway, Gemini, Nous, NVIDIA
- Firecrawl, Exa, generic Search API
- Composio, n8n, Zen, OpenClaw
- Hume voice
- Mux video
- SnapRender
- AgentMail
- Blotato socials
- Creative Tim registry
- GitHub and Vercel
- Neon Postgres and Vercel Blob
- Slack through Vercel Connect

Local-only capabilities include:

- Codex local runtime
- Claude Code local runtime
- live browser control
- local vault/filesystem access

## Shipping gate before attaching to the real site

PBKv4 can be attached as an admin panel only after these pass:

1. Admin auth is enabled at the app edge. The current demo login redirects straight to `/`, so this is not safe as a public admin surface yet.
2. `GET /api/crm/health` returns `ready` in production.
3. `GET /api/ay0/readiness` returns configured/authenticated states for the required cloud providers.
4. CRM migrations have run against the production Neon database.
5. Blob upload works through a CRM attachment route.
6. Slack Connect can authenticate and post a controlled test message.
7. n8n OAuth/MCP is completed in Codex/Claude where required.
8. A local agent bridge heartbeat appears in PBKv4 before any local browser/Codex/Claude/video buttons are presented as operational.

## Recommended bolt-on pattern

Use a separate protected admin host:

- Public site: keep current production deployment untouched.
- Admin panel: `admin.<domain>` or a Vercel-protected route that points to PBKv4.
- Data exchange: public site sends leads to PBKv4 through a narrow authenticated API/webhook, not by sharing source trees.

This keeps the recovered frontend safe and prevents another backend/dashboard build from overwriting the public site.
