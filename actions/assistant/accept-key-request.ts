'use server'

import { and, eq, ne } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import database from '@/database'
import {
  keyOwnershipLogInPing,
  keyRequestsInPing,
  keyStateInPing,
  membersInPing,
} from '@/database/drizzle/schema'
import { requireAssistant } from '@/lib/auth/guards'

export type AcceptKeyRequestResult =
  | { ok: true }
  | { ok: false; error: string }

export async function acceptKeyRequestAction(
  requestId: string,
): Promise<AcceptKeyRequestResult> {
  const assistant = await requireAssistant()

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

      const [keyRow] = await tx
        .select()
        .from(keyStateInPing)
        .where(eq(keyStateInPing.id, 1))
        .limit(1)

      let holderRole: 'admin' | 'member' | 'assistant' | null = null
      if (keyRow?.holderId) {
        const [h] = await tx
          .select({ role: membersInPing.role })
          .from(membersInPing)
          .where(eq(membersInPing.id, keyRow.holderId))
          .limit(1)
        holderRole = h?.role ?? null
      }

      const keyWithAssistant =
        keyRow?.holderId == null || holderRole === 'assistant'

      if (!keyWithAssistant) {
        throw new Error('KEY_NOT_WITH_ASSISTANT')
      }

      const previousHolderId = keyRow?.holderId ?? null
      const decidedAt = new Date()

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
          decidedById: assistant.id,
          decidedAt,
          decisionNote: null,
        })
        .where(eq(keyRequestsInPing.id, requestId))

      await tx.insert(keyOwnershipLogInPing).values({
        previousHolderId,
        newHolderId: req.requesterId,
        source: 'request_approved',
        actorId: assistant.id,
        requestId: req.id,
        note: null,
      })

      await tx
        .update(keyRequestsInPing)
        .set({
          status: 'cancelled',
          decidedById: assistant.id,
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
    if (msg === 'KEY_NOT_WITH_ASSISTANT') {
      return {
        ok: false,
        error:
          'The key is not with the assistant anymore. Resolve custody first.',
      }
    }
    console.error(e)
    return { ok: false, error: 'Could not accept the request. Try again.' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/key-requests')
  revalidatePath('/admin/members')
  return { ok: true }
}
