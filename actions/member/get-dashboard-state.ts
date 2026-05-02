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
import { isSameMember } from '@/lib/member-ids'

export type DashboardState = {
  self: {
    id: string
    name: string
    email: string
    role: 'admin' | 'member' | 'assistant'
  }
  /** You are the current key holder (DB holder_id). */
  selfHoldsKey: boolean
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
  /**
   * Key is in assistant custody: vault (no holder) or an assistant member holds it.
   * Requests are only allowed in this state (and when you are not the holder).
   */
  keyWithAssistant: boolean
  /** You may submit a new request (assistant custody, you do not hold, no pending). Assistants never use this. */
  canRequestKey: boolean
  /**
   * Assistant only: another member (or admin) holds the key — you may forcibly retrieve it (confirmed in UI).
   */
  assistantCanForceRetrieve: boolean
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

  const selfHoldsKey = isSameMember(keyRow?.holderId, member.id)

  const [pendingRow] = await database
    .select({ id: keyRequestsInPing.id })
    .from(keyRequestsInPing)
    .where(
      and(
        eq(keyRequestsInPing.requesterId, member.id),
        eq(keyRequestsInPing.status, 'pending'),
      ),
    )
    .limit(1)
  const pendingRequestId = pendingRow?.id ?? null

  const canRequestKey =
    member.role !== 'assistant' &&
    !selfHoldsKey &&
    keyWithAssistant &&
    pendingRequestId === null

  const assistantCanForceRetrieve =
    member.role === 'assistant' &&
    keyRow?.holderId != null &&
    !isSameMember(keyRow.holderId, member.id)

  return {
    self: {
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
    },
    selfHoldsKey,
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
    assistantCanForceRetrieve,
    pendingRequestId,
  }
}
