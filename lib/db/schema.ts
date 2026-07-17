import {
  bigint,
  boolean,
  check,
  date,
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}

export const contactStatus = pgEnum("contact_status", ["lead", "qualified", "customer", "inactive"])
export const dealStatus = pgEnum("deal_status", ["open", "won", "lost"])
export const taskStatus = pgEnum("task_status", ["open", "in_progress", "done", "cancelled"])
export const taskPriority = pgEnum("task_priority", ["low", "normal", "high", "urgent"])

export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  ...timestamps,
}, (table) => [uniqueIndex("tenants_slug_uidx").on(table.slug)])

export const contacts = pgTable("crm_contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  externalRef: varchar("external_ref", { length: 180 }),
  firstName: varchar("first_name", { length: 120 }),
  lastName: varchar("last_name", { length: 120 }),
  displayName: varchar("display_name", { length: 240 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 64 }),
  company: varchar("company", { length: 240 }),
  jobTitle: varchar("job_title", { length: 180 }),
  status: contactStatus("status").default("lead").notNull(),
  source: varchar("source", { length: 120 }),
  ownerEmail: varchar("owner_email", { length: 320 }),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  notes: text("notes"),
  ...timestamps,
}, (table) => [
  unique("crm_contacts_tenant_id_id_unique").on(table.tenantId, table.id),
  uniqueIndex("crm_contacts_tenant_external_ref_uidx").on(table.tenantId, table.externalRef),
  index("crm_contacts_tenant_status_updated_idx").on(table.tenantId, table.status, table.updatedAt),
  index("crm_contacts_tenant_email_idx").on(table.tenantId, table.email),
])

export const pipelines = pgTable("crm_pipelines", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  key: varchar("key", { length: 80 }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  active: boolean("active").default(true).notNull(),
  ...timestamps,
}, (table) => [
  unique("crm_pipelines_tenant_id_id_unique").on(table.tenantId, table.id),
  uniqueIndex("crm_pipelines_tenant_key_uidx").on(table.tenantId, table.key),
  index("crm_pipelines_tenant_active_idx").on(table.tenantId, table.active),
])

export const pipelineStages = pgTable("crm_pipeline_stages", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  pipelineId: uuid("pipeline_id").notNull(),
  key: varchar("key", { length: 80 }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  position: integer("position").notNull(),
  probability: integer("probability").default(0).notNull(),
  ...timestamps,
}, (table) => [
  unique("crm_pipeline_stages_tenant_id_id_unique").on(table.tenantId, table.id),
  unique("crm_pipeline_stages_tenant_pipeline_id_unique").on(table.tenantId, table.pipelineId, table.id),
  uniqueIndex("crm_pipeline_stages_pipeline_key_uidx").on(table.pipelineId, table.key),
  uniqueIndex("crm_pipeline_stages_pipeline_position_uidx").on(table.pipelineId, table.position),
  index("crm_pipeline_stages_tenant_pipeline_idx").on(table.tenantId, table.pipelineId),
  check("crm_pipeline_stages_probability_check", sql`${table.probability} between 0 and 100`),
  foreignKey({
    name: "crm_pipeline_stages_tenant_pipeline_fk",
    columns: [table.tenantId, table.pipelineId],
    foreignColumns: [pipelines.tenantId, pipelines.id],
  }).onDelete("cascade"),
])

export const deals = pgTable("crm_deals", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  contactId: uuid("contact_id"),
  pipelineId: uuid("pipeline_id").notNull(),
  stageId: uuid("stage_id").notNull(),
  title: varchar("title", { length: 240 }).notNull(),
  company: varchar("company", { length: 240 }),
  amountCents: bigint("amount_cents", { mode: "number" }).default(0).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  status: dealStatus("status").default("open").notNull(),
  expectedCloseDate: date("expected_close_date"),
  ownerEmail: varchar("owner_email", { length: 320 }),
  source: varchar("source", { length: 120 }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  ...timestamps,
}, (table) => [
  unique("crm_deals_tenant_id_id_unique").on(table.tenantId, table.id),
  index("crm_deals_tenant_status_updated_idx").on(table.tenantId, table.status, table.updatedAt),
  index("crm_deals_tenant_stage_idx").on(table.tenantId, table.stageId),
  index("crm_deals_tenant_contact_idx").on(table.tenantId, table.contactId),
  index("crm_deals_pipeline_idx").on(table.pipelineId),
  check("crm_deals_amount_nonnegative_check", sql`${table.amountCents} >= 0`),
  foreignKey({
    name: "crm_deals_tenant_contact_fk",
    columns: [table.tenantId, table.contactId],
    foreignColumns: [contacts.tenantId, contacts.id],
  }).onDelete("restrict"),
  foreignKey({
    name: "crm_deals_tenant_pipeline_fk",
    columns: [table.tenantId, table.pipelineId],
    foreignColumns: [pipelines.tenantId, pipelines.id],
  }).onDelete("restrict"),
  foreignKey({
    name: "crm_deals_tenant_stage_fk",
    columns: [table.tenantId, table.pipelineId, table.stageId],
    foreignColumns: [pipelineStages.tenantId, pipelineStages.pipelineId, pipelineStages.id],
  }).onDelete("restrict"),
])

export const activities = pgTable("crm_activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  contactId: uuid("contact_id"),
  dealId: uuid("deal_id"),
  type: varchar("type", { length: 80 }).notNull(),
  subject: varchar("subject", { length: 240 }),
  body: text("body"),
  actorEmail: varchar("actor_email", { length: 320 }),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  ...timestamps,
}, (table) => [
  index("crm_activities_tenant_occurred_idx").on(table.tenantId, table.occurredAt),
  index("crm_activities_tenant_contact_idx").on(table.tenantId, table.contactId),
  index("crm_activities_tenant_deal_idx").on(table.tenantId, table.dealId),
  foreignKey({
    name: "crm_activities_tenant_contact_fk",
    columns: [table.tenantId, table.contactId],
    foreignColumns: [contacts.tenantId, contacts.id],
  }).onDelete("cascade"),
  foreignKey({
    name: "crm_activities_tenant_deal_fk",
    columns: [table.tenantId, table.dealId],
    foreignColumns: [deals.tenantId, deals.id],
  }).onDelete("cascade"),
])

export const tasks = pgTable("crm_tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  contactId: uuid("contact_id"),
  dealId: uuid("deal_id"),
  title: varchar("title", { length: 240 }).notNull(),
  description: text("description"),
  status: taskStatus("status").default("open").notNull(),
  priority: taskPriority("priority").default("normal").notNull(),
  assignedTo: varchar("assigned_to", { length: 320 }),
  dueAt: timestamp("due_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [
  index("crm_tasks_tenant_status_due_idx").on(table.tenantId, table.status, table.dueAt),
  index("crm_tasks_tenant_contact_idx").on(table.tenantId, table.contactId),
  index("crm_tasks_tenant_deal_idx").on(table.tenantId, table.dealId),
  foreignKey({
    name: "crm_tasks_tenant_contact_fk",
    columns: [table.tenantId, table.contactId],
    foreignColumns: [contacts.tenantId, contacts.id],
  }).onDelete("cascade"),
  foreignKey({
    name: "crm_tasks_tenant_deal_fk",
    columns: [table.tenantId, table.dealId],
    foreignColumns: [deals.tenantId, deals.id],
  }).onDelete("cascade"),
])

export const attachments = pgTable("crm_attachments", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  contactId: uuid("contact_id"),
  dealId: uuid("deal_id"),
  pathname: text("pathname").notNull(),
  url: text("url").notNull(),
  downloadUrl: text("download_url").notNull(),
  contentType: varchar("content_type", { length: 180 }),
  sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
  uploadedBy: varchar("uploaded_by", { length: 320 }),
  ...timestamps,
}, (table) => [
  uniqueIndex("crm_attachments_tenant_pathname_uidx").on(table.tenantId, table.pathname),
  index("crm_attachments_tenant_contact_idx").on(table.tenantId, table.contactId),
  index("crm_attachments_tenant_deal_idx").on(table.tenantId, table.dealId),
  foreignKey({
    name: "crm_attachments_tenant_contact_fk",
    columns: [table.tenantId, table.contactId],
    foreignColumns: [contacts.tenantId, contacts.id],
  }).onDelete("cascade"),
  foreignKey({
    name: "crm_attachments_tenant_deal_fk",
    columns: [table.tenantId, table.dealId],
    foreignColumns: [deals.tenantId, deals.id],
  }).onDelete("cascade"),
])

export type Contact = typeof contacts.$inferSelect
export type NewContact = typeof contacts.$inferInsert
export type Deal = typeof deals.$inferSelect
export type NewDeal = typeof deals.$inferInsert
