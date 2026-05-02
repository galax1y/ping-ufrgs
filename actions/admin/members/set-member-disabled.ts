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
    return { ok: false, error: 'Invalid member.' }
  }

  if (disabled && isSameMember(memberId, admin.id)) {
    return { ok: false, error: 'You cannot disable your own account.' }
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
          'This member currently holds the key. Transfer or reset custody before disabling them.',
      }
    }
    if (msg === 'NOT_FOUND') {
      return { ok: false, error: 'Member not found.' }
    }
    if (isUniqueViolation(e)) {
      return { ok: false, error: ASSISTANT_CONFLICT_MESSAGE }
    }
    console.error(e)
    return { ok: false, error: 'Could not update the account. Try again.' }
  }

  revalidatePath('/admin/members')
  revalidatePath('/dashboard')
  return { ok: true }
}
