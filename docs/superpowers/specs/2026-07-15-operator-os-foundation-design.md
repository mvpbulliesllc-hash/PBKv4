# Operator OS Foundation Design

Date: 2026-07-15
Status: Approved architecture; awaiting written-spec review
Implementation target: New repository, Git account, deployment project, and platform boundary

## Objective

Turn the completed Operations Command Center into a working Operator OS without changing its visible frontend. The existing dashboard is the immutable operator surface. The new work adds data, authentication, CRM capabilities, integrations, automation, observability, and deployment plumbing behind that surface.

The system will use Supabase for core application data and authentication, native connector/plugin/skill capabilities wherever practical, Composio Pro as the broad managed integration layer, and n8n as the private automation engine for workflows that cannot be completed cleanly through native or managed connectors.

## Non-negotiable boundaries

### Pixel-freeze contract

The current Command Center is the visual source of truth.

- Do not redesign, restyle, rearrange, rename, simplify, modernize, or otherwise reinterpret the interface.
- Do not change layout geometry, spacing, typography, color, borders, shadows, glass treatment, iconography, animation, responsive behavior, labels, or visible interactions.
- Do not replace the shell with Horizon UI or any other template.
- Backend wiring may replace mock values with real values only when the rendered shape and visual behavior remain identical.
- Capture baseline screenshots at supported desktop widths before integration work. Run visual regression checks against deterministic fixture data on every frontend-affecting pull request.
- Treat an unexplained screenshot difference as a failed check, even when the application compiles.
- Any intentional visual change requires a separate, explicit user request and approval.

### Production-isolation contract

- Do not modify or redeploy the recovered production website.
- Do not connect the Operator OS repository to the production site's Git account, Vercel project, deployment project, domain, environment variables, or build pipeline.
- The Operator OS must use a new repository under the user's separate account/platform, a new deployment project, isolated credentials, and an independent preview URL.
- The existing `.NET 10` system remains an external system. It may be integrated later through a versioned API, but it is not copied into the new repository.
- The existing `bbb5` mixed repository is reference material only and is not the deployment target.

## Recommended architecture

### 1. Frozen Command Center

The existing Next.js 16 Command Center remains the only frontend shell. Its present routes, components, navigation, panels, dock, module registry, and brand assets are preserved.

The frontend consumes typed application services rather than calling third-party providers or n8n directly. During foundation work, the current UI can continue using deterministic fixtures while the real service implementations are completed behind the same contracts.

### 2. Server facade

A server-only application layer sits between the Command Center and every data or integration service. This layer owns:

- authenticated user and workspace context;
- tenant-scoped authorization;
- input validation;
- typed request and response contracts;
- idempotency and retry rules;
- rate limiting;
- audit-event creation;
- provider normalization;
- job creation and status retrieval;
- webhook verification and callback processing.

The browser never receives provider secrets, service-role keys, n8n credentials, Composio credentials, or privileged Supabase credentials.

### 3. Supabase foundation

Supabase supplies the initial system-of-record services:

- authentication and sessions;
- PostgreSQL application database;
- Row Level Security for workspace isolation;
- file/object storage where appropriate;
- realtime updates only for workflows that materially benefit from them;
- migration-managed schema and generated application types.

Core CRM schema:

- `workspaces`
- `workspace_members`
- `companies`
- `contacts`
- `pipelines`
- `pipeline_stages`
- `deals`
- `activities`
- `tasks`
- `conversations`
- `messages`
- `integration_accounts`
- `workflow_definitions`
- `workflow_runs`
- `audit_events`

Every business row is workspace-scoped. Authorization is enforced in the database and repeated in the server facade for defense in depth.

### 4. Integration priority ladder

Integrations are selected in this order:

1. Native platform connector, installed plugin, or trusted skill when it provides the required read/write operation and acceptable operational control.
2. Composio Pro when it provides maintained authentication and action coverage for the provider.
3. Direct official provider API when native and Composio paths are insufficient or too restrictive.
4. n8n workflow when the operation requires multi-step orchestration, transformation, scheduling, retries, approval gates, or cross-provider coordination.

This order avoids rebuilding OAuth and provider plumbing unnecessarily while preventing n8n from becoming an ungoverned collection of one-off workflows.

### 5. Composio integration gateway

Composio Pro acts as the managed integration gateway for supported services. The foundation will include an integration catalog rather than hard-coding provider behavior into UI components.

Each catalog entry records:

- provider and connection owner;
- available capabilities;
- requested scopes;
- connection state and health;
- server-side action identifiers;
- rate-limit and retry policy;
- data classification;
- last successful synchronization;
- fallback path when the managed action is unavailable.

Provider availability and action names must be verified against the active Composio account during implementation rather than assumed from documentation or template code.

### 6. Private n8n automation plane

n8n is an internal orchestration service, not the public backend, source of truth, or user-facing application.

The Command Center never embeds or calls the n8n editor directly in the initial release. Server-side jobs invoke allow-listed workflows through signed requests. n8n reports normalized status and results through verified callbacks.

Foundation components:

- workflow registry with stable internal workflow keys;
- signed invocation contract;
- run correlation and idempotency keys;
- normalized states: `queued`, `running`, `waiting_for_approval`, `succeeded`, `failed`, and `cancelled`;
- timeout and retry policy;
- dead-letter handling;
- execution logs with secret redaction;
- health/heartbeat monitoring;
- human-approval gates for destructive or externally visible actions;
- credential references stored in n8n or the platform secret store, never inside exported workflow JSON.

The supplied n8n ZIP is a template library only. Templates must be individually reviewed, sanitized, version-checked, imported into a staging n8n instance, and tested before they enter the allow-list. Hard-coded spreadsheet IDs, webhook IDs, Supabase URLs, credential references, and third-party assumptions must be removed.

Recommended initial n8n workflows while the foundation is being framed:

1. Lead intake normalization and deduplication.
2. Contact/company enrichment with an explicit cost ceiling.
3. CRM activity logging from approved provider events.
4. Follow-up drafting with human approval before sending.
5. Scheduled integration-health summary.
6. Failed-run alerting and dead-letter review.

Automatic outbound messaging, deletion, billing changes, and bulk updates remain disabled until approval controls and audit logging are verified.

### 7. Horizon Pro usage boundary

Horizon Pro is a reference and selective donor, not the application root.

Reusable concepts include:

- Supabase session and account-management patterns;
- Stripe subscription-domain patterns if billing becomes in scope;
- server-side storage patterns after security review;
- table/chart data-shaping ideas;
- its Figma source as design reference only when a future visual change is explicitly authorized.

Do not copy its root layout, routes, theme, frontend components, package manifest, or styling into the frozen Command Center. Do not reuse its environment-variable model unchanged. Its example exposes OpenAI and AWS credential names with `NEXT_PUBLIC_` prefixes; all privileged credentials must be renamed and consumed server-side only.

## Primary data flow

1. An operator acts in the unchanged Command Center.
2. The server facade authenticates the session and resolves the workspace.
3. The request is validated, authorized, and assigned an idempotency key.
4. Synchronous database work is committed to Supabase.
5. Integration work is routed through the priority ladder.
6. Long-running work creates a durable job and is dispatched to Composio, a direct provider API, or n8n.
7. Provider/n8n callbacks are signature-verified and normalized.
8. The server updates the CRM record, workflow run, and audit trail.
9. The frontend receives the same typed view model it previously received from fixtures, preserving the current rendered interface.

## Error and recovery behavior

- User actions return a correlation ID when asynchronous work begins.
- Retriable failures use bounded exponential backoff with idempotency protection.
- Permanent failures surface a normalized reason without leaking credentials or provider payloads.
- Partial workflow completion is recorded step-by-step.
- Human approval pauses are durable and resumable.
- Webhook callbacks are safe to replay.
- Failed jobs move to a reviewable dead-letter state rather than disappearing.
- Integration health is visible to the backend and can populate existing status surfaces without changing their design.

## Security model

- No secrets in source control, workflow exports, browser bundles, fixture data, logs, or screenshots.
- Never use `NEXT_PUBLIC_` for OpenAI, AWS secret keys, Supabase service-role keys, n8n API keys, Composio secrets, Stripe secrets, or webhook signing secrets.
- Use least-privilege OAuth scopes and separate development, preview, and production credentials.
- Require RLS on every workspace-scoped Supabase table before production data is loaded.
- Verify webhook signatures and enforce timestamp/replay windows.
- Require audit records for privileged reads, provider writes, workflow approvals, configuration changes, and credential lifecycle events.
- Redact sensitive fields at the logging boundary.
- Require human approval for irreversible actions until explicitly promoted to safe automation.
- Maintain an integration kill switch and per-workflow enable flag.

## Delivery sequence

### Phase 0: Preserve and prove the frontend

- Receive the new remote repository URL and platform/account target.
- Import only the approved Command Center source.
- Capture baseline screenshots and establish deterministic fixture mode.
- Add build, type-check, secret-scan, and visual-regression gates.
- Verify the new deployment has no relationship to the production website.

### Phase 1: Frame the foundation

- Establish environment validation and server-only configuration.
- Create the server-facade module boundaries and typed interfaces.
- Create Supabase migrations, RLS policies, generated types, and seed fixtures.
- Establish audit, idempotency, job, and integration-registry primitives.

### Phase 2: CRM core

- Implement companies, contacts, pipelines, stages, deals, activities, and tasks.
- Map real CRM records into the existing Command Center view models.
- Preserve deterministic fixture mode for visual regression.

### Phase 3: Connector and Composio layer

- Inventory native connectors/plugins/skills and the active Composio Pro catalog.
- Implement connection lifecycle, scope display, health checks, and action adapters.
- Connect the highest-value read paths before enabling writes.

### Phase 4: n8n automation plane

- Stand up a private staging n8n instance.
- Implement signed invocation/callback contracts and the workflow registry.
- Sanitize and adapt the selected initial workflows.
- Add approvals, retries, failure review, and operational monitoring.

### Phase 5: Controlled production wiring

- Promote integrations individually after staging verification.
- Enable outbound or destructive actions only after explicit acceptance tests.
- Publish the independent Operator OS deployment.
- Add the production site's Admin link only after the new system passes isolation and security checks.

## Acceptance criteria

- The Command Center matches the approved visual baseline at supported viewports.
- No production-site repository, deployment, domain, or environment setting changes during Operator OS construction.
- Every CRM row is workspace-scoped and protected by tested RLS policies.
- Browser bundles contain no privileged credential.
- All integrations use cataloged scopes and server-side adapters.
- Every automation run has a correlation ID, durable status, audit trail, and recoverable failure path.
- n8n is private and only executes allow-listed workflows.
- High-risk actions require approval by default.
- The app builds, type-checks, passes secret scanning, and passes visual regression before deployment.

## Required implementation handoff

Implementation cannot start safely until the user supplies the brand-new repository URL under the separate account/platform. Once received, this specification is copied into that repository and becomes its initial architecture contract.
