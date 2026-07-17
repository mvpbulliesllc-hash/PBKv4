# CRM data plane

PBKv4 owns an isolated CRM backend. The approved dashboard remains visually frozen while its fixtures are replaced behind stable API contracts.

## Runtime map

| Concern | Implementation | Contract |
| --- | --- | --- |
| Postgres runtime | Neon pooled connection through `@neondatabase/serverless` | `DATABASE_URL` |
| Schema migrations | Drizzle Kit against the direct connection | `DATABASE_URL_UNPOOLED` |
| CRM data | Tenant-scoped contacts, pipelines, stages, deals, activities, tasks, attachments | `lib/db/schema.ts` |
| File objects | Vercel Blob server upload | `BLOB_READ_WRITE_TOKEN` or `pbk4_READ_WRITE_TOKEN` |
| Service access | Loopback during local development or an internal bearer token | `PBKV4_INTERNAL_API_TOKEN` |

The lowercase `pbk4_*` Blob variables are accepted because the existing Vercel store uses that prefix. Standard `BLOB_*` variables are preferred for future stores.

## API contracts

- `GET /api/crm/health` verifies the Neon connection.
- `GET|POST /api/crm/contacts` lists or creates contacts.
- `GET|POST /api/crm/deals` lists or creates deals. The first write creates the tenant's default sales pipeline and stages.
- `POST /api/crm/attachments` accepts multipart form data with `file` and optional `contactId`, `dealId`, and `uploadedBy` fields. Uploads are capped at 25 MB and their metadata is persisted in Postgres.

Production callers send `Authorization: Bearer <PBKV4_INTERNAL_API_TOKEN>`. These routes must not be opened directly to browsers until company authentication is restored.

## Migration runbook

1. Confirm `DATABASE_URL` is the pooled Neon URL and `DATABASE_URL_UNPOOLED` is the direct Neon URL in the intended environment.
2. From a trusted operator environment, run `pnpm run db:migrate` once for that database.
3. Call `GET /api/crm/health` with the internal bearer token.
4. Create one test contact and deal, then confirm both records in Neon.

Do not run `drizzle-kit push` against production. Committed SQL migrations in `drizzle/` are the schema source of truth.
