'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import database from '@/database'
import { keyRequestsInPing, keyStateInPing, membersInPing } from '@/database/drizzle/schema'
import { requireAuth } from '@/lib/auth/guards'

export type RequestKeyResult =
  | { ok: true }
  | { ok: false; error: string }

export async function requestKeyAction(reason: string): Promise<RequestKeyResult> {
  const member = await requireAuth()

  if (member.role !== 'member') {
    return { ok: false, error: 'Only members can request the key this way.' }
  }

  const [keyRow] = await database
    .select()
    .from(keyStateInPing)
    .where(eq(keyStateInPing.id, 1))
    .limit(1)

  let holderRole: 'admin' | 'member' | 'assistant' | null = null
  if (keyRow?.holderId) {
    const [h] = await database
      .select({ role: membersInPing.role })
      .from(membersInPing)
      .where(eq(membersInPing.id, keyRow.holderId))
      .limit(1)
    holderRole = h?.role ?? null
  }

  const keyWithAssistant =
    keyRow?.holderId == null || holderRole === 'assistant'

  if (!keyWithAssistant) {
    return {
      ok: false,
      error:
        'The key is not with the assistant right now. Ask the current holder.',
    }
  }

  const [existing] = await database
    .select({ id: keyRequestsInPing.id })
    .from(keyRequestsInPing)
    .where(
      and(
        eq(keyRequestsInPing.requesterId, member.id),
        eq(keyRequestsInPing.status, 'pending'),
      ),
    )
    .limit(1)

  if (existing) {
    return { ok: false, error: 'You already have a pending request.' }
  }

  try {
    await database.insert(keyRequestsInPing).values({
      requesterId: member.id,
      reason: reason.trim() || null,
      status: 'pending',
    })
  } catch (e: unknown) {
    const code =
      e && typeof e === 'object' && 'code' in e
        ? String((e as { code: unknown }).code)
        : ''
    if (code === '23505') {
      return { ok: false, error: 'You already have a pending request.' }
    }
    throw e
  }

  revalidatePath('/dashboard')
  return { ok: true }
}
