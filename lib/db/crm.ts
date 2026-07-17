import "server-only"

import { and, desc, eq } from "drizzle-orm"
import { getDatabase } from "./client"
import { contacts, deals, pipelines, pipelineStages, tenants, type NewContact, type NewDeal } from "./schema"

const DEFAULT_TENANT_SLUG = "ematrixgroup"

export async function resolveTenant() {
  const db = getDatabase()
  const slug = (process.env.PBKV4_TENANT_SLUG ?? DEFAULT_TENANT_SLUG).trim().toLowerCase()
  const name = process.env.PBKV4_TENANT_NAME?.trim() || "eMatrix Group"

  await db.insert(tenants).values({ slug, name }).onConflictDoNothing({ target: tenants.slug })
  const [tenant] = await db.select().from(tenants).where(eq(tenants.slug, slug)).limit(1)
  if (!tenant) throw new Error("CRM tenant could not be resolved.")
  return tenant
}

export async function ensureDefaultPipeline(tenantId: string) {
  const db = getDatabase()
  await db.insert(pipelines).values({ tenantId, key: "sales", name: "Sales Pipeline" })
    .onConflictDoNothing({ target: [pipelines.tenantId, pipelines.key] })

  const [pipeline] = await db.select().from(pipelines)
    .where(and(eq(pipelines.tenantId, tenantId), eq(pipelines.key, "sales"))).limit(1)
  if (!pipeline) throw new Error("CRM sales pipeline could not be resolved.")

  const defaults = [
    { key: "new", name: "New", position: 10, probability: 10 },
    { key: "qualified", name: "Qualified", position: 20, probability: 30 },
    { key: "proposal", name: "Proposal", position: 30, probability: 60 },
    { key: "negotiation", name: "Negotiation", position: 40, probability: 80 },
    { key: "won", name: "Won", position: 50, probability: 100 },
    { key: "lost", name: "Lost", position: 60, probability: 0 },
  ]

  await db.insert(pipelineStages).values(defaults.map((stage) => ({ ...stage, tenantId, pipelineId: pipeline.id })))
    .onConflictDoNothing({ target: [pipelineStages.pipelineId, pipelineStages.key] })

  return pipeline
}

export async function listContacts(limit = 50) {
  const db = getDatabase()
  const tenant = await resolveTenant()
  return db.select().from(contacts).where(eq(contacts.tenantId, tenant.id))
    .orderBy(desc(contacts.updatedAt)).limit(Math.min(Math.max(limit, 1), 100))
}

export async function createContact(input: Omit<NewContact, "tenantId">) {
  const db = getDatabase()
  const tenant = await resolveTenant()
  const [contact] = await db.insert(contacts).values({ ...input, tenantId: tenant.id }).returning()
  return contact
}

export async function listDeals(limit = 50) {
  const db = getDatabase()
  const tenant = await resolveTenant()
  return db.select().from(deals).where(eq(deals.tenantId, tenant.id))
    .orderBy(desc(deals.updatedAt)).limit(Math.min(Math.max(limit, 1), 100))
}

export async function createDeal(input: Omit<NewDeal, "tenantId" | "pipelineId" | "stageId"> & { pipelineId?: string; stageId?: string }) {
  const db = getDatabase()
  const tenant = await resolveTenant()
  const pipeline = input.pipelineId
    ? { id: input.pipelineId }
    : await ensureDefaultPipeline(tenant.id)

  let stageId = input.stageId
  if (!stageId) {
    const [stage] = await db.select().from(pipelineStages)
      .where(and(eq(pipelineStages.tenantId, tenant.id), eq(pipelineStages.pipelineId, pipeline.id)))
      .orderBy(pipelineStages.position).limit(1)
    if (!stage) throw new Error("CRM pipeline has no stages.")
    stageId = stage.id
  }

  const [deal] = await db.insert(deals).values({ ...input, tenantId: tenant.id, pipelineId: pipeline.id, stageId }).returning()
  return deal
}
