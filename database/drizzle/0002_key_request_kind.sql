CREATE TYPE "ping"."key_request_kind" AS ENUM('assistant', 'holder');
--> statement-breakpoint
ALTER TABLE "ping"."key_requests" ADD COLUMN "kind" "ping"."key_request_kind" DEFAULT 'assistant' NOT NULL;
--> statement-breakpoint
ALTER TABLE "ping"."key_requests" ADD COLUMN "target_holder_id" uuid;
--> statement-breakpoint
ALTER TABLE "ping"."key_requests" ADD CONSTRAINT "key_requests_target_holder_id_members_id_fk" FOREIGN KEY ("target_holder_id") REFERENCES "ping"."members"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "ping"."key_requests" ADD CONSTRAINT "key_requests_kind_target_chk" CHECK ((kind = 'assistant' AND target_holder_id IS NULL) OR (kind = 'holder' AND target_holder_id IS NOT NULL));
