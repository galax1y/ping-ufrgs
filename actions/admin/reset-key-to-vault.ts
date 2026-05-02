'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import database from '@/database'
import {
  keyOwnershipLogInPing,
  keyRequestsInPing,
  keyStateInPing,
} from '@/database/drizzle/schema'
import { requireAdmin } from '@/lib/auth/guards'

export type ResetKeyResult = { ok: true } | { ok: false; error: string }

export async function resetKeyToVaultAction(): Promise<ResetKeyResult> {
  const admin = await requireAdmin()

  try {
    await database.transaction(async (tx) => {
      const [keyRow] = await tx
        .select()
        .from(keyStateInPing)
        .where(eq(keyStateInPing.id, 1))
        .limit(1)

      const previousHolderId = keyRow?.holderId ?? null

      await tx
        .update(keyStateInPing)
        .set({ holderId: null, heldSince: null })
        .where(eq(keyStateInPing.id, 1))

      await tx.insert(keyOwnershipLogInPing).values({
        previousHolderId,
        newHolderId: null,
        source: 'admin_action',
        actorId: admin.id,
        requestId: null,
        note: 'Key returned to assistant custody (vault)',
      })

      await tx
        .update(keyRequestsInPing)
        .set({
          status: 'cancelled',
          decidedById: admin.id,
          decidedAt: new Date(),
          decisionNote: 'Cancelled: key reset to vault by admin',
        })
        .where(eq(keyRequestsInPing.status, 'pending'))
    })
  } catch (e) {
    console.error(e)
    return { ok: false, error: 'Could not reset the key. Try again.' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/key-requests')
  revalidatePath('/dashboard/history')
  revalidatePath('/admin/members')
  return { ok: true }
}
