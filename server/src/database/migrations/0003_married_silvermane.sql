CREATE TYPE "public"."payment_method" AS ENUM('mobile_money', 'bank');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'success', 'failed', 'cancelled', 'expired');--> statement-breakpoint
CREATE TYPE "public"."proof_status" AS ENUM('pending', 'confirmed', 'failed');--> statement-breakpoint
CREATE TABLE "blockchain_records" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "blockchain_records_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"donation_id" bigint NOT NULL,
	"status" "proof_status" DEFAULT 'pending' NOT NULL,
	"tx_hash" varchar(66),
	"network" varchar(40),
	"block_number" bigint,
	"recorded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "donations" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "donations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"donor_id" bigint NOT NULL,
	"campaign_id" bigint NOT NULL,
	"amount" bigint NOT NULL,
	"currency" varchar(8) DEFAULT 'TZS' NOT NULL,
	"payment_reference" varchar(64) NOT NULL,
	"receipt_number" varchar(32) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_transactions" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "payment_transactions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"reference" varchar(64) NOT NULL,
	"donor_id" bigint NOT NULL,
	"campaign_id" bigint NOT NULL,
	"amount" bigint NOT NULL,
	"currency" varchar(8) DEFAULT 'TZS' NOT NULL,
	"method" "payment_method" NOT NULL,
	"provider" varchar(40) NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"checkout_token" varchar(64) NOT NULL,
	"checkout_url" text NOT NULL,
	"provider_response" jsonb,
	"donation_id" bigint,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blockchain_records" ADD CONSTRAINT "blockchain_records_donation_id_donations_id_fk" FOREIGN KEY ("donation_id") REFERENCES "public"."donations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_donor_id_users_id_fk" FOREIGN KEY ("donor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_donor_id_users_id_fk" FOREIGN KEY ("donor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_donation_id_donations_id_fk" FOREIGN KEY ("donation_id") REFERENCES "public"."donations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "blockchain_records_donation_unique" ON "blockchain_records" USING btree ("donation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "donations_receipt_number_unique" ON "donations" USING btree ("receipt_number");--> statement-breakpoint
CREATE INDEX "donations_donor_idx" ON "donations" USING btree ("donor_id");--> statement-breakpoint
CREATE INDEX "donations_campaign_idx" ON "donations" USING btree ("campaign_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_transactions_reference_unique" ON "payment_transactions" USING btree ("reference");--> statement-breakpoint
CREATE INDEX "payment_transactions_donor_idx" ON "payment_transactions" USING btree ("donor_id");--> statement-breakpoint
CREATE INDEX "payment_transactions_status_idx" ON "payment_transactions" USING btree ("status");