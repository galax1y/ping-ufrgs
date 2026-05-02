-- Adds audit source for logging new key requests (PostgreSQL 9.1+).
-- Safe to re-run: ignores duplicate enum value.
DO $m$
BEGIN
  ALTER TYPE "ping"."key_change_source" ADD VALUE 'request_created';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$m$;
