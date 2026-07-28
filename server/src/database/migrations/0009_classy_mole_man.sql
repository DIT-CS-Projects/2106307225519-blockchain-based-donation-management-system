CREATE TYPE "public"."reward_event_type" AS ENUM('donation', 'first_donation', 'new_campaign');--> statement-breakpoint
CREATE TABLE "reward_events" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "reward_events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"type" "reward_event_type" NOT NULL,
	"points" bigint NOT NULL,
	"donation_id" bigint,
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reward_events" ADD CONSTRAINT "reward_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_events" ADD CONSTRAINT "reward_events_donation_id_donations_id_fk" FOREIGN KEY ("donation_id") REFERENCES "public"."donations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "reward_events_user_idx" ON "reward_events" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "reward_events_donation_type_unique" ON "reward_events" USING btree ("donation_id","type");