'use server'

import { and, asc, eq } from 'drizzle-orm'

import database from '@/database'
import {
  keyRequestsInPing,
  keyStateInPing,
  membersInPing,
  roomStateInPing,
} from '@/database/drizzle/schema'
import { requireAuth } from '@/lib/auth/guards'
import { isSameMember } from '@/lib/member-ids'
import { memberPhotoVersion } from '@/lib/profile-picture-data-url'

export type IncomingHolderKeyRequestRow = {
  id: string
  createdAt: string
  requesterId: string
  requesterName: string
  requesterEmail: string
  requesterPhotoVersion: number | null
  reason: string | null
}

export type DashboardState = {
  self: {
    id: string
    name: string
    email: string
    role: 'admin' | 'member' | 'assistant'
    photoVersion: number | null
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
   * You may ask the current member/admin holder for the key (not assistant custody).
   * Assistants never use this.
   */
  canRequestKeyFromHolder: boolean
  /** Pending requests from others asking you (the current holder) for the key. */
  incomingHolderRequests: IncomingHolderKeyRequestRow[]
  /**
   * Assistant only: another member (or admin) holds the key — you may forcibly retrieve it (confirmed in UI).
   */
  assistantCanForceRetrieve: boolean
  pendingRequestId: string | null
}

export async function getDashboardState(): Promise<DashboardState> {
  const member = await requireAuth()

  const [selfRow] = await database
    .select({
      profilePicture: membersInPing.profilePicture,
      updatedAt: membersInPing.updatedAt,
    })
    .from(membersInPing)
    .where(eq(membersInPing.id, member.id))
    .limit(1)

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

  const canRequestKeyFromHolder =
    member.role !== 'assistant' &&
    !selfHoldsKey &&
    !keyWithAssistant &&
    keyRow?.holderId != null &&
    !isSameMember(keyRow.holderId, member.id) &&
    pendingRequestId === null

  let incomingHolderRequests: IncomingHolderKeyRequestRow[] = []
  if (member.role !== 'assistant') {
    const incomingRows = await database
      .select({
        id: keyRequestsInPing.id,
        createdAt: keyRequestsInPing.createdAt,
        reason: keyRequestsInPing.reason,
        requesterId: keyRequestsInPing.requesterId,
        requesterName: membersInPing.name,
        requesterEmail: membersInPing.email,
        profilePicture: membersInPing.profilePicture,
        updatedAt: membersInPing.updatedAt,
      })
      .from(keyRequestsInPing)
      .innerJoin(
        membersInPing,
        eq(keyRequestsInPing.requesterId, membersInPing.id),
      )
      .where(
        and(
          eq(keyRequestsInPing.status, 'pending'),
          eq(keyRequestsInPing.kind, 'holder'),
          eq(keyRequestsInPing.targetHolderId, member.id),
        ),
      )
      .orderBy(asc(keyRequestsInPing.createdAt))

    incomingHolderRequests = incomingRows.map((r) => ({
      id: r.id,
      createdAt: r.createdAt.toISOString(),
      requesterId: r.requesterId,
      requesterName: r.requesterName,
      requesterEmail: r.requesterEmail,
      requesterPhotoVersion: memberPhotoVersion(
        r.updatedAt,
        r.profilePicture != null,
      ),
      reason: r.reason,
    }))
  }

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
      photoVersion: memberPhotoVersion(
        selfRow?.updatedAt ?? new Date(0),
        selfRow?.profilePicture != null,
      ),
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
    canRequestKeyFromHolder,
    incomingHolderRequests,
    assistantCanForceRetrieve,
    pendingRequestId,
  }
}
