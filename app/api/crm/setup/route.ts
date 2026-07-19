import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import { getDatabaseUrl } from "@/lib/db/client"
import { ensureDefaultPipeline, resolveTenant } from "@/lib/db/crm"
import { isOperatorRequest } from "@/lib/operator-auth"

export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * POST /api/crm/setup
 *
 * Idempotent: creates all CRM schema objects if they do not yet exist, then
 * seeds the default tenant and sales pipeline. Safe to call multiple times.
 * Each statement is fired individually so that "already exists" errors on one
 * do not abort the rest.
 */
export async function POST(request: Request) {
  if (!isOperatorRequest(request)) {
    return NextResponse.json({ error: "Operator authorization required." }, { status: 403 })
  }

  try {
    const sql = neon(getDatabaseUrl())

    // Helper: run one DDL statement; swallow duplicate_object / duplicate_table
    async function run(stmt: string) {
      try {
        await sql.query(stmt)
      } catch (err: unknown) {
        const pg = err as { code?: string }
        if (pg?.code === "42710" || pg?.code === "42P07") return // already exists
        throw err
      }
    }

    // ── 1. Enums ──────────────────────────────────────────────────────────────
    for (const [name, values] of [
      ["contact_status", "'lead','qualified','customer','inactive'"],
      ["deal_status",    "'open','won','lost'"],
      ["task_status",    "'open','in_progress','done','cancelled'"],
      ["task_priority",  "'low','normal','high','urgent'"],
    ] as [string, string][]) {
      await run(
        `do $$ begin create type ${name} as enum (${values}); exception when duplicate_object then null; end $$`
      )
    }

    // ── 2. Tenants ────────────────────────────────────────────────────────────
    await run(`
      create table if not exists tenants (
        id          uuid primary key default gen_random_uuid(),
        slug        varchar(80)  not null,
        name        varchar(160) not null,
        created_at  timestamptz not null default now(),
        updated_at  timestamptz not null default now()
      )
    `)
    await run(`create unique index if not exists tenants_slug_uidx on tenants (slug)`)

    // ── 3. CRM contacts ───────────────────────────────────────────────────────
    await run(`
      create table if not exists crm_contacts (
        id           uuid primary key default gen_random_uuid(),
        tenant_id    uuid not null references tenants(id) on delete cascade,
        external_ref varchar(180),
        first_name   varchar(120),
        last_name    varchar(120),
        display_name varchar(240) not null,
        email        varchar(320),
        phone        varchar(64),
        company      varchar(240),
        job_title    varchar(180),
        status       contact_status not null default 'lead',
        source       varchar(120),
        owner_email  varchar(320),
        tags         jsonb not null default '[]',
        notes        text,
        created_at   timestamptz not null default now(),
        updated_at   timestamptz not null default now()
      )
    `)
    await run(`create unique index if not exists crm_contacts_tenant_external_ref_uidx on crm_contacts (tenant_id, external_ref) where external_ref is not null`)
    await run(`create index if not exists crm_contacts_tenant_status_updated_idx on crm_contacts (tenant_id, status, updated_at)`)
    await run(`create index if not exists crm_contacts_tenant_email_idx on crm_contacts (tenant_id, email)`)

    // ── 4. Pipelines ──────────────────────────────────────────────────────────
    await run(`
      create table if not exists crm_pipelines (
        id         uuid primary key default gen_random_uuid(),
        tenant_id  uuid not null references tenants(id) on delete cascade,
        key        varchar(80) not null,
        name       varchar(160) not null,
        active     boolean not null default true,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `)
    await run(`create unique index if not exists crm_pipelines_tenant_key_uidx on crm_pipelines (tenant_id, key)`)
    await run(`create index if not exists crm_pipelines_tenant_active_idx on crm_pipelines (tenant_id, active)`)

    // ── 5. Pipeline stages ────────────────────────────────────────────────────
    await run(`
      create table if not exists crm_pipeline_stages (
        id          uuid primary key default gen_random_uuid(),
        tenant_id   uuid not null references tenants(id) on delete cascade,
        pipeline_id uuid not null references crm_pipelines(id) on delete cascade,
        key         varchar(80) not null,
        name        varchar(160) not null,
        position    integer not null,
        probability integer not null default 0 check (probability between 0 and 100),
        created_at  timestamptz not null default now(),
        updated_at  timestamptz not null default now()
      )
    `)
    await run(`create unique index if not exists crm_pipeline_stages_pipeline_key_uidx on crm_pipeline_stages (pipeline_id, key)`)
    await run(`create unique index if not exists crm_pipeline_stages_pipeline_position_uidx on crm_pipeline_stages (pipeline_id, position)`)
    await run(`create index if not exists crm_pipeline_stages_tenant_pipeline_idx on crm_pipeline_stages (tenant_id, pipeline_id)`)

    // ── 6. Deals ──────────────────────────────────────────────────────────────
    await run(`
      create table if not exists crm_deals (
        id                  uuid primary key default gen_random_uuid(),
        tenant_id           uuid not null references tenants(id) on delete cascade,
        contact_id          uuid references crm_contacts(id) on delete restrict,
        pipeline_id         uuid not null references crm_pipelines(id) on delete restrict,
        stage_id            uuid not null references crm_pipeline_stages(id) on delete restrict,
        title               varchar(240) not null,
        company             varchar(240),
        amount_cents        bigint not null default 0 check (amount_cents >= 0),
        currency            varchar(3) not null default 'USD',
        status              deal_status not null default 'open',
        expected_close_date date,
        owner_email         varchar(320),
        source              varchar(120),
        metadata            jsonb not null default '{}',
        created_at          timestamptz not null default now(),
        updated_at          timestamptz not null default now()
      )
    `)
    await run(`create index if not exists crm_deals_tenant_status_updated_idx on crm_deals (tenant_id, status, updated_at)`)
    await run(`create index if not exists crm_deals_tenant_stage_idx on crm_deals (tenant_id, stage_id)`)
    await run(`create index if not exists crm_deals_tenant_contact_idx on crm_deals (tenant_id, contact_id)`)
    await run(`create index if not exists crm_deals_pipeline_idx on crm_deals (pipeline_id)`)

    // ── 7. Activities ─────────────────────────────────────────────────────────
    await run(`
      create table if not exists crm_activities (
        id          uuid primary key default gen_random_uuid(),
        tenant_id   uuid not null references tenants(id) on delete cascade,
        contact_id  uuid references crm_contacts(id) on delete cascade,
        deal_id     uuid references crm_deals(id) on delete cascade,
        type        varchar(80) not null,
        subject     varchar(240),
        body        text,
        actor_email varchar(320),
        occurred_at timestamptz not null default now(),
        metadata    jsonb not null default '{}',
        created_at  timestamptz not null default now(),
        updated_at  timestamptz not null default now()
      )
    `)
    await run(`create index if not exists crm_activities_tenant_occurred_idx on crm_activities (tenant_id, occurred_at)`)
    await run(`create index if not exists crm_activities_tenant_contact_idx on crm_activities (tenant_id, contact_id)`)
    await run(`create index if not exists crm_activities_tenant_deal_idx on crm_activities (tenant_id, deal_id)`)

    // ── 8. Tasks ──────────────────────────────────────────────────────────────
    await run(`
      create table if not exists crm_tasks (
        id           uuid primary key default gen_random_uuid(),
        tenant_id    uuid not null references tenants(id) on delete cascade,
        contact_id   uuid references crm_contacts(id) on delete cascade,
        deal_id      uuid references crm_deals(id) on delete cascade,
        title        varchar(240) not null,
        description  text,
        status       task_status not null default 'open',
        priority     task_priority not null default 'normal',
        assigned_to  varchar(320),
        due_at       timestamptz,
        completed_at timestamptz,
        created_at   timestamptz not null default now(),
        updated_at   timestamptz not null default now()
      )
    `)
    await run(`create index if not exists crm_tasks_tenant_status_due_idx on crm_tasks (tenant_id, status, due_at)`)
    await run(`create index if not exists crm_tasks_tenant_contact_idx on crm_tasks (tenant_id, contact_id)`)
    await run(`create index if not exists crm_tasks_tenant_deal_idx on crm_tasks (tenant_id, deal_id)`)

    // ── 9. Attachments ────────────────────────────────────────────────────────
    await run(`
      create table if not exists crm_attachments (
        id            uuid primary key default gen_random_uuid(),
        tenant_id     uuid not null references tenants(id) on delete cascade,
        contact_id    uuid references crm_contacts(id) on delete cascade,
        deal_id       uuid references crm_deals(id) on delete cascade,
        pathname      text not null,
        url           text not null,
        download_url  text not null,
        content_type  varchar(180),
        size_bytes    bigint not null,
        uploaded_by   varchar(320),
        created_at    timestamptz not null default now(),
        updated_at    timestamptz not null default now()
      )
    `)
    await run(`create unique index if not exists crm_attachments_tenant_pathname_uidx on crm_attachments (tenant_id, pathname)`)
    await run(`create index if not exists crm_attachments_tenant_contact_idx on crm_attachments (tenant_id, contact_id)`)
    await run(`create index if not exists crm_attachments_tenant_deal_idx on crm_attachments (tenant_id, deal_id)`)

    // ── 10. Seed default tenant + pipeline ────────────────────────────────────
    const tenant = await resolveTenant()
    const pipeline = await ensureDefaultPipeline(tenant.id)

    return NextResponse.json({
      ok: true,
      tenant: { id: tenant.id, slug: tenant.slug, name: tenant.name },
      pipeline: { id: pipeline.id, key: pipeline.key, name: pipeline.name },
      message: "CRM schema ready.",
    })
  } catch (error) {
    console.error("[crm/setup]", error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Setup failed." },
      { status: 500 },
    )
  }
}

/** GET — quick status check, no auth required */
export async function GET() {
  try {
    const sql = neon(getDatabaseUrl())
    const result = await sql.query(`select to_regclass('public.crm_contacts') as contacts`)
    const ready = Boolean(result.rows[0]?.contacts)
    return NextResponse.json(
      { status: ready ? "ready" : "needs-setup", checkedAt: new Date().toISOString() },
      { status: ready ? 200 : 503 },
    )
  } catch {
    return NextResponse.json(
      { status: "unavailable", checkedAt: new Date().toISOString() },
      { status: 503 },
    )
  }
}
