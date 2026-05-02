CREATE SCHEMA IF NOT EXISTS "ping";
--> statement-breakpoint
DROP TABLE IF EXISTS "ping"."user_devices" CASCADE;
--> statement-breakpoint
DROP TABLE IF EXISTS "ping"."users" CASCADE;
--> statement-breakpoint
CREATE TYPE "ping"."key_change_source" AS ENUM('request_approved', 'member_trade', 'assistant_return', 'admin_action', 'initial');--> statement-breakpoint
CREATE TYPE "ping"."key_request_status" AS ENUM('pending', 'approved', 'denied', 'cancelled');--> statement-breakpoint
CREATE TYPE "ping"."member_role" AS ENUM('admin', 'member', 'assistant');--> statement-breakpoint
CREATE TYPE "ping"."room_change_source" AS ENUM('holder_action', 'admin_override');--> statement-breakpoint
CREATE TABLE "ping"."key_ownership_log" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"previous_holder_id" uuid,
	"new_holder_id" uuid,
	"source" "ping"."key_change_source" NOT NULL,
	"actor_id" uuid NOT NULL,
	"request_id" uuid,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ping"."key_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requester_id" uuid NOT NULL,
	"status" "ping"."key_request_status" DEFAULT 'pending' NOT NULL,
	"reason" text,
	"decided_by" uuid,
	"decided_at" timestamp with time zone,
	"decision_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ping"."key_state" (
	"id" smallint PRIMARY KEY DEFAULT 1 NOT NULL,
	"holder_id" uuid,
	"held_since" timestamp with time zone,
	CONSTRAINT "key_state_singleton_check" CHECK ("ping"."key_state"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE "ping"."members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"enrollment_number" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "ping"."member_role" DEFAULT 'member' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ping"."room_state" (
	"id" smallint PRIMARY KEY DEFAULT 1 NOT NULL,
	"name" text DEFAULT 'Room' NOT NULL,
	"is_open" boolean DEFAULT false NOT NULL,
	"status_changed_at" timestamp with time zone,
	"last_changed_by" uuid,
	CONSTRAINT "room_state_singleton_check" CHECK ("ping"."room_state"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE "ping"."room_status_log" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"is_open" boolean NOT NULL,
	"source" "ping"."room_change_source" NOT NULL,
	"actor_id" uuid NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ping"."key_ownership_log" ADD CONSTRAINT "key_ownership_log_previous_holder_id_members_id_fk" FOREIGN KEY ("previous_holder_id") REFERENCES "ping"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ping"."key_ownership_log" ADD CONSTRAINT "key_ownership_log_new_holder_id_members_id_fk" FOREIGN KEY ("new_holder_id") REFERENCES "ping"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ping"."key_ownership_log" ADD CONSTRAINT "key_ownership_log_actor_id_members_id_fk" FOREIGN KEY ("actor_id") REFERENCES "ping"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ping"."key_ownership_log" ADD CONSTRAINT "key_ownership_log_request_id_key_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "ping"."key_requests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ping"."key_requests" ADD CONSTRAINT "key_requests_requester_id_members_id_fk" FOREIGN KEY ("requester_id") REFERENCES "ping"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ping"."key_requests" ADD CONSTRAINT "key_requests_decided_by_members_id_fk" FOREIGN KEY ("decided_by") REFERENCES "ping"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ping"."key_state" ADD CONSTRAINT "key_state_holder_id_members_id_fk" FOREIGN KEY ("holder_id") REFERENCES "ping"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ping"."room_state" ADD CONSTRAINT "room_state_last_changed_by_members_id_fk" FOREIGN KEY ("last_changed_by") REFERENCES "ping"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ping"."room_status_log" ADD CONSTRAINT "room_status_log_actor_id_members_id_fk" FOREIGN KEY ("actor_id") REFERENCES "ping"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "key_requests_one_pending_per_requester_idx" ON "ping"."key_requests" USING btree ("requester_id") WHERE "ping"."key_requests"."status" = 'pending';--> statement-breakpoint
CREATE UNIQUE INDEX "members_email_unique" ON "ping"."members" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "members_enrollment_number_unique" ON "ping"."members" USING btree ("enrollment_number");--> statement-breakpoint
CREATE UNIQUE INDEX "members_one_assistant_idx" ON "ping"."members" USING btree ("role") WHERE "ping"."members"."role" = 'assistant';