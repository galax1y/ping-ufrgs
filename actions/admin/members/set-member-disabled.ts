'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import database from '@/database'
import { keyStateInPing, membersInPing } from '@/database/drizzle/schema'
import {
  ASSISTANT_CONFLICT_MESSAGE,
  hasOtherActiveAssistant,
  isUniqueViolation,
} from '@/actions/admin/members/assistant-slot'
import { requireAdmin } from '@/lib/auth/guards'
import { isSameMember } from '@/lib/member-ids'

export type SetMemberDisabledResult =
  | { ok: true }
  | { ok: false; error: string }

export async function setMemberDisabledAction(
  memberId: string,
  disabled: boolean,
): Promise<SetMemberDisabledResult> {
  const admin = await requireAdmin()

  if (!memberId) {
    return { ok: false, error: 'Membro inválido.' }
  }

  if (disabled && isSameMember(memberId, admin.id)) {
    return { ok: false, error: 'Você não pode desabilitar a própria conta.' }
  }

  if (!disabled) {
    const [row] = await database
      .select({ role: membersInPing.role })
      .from(membersInPing)
      .where(eq(membersInPing.id, memberId))
      .limit(1)
    if (
      row?.role === 'assistant' &&
      (await hasOtherActiveAssistant(memberId))
    ) {
      return { ok: false, error: ASSISTANT_CONFLICT_MESSAGE }
    }
  }

  try {
    await database.transaction(async (tx) => {
      if (disabled) {
        const [keyRow] = await tx
          .select({ holderId: keyStateInPing.holderId })
          .from(keyStateInPing)
          .where(eq(keyStateInPing.id, 1))
          .limit(1)

        if (isSameMember(keyRow?.holderId, memberId)) {
          throw new Error('HOLDS_KEY')
        }
      }

      const [updated] = await tx
        .update(membersInPing)
        .set({ disabled, updatedAt: new Date() })
        .where(eq(membersInPing.id, memberId))
        .returning({ id: membersInPing.id })

      if (!updated) {
        throw new Error('NOT_FOUND')
      }
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : ''
    if (msg === 'HOLDS_KEY') {
      return {
        ok: false,
        error:
          'Este membro está com a chave. Transfira ou restaure a posse antes de desabilitá-lo.',
      }
    }
    if (msg === 'NOT_FOUND') {
      return { ok: false, error: 'Membro não encontrado.' }
    }
    if (isUniqueViolation(e)) {
      return { ok: false, error: ASSISTANT_CONFLICT_MESSAGE }
    }
    console.error(e)
    return { ok: false, error: 'Não foi possível atualizar a conta. Tente novamente.' }
  }

  revalidatePath('/admin/members')
  revalidatePath('/dashboard')
  return { ok: true }
}
