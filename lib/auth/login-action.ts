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
    return { ok: false, error: 'Email and password are required.' }
  }

  const [row] = await database
    .select()
    .from(membersInPing)
    .where(eq(membersInPing.email, email))
    .limit(1)

  if (!row) {
    return { ok: false, error: 'Invalid email or password.' }
  }

  const valid = await verifyPassword(password, row.passwordHash)
  if (!valid) {
    return { ok: false, error: 'Invalid email or password.' }
  }

  await createSession({ id: row.id, role: row.role })

  if (row.role === 'admin') {
    redirect('/admin/members')
  }
  redirect('/dashboard')
}
