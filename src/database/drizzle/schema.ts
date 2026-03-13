import { pgTable, pgSchema, unique, bigint, text, timestamp, foreignKey, uuid, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const ping = pgSchema("ping");


export const usersInPing = ping.table("users", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "ping.user_details_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	name: text().notNull(),
	email: text().notNull(),
	enrollmentNumber: text("enrollment_number").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("user_details_enrollment_number_key").on(table.enrollmentNumber),
]);

export const userDevicesInPing = ping.table("user_devices", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }),
	isActive: boolean("is_active").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	uniqueDeviceId: text("unique_device_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInPing.id],
			name: "user_devices_user_id_fkey"
		}).onUpdate("cascade"),
]);
