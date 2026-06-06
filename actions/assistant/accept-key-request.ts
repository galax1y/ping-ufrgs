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
    return { ok: false, error: 'Requisição inválida.' }
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
      if (req.kind !== 'assistant') {
        throw new Error('WRONG_KIND')
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
          decisionNote: 'Cancelada: chave entregue a outro membro',
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
      return { ok: false, error: 'Requisição não encontrada.' }
    }
    if (msg === 'NOT_PENDING') {
      return { ok: false, error: 'Esta requisição não está mais pendente.' }
    }
    if (msg === 'KEY_NOT_WITH_ASSISTANT') {
      return {
        ok: false,
        error:
          'A chave não está mais com a secretaria. Resolva a posse da chave primeiro.',
      }
    }
    if (msg === 'WRONG_KIND') {
      return {
        ok: false,
        error:
          'Esta requisição deve ser aceita por quem tem a chave, não pela secretaria.',
      }
    }
    console.error(e)
    return { ok: false, error: 'Não foi possível aceitar a requisição. Tente novamente.' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/key-requests')
  revalidatePath('/dashboard/history')
  revalidatePath('/admin/members')
  return { ok: true }
}
