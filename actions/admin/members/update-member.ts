'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import database from '@/database'
import { membersInPing } from '@/database/drizzle/schema'
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

  try {
    await database
      .update(membersInPing)
      .set(updates)
      .where(eq(membersInPing.id, id))
  } catch (e: unknown) {
    const code =
      e && typeof e === 'object' && 'code' in e
        ? String((e as { code: unknown }).code)
        : ''
    if (code === '23505') {
      return {
        ok: false,
        error:
          'Unique constraint failed (email, enrollment, or only one assistant allowed).',
      }
    }
    throw e
  }

  revalidatePath('/admin/members')
  return { ok: true }
}
