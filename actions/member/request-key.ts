'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import database from '@/database'
import {
  keyOwnershipLogInPing,
  keyRequestsInPing,
  keyStateInPing,
  membersInPing,
} from '@/database/drizzle/schema'
import { requireAuth } from '@/lib/auth/guards'
import { isSameMember } from '@/lib/member-ids'

export type RequestKeyResult =
  | { ok: true }
  | { ok: false; error: string }

export async function requestKeyAction(reason: string): Promise<RequestKeyResult> {
  const member = await requireAuth()

  if (member.role === 'assistant') {
    return {
      ok: false,
      error: 'Assistants cannot use member requests. Retrieve the key from the dashboard if needed.',
    }
  }

  try {
    const result = await database.transaction(
      async (tx): Promise<{ ok: true } | { error: string }> => {
        const [keyRow] = await tx
          .select()
          .from(keyStateInPing)
          .where(eq(keyStateInPing.id, 1))
          .limit(1)

        if (isSameMember(keyRow?.holderId, member.id)) {
          return { error: 'You already have the key.' }
        }

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
          return {
            error:
              'The key is not with the assistant right now. Ask the current holder.',
          }
        }

        const [existing] = await tx
          .select({ id: keyRequestsInPing.id })
          .from(keyRequestsInPing)
          .where(
            and(
              eq(keyRequestsInPing.requesterId, member.id),
              eq(keyRequestsInPing.status, 'pending'),
            ),
          )
          .limit(1)

        if (existing) {
          return { error: 'Você já tem um requisição pendente.' }
        }

        const trimmedReason = reason.trim() || null

        const [inserted] = await tx
          .insert(keyRequestsInPing)
          .values({
            requesterId: member.id,
            kind: 'assistant',
            targetHolderId: null,
            reason: trimmedReason,
            status: 'pending',
          })
          .returning({ id: keyRequestsInPing.id })

        if (!inserted?.id) {
          throw new Error('INSERT_FAILED')
        }

        await tx.insert(keyOwnershipLogInPing).values({
          previousHolderId: null,
          newHolderId: null,
          source: 'request_created',
          actorId: member.id,
          requestId: inserted.id,
          note: trimmedReason,
        })

        return { ok: true }
      })

    if ('error' in result) {
      return { ok: false, error: result.error }
    }
  } catch (e: unknown) {
    const code =
      e && typeof e === 'object' && 'code' in e
        ? String((e as { code: unknown }).code)
        : ''
    if (code === '23505') {
      return { ok: false, error: 'Você já tem um requisição pendente.' }
    }
    if (e instanceof Error && e.message === 'INSERT_FAILED') {
      return { ok: false, error: 'Could not create the request. Try again.' }
    }
    console.error(e)
    return { ok: false, error: 'Could not create the request. Try again.' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/key-requests')
  revalidatePath('/dashboard/history')
  return { ok: true }
}
