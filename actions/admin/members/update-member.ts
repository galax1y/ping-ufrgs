'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import database from '@/database'
import { membersInPing } from '@/database/drizzle/schema'
import {
  ASSISTANT_CONFLICT_MESSAGE,
  hasOtherActiveAssistant,
  isUniqueViolation,
} from '@/actions/admin/members/assistant-slot'
import { hashPassword } from '@/lib/auth/password'
import { requireAdmin } from '@/lib/auth/guards'

const ROLES = ['admin', 'member', 'assistant'] as const

export type UpdateMemberResult =
  | { ok: true }
  | { ok: false; error: string }

export async function updateMemberAction(
  formData: FormData,
): Promise<UpdateMemberResult> {
  await requireAdmin()

  const id = String(formData.get('id') ?? '')
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()
  const enrollmentNumber = String(formData.get('enrollmentNumber') ?? '').trim()
  const password = String(formData.get('password') ?? '').trim()
  const roleRaw = String(formData.get('role') ?? 'member')

  if (!id || !name || !email || !enrollmentNumber) {
    return { ok: false, error: 'Missing required fields.' }
  }

  if (!ROLES.includes(roleRaw as (typeof ROLES)[number])) {
    return { ok: false, error: 'Invalid role.' }
  }

  const role = roleRaw as (typeof ROLES)[number]

  const updates: {
    name: string
    email: string
    enrollmentNumber: string
    role: typeof role
    passwordHash?: string
    updatedAt: Date
  } = {
    name,
    email,
    enrollmentNumber,
    role,
    updatedAt: new Date(),
  }

  if (password) {
    updates.passwordHash = await hashPassword(password)
  }

  if (role === 'assistant' && (await hasOtherActiveAssistant(id))) {
    return { ok: false, error: ASSISTANT_CONFLICT_MESSAGE }
  }

  try {
    await database
      .update(membersInPing)
      .set(updates)
      .where(eq(membersInPing.id, id))
  } catch (e: unknown) {
    if (isUniqueViolation(e)) {
      if (role === 'assistant') {
        return { ok: false, error: ASSISTANT_CONFLICT_MESSAGE }
      }
      return {
        ok: false,
        error: 'That email or enrollment number is already in use.',
      }
    }
    console.error(e)
    return { ok: false, error: 'Could not update the member. Try again.' }
  }

  revalidatePath('/admin/members')
  return { ok: true }
}
