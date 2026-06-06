'use server'

import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'

import database from '@/database'
import { membersInPing } from '@/database/drizzle/schema'
import { verifyPassword } from '@/lib/auth/password'
import { createSession } from '@/lib/auth/session'

export type LoginState = { ok: true } | { ok: false; error: string }

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { ok: false, error: 'Informe e-mail e senha.' }
  }

  const [row] = await database
    .select()
    .from(membersInPing)
    .where(eq(membersInPing.email, email))
    .limit(1)

  if (!row) {
    return { ok: false, error: 'E-mail ou senha incorretos.' }
  }

  const valid = await verifyPassword(password, row.passwordHash)
  if (!valid) {
    return { ok: false, error: 'E-mail ou senha incorretos.' }
  }

  if (row.disabled) {
    return {
      ok: false,
      error: 'Esta conta foi desabilitada. Entre em contato com um administrador.',
    }
  }

  await createSession({ id: row.id, role: row.role })

  redirect('/dashboard')
}
