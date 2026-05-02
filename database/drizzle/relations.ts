import { relations } from 'drizzle-orm'
import {
  keyOwnershipLogInPing,
  keyRequestsInPing,
  keyStateInPing,
  membersInPing,
  roomStateInPing,
  roomStatusLogInPing,
} from './schema'

export const membersInPingRelations = relations(membersInPing, ({ one, many }) => ({
  keyRequestsAsRequester: many(keyRequestsInPing, {
    relationName: 'keyRequestRequester',
  }),
  keyRequestsDecided: many(keyRequestsInPing, {
    relationName: 'keyRequestDecider',
  }),
  keyOwnershipLogsAsActor: many(keyOwnershipLogInPing, {
    relationName: 'keyOwnershipLogActor',
  }),
  keyOwnershipLogsAsPreviousHolder: many(keyOwnershipLogInPing, {
    relationName: 'keyOwnershipLogPreviousHolder',
  }),
  keyOwnershipLogsAsNewHolder: many(keyOwnershipLogInPing, {
    relationName: 'keyOwnershipLogNewHolder',
  }),
  roomStatusLogsAsActor: many(roomStatusLogInPing),
  keyStateIfHolder: one(keyStateInPing, {
    fields: [membersInPing.id],
    references: [keyStateInPing.holderId],
  }),
  roomStateIfLastChangedBy: one(roomStateInPing, {
    fields: [membersInPing.id],
    references: [roomStateInPing.lastChangedById],
  }),
}))

export const roomStateInPingRelations = relations(roomStateInPing, ({ one }) => ({
  lastChangedBy: one(membersInPing, {
    fields: [roomStateInPing.lastChangedById],
    references: [membersInPing.id],
  }),
}))

export const keyStateInPingRelations = relations(keyStateInPing, ({ one }) => ({
  holder: one(membersInPing, {
    fields: [keyStateInPing.holderId],
    references: [membersInPing.id],
  }),
}))

export const keyRequestsInPingRelations = relations(keyRequestsInPing, ({ one, many }) => ({
  requester: one(membersInPing, {
    relationName: 'keyRequestRequester',
    fields: [keyRequestsInPing.requesterId],
    references: [membersInPing.id],
  }),
  decider: one(membersInPing, {
    relationName: 'keyRequestDecider',
    fields: [keyRequestsInPing.decidedById],
    references: [membersInPing.id],
  }),
  keyOwnershipLogs: many(keyOwnershipLogInPing),
}))

export const keyOwnershipLogInPingRelations = relations(keyOwnershipLogInPing, ({ one }) => ({
  previousHolder: one(membersInPing, {
    relationName: 'keyOwnershipLogPreviousHolder',
    fields: [keyOwnershipLogInPing.previousHolderId],
    references: [membersInPing.id],
  }),
  newHolder: one(membersInPing, {
    relationName: 'keyOwnershipLogNewHolder',
    fields: [keyOwnershipLogInPing.newHolderId],
    references: [membersInPing.id],
  }),
  actor: one(membersInPing, {
    relationName: 'keyOwnershipLogActor',
    fields: [keyOwnershipLogInPing.actorId],
    references: [membersInPing.id],
  }),
  request: one(keyRequestsInPing, {
    fields: [keyOwnershipLogInPing.requestId],
    references: [keyRequestsInPing.id],
  }),
}))

export const roomStatusLogInPingRelations = relations(roomStatusLogInPing, ({ one }) => ({
  actor: one(membersInPing, {
    fields: [roomStatusLogInPing.actorId],
    references: [membersInPing.id],
  }),
}))
