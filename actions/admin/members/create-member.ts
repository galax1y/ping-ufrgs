'use server'

import { revalidatePath } from 'next/cache'

import database from '@/database'
import { membersInPing } from '@/database/drizzle/schema'
import { hashPassword } from '@/lib/auth/password'
import { requireAdmin } from '@/lib/auth/guards'

const ROLES = ['admin', 'member', 'assistant'] as const

export type CreateMemberResult =
  | { ok: true }
  | { ok: false; error: string }

export async function createMemberAction(
  formData: FormData,
): Promise<CreateMemberResult> {
  await requireAdmin()

  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()
  const enrollmentNumber = String(formData.get('enrollmentNumber') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const roleRaw = String(formData.get('role') ?? 'member')

  if (!name || !email || !enrollmentNumber || !password) {
    return { ok: false, error: 'Name, email, enrollment, and password are required.' }
  }

  if (!ROLES.includes(roleRaw as (typeof ROLES)[number])) {
    return { ok: false, error: 'Invalid role.' }
  }

  const role = roleRaw as (typeof ROLES)[number]
  const hash = await hashPassword(password)

  try {
    await database.insert(membersInPing).values({
      name,
      email,
      enrollmentNumber,
      passwordHash: hash,
      role,
    })
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
