import { sql } from 'drizzle-orm'
import {
  bigserial,
  boolean,
  check,
  pgSchema,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

export const ping = pgSchema('ping')

export const memberRoleEnum = ping.enum('member_role', ['admin', 'member', 'assistant'])

export const keyRequestStatusEnum = ping.enum('key_request_status', [
  'pending',
  'approved',
  'denied',
  'cancelled',
])

export const keyChangeSourceEnum = ping.enum('key_change_source', [
  'request_approved',
  'member_trade',
  'assistant_return',
  'admin_action',
  'initial',
])

export const roomChangeSourceEnum = ping.enum('room_change_source', [
  'holder_action',
  'admin_override',
])

export const membersInPing = ping.table(
  'members',
  {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    enrollmentNumber: text('enrollment_number').notNull(),
    passwordHash: text('password_hash').notNull(),
    role: memberRoleEnum('role').notNull().default('member'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex('members_email_unique').on(table.email),
    uniqueIndex('members_enrollment_number_unique').on(table.enrollmentNumber),
    uniqueIndex('members_one_assistant_idx')
      .on(table.role)
      .where(sql`${table.role} = 'assistant'`),
  ],
)

export const roomStateInPing = ping.table(
  'room_state',
  {
    id: smallint('id').primaryKey().default(1).notNull(),
    name: text('name').notNull().default('Room'),
    isOpen: boolean('is_open').notNull().default(false),
    statusChangedAt: timestamp('status_changed_at', { withTimezone: true, mode: 'date' }),
    lastChangedById: uuid('last_changed_by').references(() => membersInPing.id, {
      onDelete: 'set null',
    }),
  },
  (table) => [check('room_state_singleton_check', sql`${table.id} = 1`)],
)

export const keyStateInPing = ping.table(
  'key_state',
  {
    id: smallint('id').primaryKey().default(1).notNull(),
    holderId: uuid('holder_id').references(() => membersInPing.id, {
      onDelete: 'set null',
    }),
    heldSince: timestamp('held_since', { withTimezone: true, mode: 'date' }),
  },
  (table) => [check('key_state_singleton_check', sql`${table.id} = 1`)],
)

export const keyRequestsInPing = ping.table(
  'key_requests',
  {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    requesterId: uuid('requester_id')
      .notNull()
      .references(() => membersInPing.id, { onDelete: 'restrict' }),
    status: keyRequestStatusEnum('status').notNull().default('pending'),
    reason: text('reason'),
    decidedById: uuid('decided_by').references(() => membersInPing.id, {
      onDelete: 'set null',
    }),
    decidedAt: timestamp('decided_at', { withTimezone: true, mode: 'date' }),
    decisionNote: text('decision_note'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex('key_requests_one_pending_per_requester_idx')
      .on(table.requesterId)
      .where(sql`${table.status} = 'pending'`),
  ],
)

export const keyOwnershipLogInPing = ping.table('key_ownership_log', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  previousHolderId: uuid('previous_holder_id').references(() => membersInPing.id, {
    onDelete: 'set null',
  }),
  newHolderId: uuid('new_holder_id').references(() => membersInPing.id, {
    onDelete: 'set null',
  }),
  source: keyChangeSourceEnum('source').notNull(),
  actorId: uuid('actor_id')
    .notNull()
    .references(() => membersInPing.id, { onDelete: 'restrict' }),
  requestId: uuid('request_id').references(() => keyRequestsInPing.id, {
    onDelete: 'set null',
  }),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
})

export const roomStatusLogInPing = ping.table('room_status_log', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  isOpen: boolean('is_open').notNull(),
  source: roomChangeSourceEnum('source').notNull(),
  actorId: uuid('actor_id')
    .notNull()
    .references(() => membersInPing.id, { onDelete: 'restrict' }),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
})
