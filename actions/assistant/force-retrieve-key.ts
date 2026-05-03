'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import database from '@/database'
import {
  keyOwnershipLogInPing,
  keyRequestsInPing,
  keyStateInPing,
} from '@/database/drizzle/schema'
import { requireAssistant } from '@/lib/auth/guards'
import { isSameMember } from '@/lib/member-ids'

export type ForceRetrieveKeyResult =
  | { ok: true }
  | { ok: false; error: string }

/**
 * Assistant takes the key from whoever currently holds it (not vault).
 * Logged as assistant_return; pending requests are cancelled.
 */
export async function forceRetrieveKeyAction(): Promise<ForceRetrieveKeyResult> {
  const assistant = await requireAssistant()

  try {
    await database.transaction(async (tx) => {
      const [keyRow] = await tx
        .select()
        .from(keyStateInPing)
        .where(eq(keyStateInPing.id, 1))
        .limit(1)

      if (keyRow?.holderId == null) {
        throw new Error('IN_VAULT')
      }
      if (isSameMember(keyRow.holderId, assistant.id)) {
        throw new Error('ALREADY_HOLD')
      }

      const previousHolderId = keyRow.holderId
      const now = new Date()

      await tx
        .update(keyStateInPing)
        .set({
          holderId: assistant.id,
          heldSince: now,
        })
        .where(eq(keyStateInPing.id, 1))

      await tx
        .update(keyRequestsInPing)
        .set({
          status: 'cancelled',
          decidedById: assistant.id,
          decidedAt: now,
          decisionNote: 'Cancelled: assistant forcibly retrieved the key',
        })
        .where(eq(keyRequestsInPing.status, 'pending'))

      await tx.insert(keyOwnershipLogInPing).values({
        previousHolderId,
        newHolderId: assistant.id,
        source: 'assistant_return',
        actorId: assistant.id,
        requestId: null,
        note: 'Secretaria registrou devolução da chave',
      })
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : ''
    if (msg === 'IN_VAULT') {
      return {
        ok: false,
        error: 'The key is already in the vault. There is nothing to retrieve.',
      }
    }
    if (msg === 'ALREADY_HOLD') {
      return { ok: false, error: 'You are already holding the key.' }
    }
    console.error(e)
    return { ok: false, error: 'Could not retrieve the key. Try again.' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/key-requests')
  revalidatePath('/dashboard/history')
  revalidatePath('/admin/members')
  return { ok: true }
}
