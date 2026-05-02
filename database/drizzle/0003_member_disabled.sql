ALTER TABLE "ping"."members" ADD COLUMN "disabled" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
DROP INDEX IF EXISTS "ping"."members_one_assistant_idx";
--> statement-breakpoint
CREATE UNIQUE INDEX "members_one_assistant_idx" ON "ping"."members" USING btree ("role") WHERE "ping"."members"."role" = 'assistant' AND "ping"."members"."disabled" = false;
