'use server'

import { and, eq } from 'drizzle-orm'

import database from '@/database'
import {
  keyRequestsInPing,
  keyStateInPing,
  membersInPing,
  roomStateInPing,
} from '@/database/drizzle/schema'
import { requireAuth } from '@/lib/auth/guards'

export type DashboardState = {
  self: {
    id: string
    name: string
    email: string
    role: 'admin' | 'member' | 'assistant'
  }
  room: {
    name: string
    isOpen: boolean
    statusChangedAt: Date | null
    lastChangedByName: string | null
  } | null
  key: {
    holderId: string | null
    holderName: string | null
    holderRole: 'admin' | 'member' | 'assistant' | null
    heldSince: Date | null
  }
  /** Key is with the assistant (vault) or the assistant member is the holder. */
  keyWithAssistant: boolean
  canRequestKey: boolean
  pendingRequestId: string | null
}

export async function getDashboardState(): Promise<DashboardState> {
  const member = await requireAuth()

  const [roomRow] = await database
    .select()
    .from(roomStateInPing)
    .where(eq(roomStateInPing.id, 1))
    .limit(1)

  const [keyRow] = await database
    .select()
    .from(keyStateInPing)
    .where(eq(keyStateInPing.id, 1))
    .limit(1)

  let holderName: string | null = null
  let holderRole: DashboardState['key']['holderRole'] = null

  if (keyRow?.holderId) {
    const [h] = await database
      .select({
        name: membersInPing.name,
        role: membersInPing.role,
      })
      .from(membersInPing)
      .where(eq(membersInPing.id, keyRow.holderId))
      .limit(1)
    if (h) {
      holderName = h.name
      holderRole = h.role
    }
  }

  let lastChangedByName: string | null = null
  if (roomRow?.lastChangedById) {
    const [lb] = await database
      .select({ name: membersInPing.name })
      .from(membersInPing)
      .where(eq(membersInPing.id, roomRow.lastChangedById))
      .limit(1)
    lastChangedByName = lb?.name ?? null
  }

  const keyWithAssistant =
    keyRow?.holderId == null || holderRole === 'assistant'

  let pendingRequestId: string | null = null
  if (member.role === 'member') {
    const [pr] = await database
      .select({ id: keyRequestsInPing.id })
      .from(keyRequestsInPing)
      .where(
        and(
          eq(keyRequestsInPing.requesterId, member.id),
          eq(keyRequestsInPing.status, 'pending'),
        ),
      )
      .limit(1)
    pendingRequestId = pr?.id ?? null
  }

  const canRequestKey =
    member.role === 'member' &&
    keyWithAssistant &&
    pendingRequestId === null

  return {
    self: {
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
    },
    room: roomRow
      ? {
          name: roomRow.name,
          isOpen: roomRow.isOpen,
          statusChangedAt: roomRow.statusChangedAt ?? null,
          lastChangedByName,
        }
      : null,
    key: {
      holderId: keyRow?.holderId ?? null,
      holderName,
      holderRole,
      heldSince: keyRow?.heldSince ?? null,
    },
    keyWithAssistant,
    canRequestKey,
    pendingRequestId,
  }
}
