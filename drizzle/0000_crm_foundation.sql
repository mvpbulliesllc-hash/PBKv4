CREATE TYPE "public"."contact_status" AS ENUM('lead', 'qualified', 'customer', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."deal_status" AS ENUM('open', 'won', 'lost');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('low', 'normal', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('open', 'in_progress', 'done', 'cancelled');--> statement-breakpoint
CREATE TABLE "crm_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"contact_id" uuid,
	"deal_id" uuid,
	"type" varchar(80) NOT NULL,
	"subject" varchar(240),
	"body" text,
	"actor_email" varchar(320),
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"contact_id" uuid,
	"deal_id" uuid,
	"pathname" text NOT NULL,
	"url" text NOT NULL,
	"download_url" text NOT NULL,
	"content_type" varchar(180),
	"size_bytes" bigint NOT NULL,
	"uploaded_by" varchar(320),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"external_ref" varchar(180),
	"first_name" varchar(120),
	"last_name" varchar(120),
	"display_name" varchar(240) NOT NULL,
	"email" varchar(320),
	"phone" varchar(64),
	"company" varchar(240),
	"job_title" varchar(180),
	"status" "contact_status" DEFAULT 'lead' NOT NULL,
	"source" varchar(120),
	"owner_email" varchar(320),
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "crm_contacts_tenant_id_id_unique" UNIQUE("tenant_id","id")
);
--> statement-breakpoint
CREATE TABLE "crm_deals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"contact_id" uuid,
	"pipeline_id" uuid NOT NULL,
	"stage_id" uuid NOT NULL,
	"title" varchar(240) NOT NULL,
	"company" varchar(240),
	"amount_cents" bigint DEFAULT 0 NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"status" "deal_status" DEFAULT 'open' NOT NULL,
	"expected_close_date" date,
	"owner_email" varchar(320),
	"source" varchar(120),
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "crm_deals_tenant_id_id_unique" UNIQUE("tenant_id","id"),
	CONSTRAINT "crm_deals_amount_nonnegative_check" CHECK ("crm_deals"."amount_cents" >= 0)
);
--> statement-breakpoint
CREATE TABLE "crm_pipeline_stages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"pipeline_id" uuid NOT NULL,
	"key" varchar(80) NOT NULL,
	"name" varchar(160) NOT NULL,
	"position" integer NOT NULL,
	"probability" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "crm_pipeline_stages_tenant_id_id_unique" UNIQUE("tenant_id","id"),
	CONSTRAINT "crm_pipeline_stages_tenant_pipeline_id_unique" UNIQUE("tenant_id","pipeline_id","id"),
	CONSTRAINT "crm_pipeline_stages_probability_check" CHECK ("crm_pipeline_stages"."probability" between 0 and 100)
);
--> statement-breakpoint
CREATE TABLE "crm_pipelines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"key" varchar(80) NOT NULL,
	"name" varchar(160) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "crm_pipelines_tenant_id_id_unique" UNIQUE("tenant_id","id")
);
--> statement-breakpoint
CREATE TABLE "crm_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"contact_id" uuid,
	"deal_id" uuid,
	"title" varchar(240) NOT NULL,
	"description" text,
	"status" "task_status" DEFAULT 'open' NOT NULL,
	"priority" "task_priority" DEFAULT 'normal' NOT NULL,
	"assigned_to" varchar(320),
	"due_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(80) NOT NULL,
	"name" varchar(160) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "crm_activities" ADD CONSTRAINT "crm_activities_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_activities" ADD CONSTRAINT "crm_activities_tenant_contact_fk" FOREIGN KEY ("tenant_id","contact_id") REFERENCES "public"."crm_contacts"("tenant_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_activities" ADD CONSTRAINT "crm_activities_tenant_deal_fk" FOREIGN KEY ("tenant_id","deal_id") REFERENCES "public"."crm_deals"("tenant_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_attachments" ADD CONSTRAINT "crm_attachments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_attachments" ADD CONSTRAINT "crm_attachments_tenant_contact_fk" FOREIGN KEY ("tenant_id","contact_id") REFERENCES "public"."crm_contacts"("tenant_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_attachments" ADD CONSTRAINT "crm_attachments_tenant_deal_fk" FOREIGN KEY ("tenant_id","deal_id") REFERENCES "public"."crm_deals"("tenant_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_contacts" ADD CONSTRAINT "crm_contacts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_deals" ADD CONSTRAINT "crm_deals_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_deals" ADD CONSTRAINT "crm_deals_tenant_contact_fk" FOREIGN KEY ("tenant_id","contact_id") REFERENCES "public"."crm_contacts"("tenant_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_deals" ADD CONSTRAINT "crm_deals_tenant_pipeline_fk" FOREIGN KEY ("tenant_id","pipeline_id") REFERENCES "public"."crm_pipelines"("tenant_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_deals" ADD CONSTRAINT "crm_deals_tenant_stage_fk" FOREIGN KEY ("tenant_id","pipeline_id","stage_id") REFERENCES "public"."crm_pipeline_stages"("tenant_id","pipeline_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_pipeline_stages" ADD CONSTRAINT "crm_pipeline_stages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_pipeline_stages" ADD CONSTRAINT "crm_pipeline_stages_tenant_pipeline_fk" FOREIGN KEY ("tenant_id","pipeline_id") REFERENCES "public"."crm_pipelines"("tenant_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_pipelines" ADD CONSTRAINT "crm_pipelines_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_tasks" ADD CONSTRAINT "crm_tasks_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_tasks" ADD CONSTRAINT "crm_tasks_tenant_contact_fk" FOREIGN KEY ("tenant_id","contact_id") REFERENCES "public"."crm_contacts"("tenant_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_tasks" ADD CONSTRAINT "crm_tasks_tenant_deal_fk" FOREIGN KEY ("tenant_id","deal_id") REFERENCES "public"."crm_deals"("tenant_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "crm_activities_tenant_occurred_idx" ON "crm_activities" USING btree ("tenant_id","occurred_at");--> statement-breakpoint
CREATE INDEX "crm_activities_tenant_contact_idx" ON "crm_activities" USING btree ("tenant_id","contact_id");--> statement-breakpoint
CREATE INDEX "crm_activities_tenant_deal_idx" ON "crm_activities" USING btree ("tenant_id","deal_id");--> statement-breakpoint
CREATE UNIQUE INDEX "crm_attachments_tenant_pathname_uidx" ON "crm_attachments" USING btree ("tenant_id","pathname");--> statement-breakpoint
CREATE INDEX "crm_attachments_tenant_contact_idx" ON "crm_attachments" USING btree ("tenant_id","contact_id");--> statement-breakpoint
CREATE INDEX "crm_attachments_tenant_deal_idx" ON "crm_attachments" USING btree ("tenant_id","deal_id");--> statement-breakpoint
CREATE UNIQUE INDEX "crm_contacts_tenant_external_ref_uidx" ON "crm_contacts" USING btree ("tenant_id","external_ref");--> statement-breakpoint
CREATE INDEX "crm_contacts_tenant_status_updated_idx" ON "crm_contacts" USING btree ("tenant_id","status","updated_at");--> statement-breakpoint
CREATE INDEX "crm_contacts_tenant_email_idx" ON "crm_contacts" USING btree ("tenant_id","email");--> statement-breakpoint
CREATE INDEX "crm_deals_tenant_status_updated_idx" ON "crm_deals" USING btree ("tenant_id","status","updated_at");--> statement-breakpoint
CREATE INDEX "crm_deals_tenant_stage_idx" ON "crm_deals" USING btree ("tenant_id","stage_id");--> statement-breakpoint
CREATE INDEX "crm_deals_tenant_contact_idx" ON "crm_deals" USING btree ("tenant_id","contact_id");--> statement-breakpoint
CREATE INDEX "crm_deals_pipeline_idx" ON "crm_deals" USING btree ("pipeline_id");--> statement-breakpoint
CREATE UNIQUE INDEX "crm_pipeline_stages_pipeline_key_uidx" ON "crm_pipeline_stages" USING btree ("pipeline_id","key");--> statement-breakpoint
CREATE UNIQUE INDEX "crm_pipeline_stages_pipeline_position_uidx" ON "crm_pipeline_stages" USING btree ("pipeline_id","position");--> statement-breakpoint
CREATE INDEX "crm_pipeline_stages_tenant_pipeline_idx" ON "crm_pipeline_stages" USING btree ("tenant_id","pipeline_id");--> statement-breakpoint
CREATE UNIQUE INDEX "crm_pipelines_tenant_key_uidx" ON "crm_pipelines" USING btree ("tenant_id","key");--> statement-breakpoint
CREATE INDEX "crm_pipelines_tenant_active_idx" ON "crm_pipelines" USING btree ("tenant_id","active");--> statement-breakpoint
CREATE INDEX "crm_tasks_tenant_status_due_idx" ON "crm_tasks" USING btree ("tenant_id","status","due_at");--> statement-breakpoint
CREATE INDEX "crm_tasks_tenant_contact_idx" ON "crm_tasks" USING btree ("tenant_id","contact_id");--> statement-breakpoint
CREATE INDEX "crm_tasks_tenant_deal_idx" ON "crm_tasks" USING btree ("tenant_id","deal_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tenants_slug_uidx" ON "tenants" USING btree ("slug");