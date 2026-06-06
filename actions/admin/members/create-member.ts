'use server'

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
    return { ok: false, error: 'Nome, e-mail, matrícula e senha são obrigatórios.' }
  }

  if (!ROLES.includes(roleRaw as (typeof ROLES)[number])) {
    return { ok: false, error: 'Cargo inválido.' }
  }

  const role = roleRaw as (typeof ROLES)[number]
  const hash = await hashPassword(password)

  if (role === 'assistant' && (await hasOtherActiveAssistant())) {
    return { ok: false, error: ASSISTANT_CONFLICT_MESSAGE }
  }

  try {
    await database.insert(membersInPing).values({
      name,
      email,
      enrollmentNumber,
      passwordHash: hash,
      role,
      disabled: false,
    })
  } catch (e: unknown) {
    if (isUniqueViolation(e)) {
      if (role === 'assistant') {
        return { ok: false, error: ASSISTANT_CONFLICT_MESSAGE }
      }
      return {
        ok: false,
        error: 'Este e-mail ou matrícula já está em uso.',
      }
    }
    console.error(e)
    return { ok: false, error: 'Não foi possível criar o membro. Tente novamente.' }
  }

  revalidatePath('/admin/members')
  return { ok: true }
}
