import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { eq } from 'drizzle-orm'

import database from '@/database'
import { membersInPing } from '@/database/drizzle/schema'

import { SESSION_COOKIE } from './constants'

export type PublicMember = {
  id: string
  name: string
  email: string
  enrollmentNumber: string
  role: 'admin' | 'member' | 'assistant'
}

function encodedSecret() {
  const s = process.env.SESSION_SECRET
  if (!s || s.length < 32) {
    throw new Error(
      'SESSION_SECRET must be set in the environment (at least 32 characters).',
    )
  }
  return new TextEncoder().encode(s)
}

export async function createSession(member: {
  id: string
  role: PublicMember['role']
}) {
  const token = await new SignJWT({ role: member.role })
    .setSubject(member.id)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedSecret())

  const jar = await cookies()
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function destroySession() {
  const jar = await cookies()
  jar.delete(SESSION_COOKIE)
}

export async function getSession(): Promise<{ member: PublicMember | null }> {
  try {
    const jar = await cookies()
    const raw = jar.get(SESSION_COOKIE)?.value
    if (!raw) return { member: null }

    const { payload } = await jwtVerify(raw, encodedSecret())
    const id = payload.sub
    const role = payload.role as PublicMember['role'] | undefined
    if (typeof id !== 'string' || !role) return { member: null }

    const [row] = await database
      .select({
        id: membersInPing.id,
        name: membersInPing.name,
        email: membersInPing.email,
        enrollmentNumber: membersInPing.enrollmentNumber,
        role: membersInPing.role,
        disabled: membersInPing.disabled,
      })
      .from(membersInPing)
      .where(eq(membersInPing.id, id))
      .limit(1)

    if (!row) {
      await destroySession()
      return { member: null }
    }

    if (row.disabled) {
      await destroySession()
      return { member: null }
    }

    return {
      member: {
        id: row.id,
        name: row.name,
        email: row.email,
        enrollmentNumber: row.enrollmentNumber,
        role: row.role,
      },
    }
  } catch {
    return { member: null }
  }
}
