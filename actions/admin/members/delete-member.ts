'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import database from '@/database'
import { membersInPing } from '@/database/drizzle/schema'
import { requireAdmin } from '@/lib/auth/guards'

export type DeleteMemberResult =
  | { ok: true }
  | { ok: false; error: string }

export async function deleteMemberAction(id: string): Promise<DeleteMemberResult> {
  const admin = await requireAdmin()

  if (id === admin.id) {
    return { ok: false, error: 'You cannot delete your own account.' }
  }

  try {
    await database.delete(membersInPing).where(eq(membersInPing.id, id))
  } catch (e: unknown) {
    const code =
      e && typeof e === 'object' && 'code' in e
        ? String((e as { code: unknown }).code)
        : ''
    if (code === '23503') {
      return {
        ok: false,
        error:
          'This member cannot be deleted while they are referenced by keys, requests, or logs.',
      }
    }
    throw e
  }

  revalidatePath('/admin/members')
  return { ok: true }
}
