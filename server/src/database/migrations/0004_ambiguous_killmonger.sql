CREATE TYPE "public"."user_status" AS ENUM('active', 'suspended', 'deactivated');--> statement-breakpoint
CREATE TYPE "public"."disbursement_decision" AS ENUM('approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."disbursement_status" AS ENUM('pending_approval', 'approved', 'processing', 'completed', 'failed', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('donation_success', 'donation_failed', 'campaign_published', 'campaign_closed', 'campaign_goal_achieved', 'beneficiary_updated', 'password_changed', 'system_announcement');--> statement-breakpoint
CREATE TABLE "beneficiaries" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "beneficiaries_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"campaign_id" bigint NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text NOT NULL,
	"category" varchar(80),
	"location" varchar(150),
	"contact_info" text,
	"image_url" text,
	"verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp with time zone,
	"verified_by" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "disbursement_approvals" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "disbursement_approvals_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"disbursement_id" bigint NOT NULL,
	"admin_id" bigint NOT NULL,
	"decision" "disbursement_decision" NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "disbursements" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "disbursements_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"campaign_id" bigint NOT NULL,
	"beneficiary_id" bigint NOT NULL,
	"amount" bigint NOT NULL,
	"purpose" text NOT NULL,
	"status" "disbursement_status" DEFAULT 'pending_approval' NOT NULL,
	"initiated_by" bigint NOT NULL,
	"rejection_reason" text,
	"payout_reference" varchar(64),
	"provider_response" jsonb,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "notifications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" varchar(150) NOT NULL,
	"message" text NOT NULL,
	"link" text,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "audit_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"action" varchar(80) NOT NULL,
	"entity_type" varchar(40),
	"entity_id" bigint,
	"details" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blockchain_records" ALTER COLUMN "donation_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status" "user_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "blockchain_records" ADD COLUMN "disbursement_id" bigint;--> statement-breakpoint
ALTER TABLE "beneficiaries" ADD CONSTRAINT "beneficiaries_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beneficiaries" ADD CONSTRAINT "beneficiaries_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disbursement_approvals" ADD CONSTRAINT "disbursement_approvals_disbursement_id_disbursements_id_fk" FOREIGN KEY ("disbursement_id") REFERENCES "public"."disbursements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disbursement_approvals" ADD CONSTRAINT "disbursement_approvals_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disbursements" ADD CONSTRAINT "disbursements_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disbursements" ADD CONSTRAINT "disbursements_beneficiary_id_beneficiaries_id_fk" FOREIGN KEY ("beneficiary_id") REFERENCES "public"."beneficiaries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disbursements" ADD CONSTRAINT "disbursements_initiated_by_users_id_fk" FOREIGN KEY ("initiated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "beneficiaries_campaign_idx" ON "beneficiaries" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "beneficiaries_verified_idx" ON "beneficiaries" USING btree ("verified");--> statement-breakpoint
CREATE INDEX "disbursement_approvals_disbursement_idx" ON "disbursement_approvals" USING btree ("disbursement_id");--> statement-breakpoint
CREATE UNIQUE INDEX "disbursements_payout_reference_unique" ON "disbursements" USING btree ("payout_reference");--> statement-breakpoint
CREATE INDEX "disbursements_campaign_idx" ON "disbursements" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "disbursements_status_idx" ON "disbursements" USING btree ("status");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_user_read_idx" ON "notifications" USING btree ("user_id","read");--> statement-breakpoint
CREATE INDEX "audit_logs_user_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_logs_created_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "blockchain_records" ADD CONSTRAINT "blockchain_records_disbursement_id_disbursements_id_fk" FOREIGN KEY ("disbursement_id") REFERENCES "public"."disbursements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "blockchain_records_disbursement_unique" ON "blockchain_records" USING btree ("disbursement_id");