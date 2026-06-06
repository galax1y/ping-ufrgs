'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import database from '@/database'
import {
  keyStateInPing,
  roomStateInPing,
  roomStatusLogInPing,
} from '@/database/drizzle/schema'
import { requireAuth } from '@/lib/auth/guards'
import { isSameMember } from '@/lib/member-ids'

export type ToggleRoomResult =
  | { ok: true; isOpen: boolean }
  | { ok: false; error: string }

/**
 * Only the current key holder may open/close the room (not the assistant role).
 * Logged as holder_action.
 */
export async function toggleRoomStateAction(): Promise<ToggleRoomResult> {
  const member = await requireAuth()

  if (member.role === 'assistant') {
    return {
      ok: false,
      error: 'A secretaria não pode alterar o status da sala por aqui.',
    }
  }

  const [keyRow] = await database
    .select()
    .from(keyStateInPing)
    .where(eq(keyStateInPing.id, 1))
    .limit(1)

  if (!isSameMember(keyRow?.holderId, member.id)) {
    return {
      ok: false,
      error: 'Somente quem está com a chave pode alterar o status da sala.',
    }
  }

  const [roomRow] = await database
    .select()
    .from(roomStateInPing)
    .where(eq(roomStateInPing.id, 1))
    .limit(1)

  if (!roomRow) {
    return { ok: false, error: 'A sala ainda não foi configurada.' }
  }

  const nextOpen = !roomRow.isOpen
  const now = new Date()

  await database.transaction(async (tx) => {
    await tx
      .update(roomStateInPing)
      .set({
        isOpen: nextOpen,
        statusChangedAt: now,
        lastChangedById: member.id,
      })
      .where(eq(roomStateInPing.id, 1))

    await tx.insert(roomStatusLogInPing).values({
      isOpen: nextOpen,
      source: 'holder_action',
      actorId: member.id,
      note: null,
    })
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/history')
  revalidatePath('/admin/members')
  return { ok: true, isOpen: nextOpen }
}
