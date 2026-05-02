'use server'

import { and, eq, ne } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import database from '@/database'
import {
  keyOwnershipLogInPing,
  keyRequestsInPing,
  keyStateInPing,
} from '@/database/drizzle/schema'
import { requireAuth } from '@/lib/auth/guards'
import { isSameMember } from '@/lib/member-ids'

export type AcceptKeyRequestFromHolderResult =
  | { ok: true }
  | { ok: false; error: string }

/**
 * Current key holder (member or admin) approves another member’s request
 * to receive the key directly.
 */
export async function acceptKeyRequestFromHolderAction(
  requestId: string,
): Promise<AcceptKeyRequestFromHolderResult> {
  const holder = await requireAuth()

  if (holder.role === 'assistant') {
    return {
      ok: false,
      error: 'Use the assistant request queue for vault handovers.',
    }
  }

  if (!requestId) {
    return { ok: false, error: 'Invalid request.' }
  }

  try {
    await database.transaction(async (tx) => {
      const [req] = await tx
        .select()
        .from(keyRequestsInPing)
        .where(eq(keyRequestsInPing.id, requestId))
        .limit(1)

      if (!req) {
        throw new Error('NOT_FOUND')
      }
      if (req.status !== 'pending') {
        throw new Error('NOT_PENDING')
      }
      if (req.kind !== 'holder' || req.targetHolderId == null) {
        throw new Error('WRONG_KIND')
      }
      if (!isSameMember(req.targetHolderId, holder.id)) {
        throw new Error('NOT_YOUR_REQUEST')
      }

      const [keyRow] = await tx
        .select()
        .from(keyStateInPing)
        .where(eq(keyStateInPing.id, 1))
        .limit(1)

      if (!isSameMember(keyRow?.holderId, holder.id)) {
        throw new Error('NO_LONGER_HOLDER')
      }

      const decidedAt = new Date()
      const previousHolderId = keyRow?.holderId ?? null

      await tx
        .update(keyStateInPing)
        .set({
          holderId: req.requesterId,
          heldSince: decidedAt,
        })
        .where(eq(keyStateInPing.id, 1))

      await tx
        .update(keyRequestsInPing)
        .set({
          status: 'approved',
          decidedById: holder.id,
          decidedAt,
          decisionNote: null,
        })
        .where(eq(keyRequestsInPing.id, requestId))

      await tx.insert(keyOwnershipLogInPing).values({
        previousHolderId,
        newHolderId: req.requesterId,
        source: 'request_approved',
        actorId: holder.id,
        requestId: req.id,
        note: null,
      })

      await tx
        .update(keyRequestsInPing)
        .set({
          status: 'cancelled',
          decidedById: holder.id,
          decidedAt,
          decisionNote: 'Cancelled: key issued to another member',
        })
        .where(
          and(
            eq(keyRequestsInPing.status, 'pending'),
            ne(keyRequestsInPing.id, requestId),
          ),
        )
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : ''
    if (msg === 'NOT_FOUND') {
      return { ok: false, error: 'Request not found.' }
    }
    if (msg === 'NOT_PENDING') {
      return { ok: false, error: 'This request is no longer pending.' }
    }
    if (msg === 'WRONG_KIND') {
      return { ok: false, error: 'This is not a holder-to-holder request.' }
    }
    if (msg === 'NOT_YOUR_REQUEST') {
      return {
        ok: false,
        error: 'Only the person this was sent to can accept it.',
      }
    }
    if (msg === 'NO_LONGER_HOLDER') {
      return {
        ok: false,
        error: 'You no longer hold the key — this request is stale.',
      }
    }
    console.error(e)
    return { ok: false, error: 'Could not accept the request. Try again.' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/key-requests')
  revalidatePath('/dashboard/history')
  revalidatePath('/admin/members')
  return { ok: true }
}
