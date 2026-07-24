CREATE TYPE "public"."fundraiser_application_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'fundraiser' BEFORE 'admin';--> statement-breakpoint
ALTER TYPE "public"."campaign_status" ADD VALUE 'pending_review' BEFORE 'active';--> statement-breakpoint
ALTER TYPE "public"."campaign_status" ADD VALUE 'rejected' BEFORE 'completed';--> statement-breakpoint
CREATE TABLE "fundraiser_applications" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "fundraiser_applications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"display_name" varchar(150) NOT NULL,
	"cause_description" text NOT NULL,
	"identity_reference" varchar(120) NOT NULL,
	"contact_phone" varchar(30) NOT NULL,
	"status" "fundraiser_application_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by" bigint,
	"decision_reason" text,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "owner_id" bigint;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "rejection_reason" text;--> statement-breakpoint
ALTER TABLE "disbursements" ADD COLUMN "self_released" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "fundraiser_applications" ADD CONSTRAINT "fundraiser_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fundraiser_applications" ADD CONSTRAINT "fundraiser_applications_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "fundraiser_applications_user_idx" ON "fundraiser_applications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "fundraiser_applications_status_idx" ON "fundraiser_applications" USING btree ("status");--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "campaigns_owner_idx" ON "campaigns" USING btree ("owner_id");