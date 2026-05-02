/**
 * TEMPORARY DEV/TEST ONLY — DELETE THIS ROUTE BEFORE PRODUCTION.
 * Exposes password hashing (same as registration) for seeding DB rows or manual tests.
 */

import { NextResponse } from 'next/server'

import { hashPassword } from '@/lib/auth/password'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  if (
    !body ||
    typeof body !== 'object' ||
    !('password' in body) ||
    typeof (body as { password: unknown }).password !== 'string'
  ) {
    return NextResponse.json(
      { error: 'Send JSON: { "password": "your-plaintext" }' },
      { status: 400 },
    )
  }

  const password = (body as { password: string }).password
  const hash = await hashPassword(password)

  return NextResponse.json({
    hash,
    _reminder: 'Delete app/temp/hash before production.',
  })
}
