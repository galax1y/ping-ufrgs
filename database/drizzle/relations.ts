import { relations } from "drizzle-orm/relations";
import { usersInPing, userDevicesInPing } from "./schema";

export const userDevicesInPingRelations = relations(userDevicesInPing, ({one}) => ({
	usersInPing: one(usersInPing, {
		fields: [userDevicesInPing.userId],
		references: [usersInPing.id]
	}),
}));

export const usersInPingRelations = relations(usersInPing, ({many}) => ({
	userDevicesInPings: many(userDevicesInPing),
}));