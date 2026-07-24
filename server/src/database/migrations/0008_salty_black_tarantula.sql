ALTER TABLE "users" ADD COLUMN "username" varchar(30);--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_unique" ON "users" USING btree ("username");