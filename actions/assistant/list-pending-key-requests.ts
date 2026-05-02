'use server'

import { asc, eq } from 'drizzle-orm'

import database from '@/database'
import { keyRequestsInPing, membersInPing } from '@/database/drizzle/schema'
import { requireAssistant } from '@/lib/auth/guards'

export type PendingKeyRequestRow = {
  id: string
  /** ISO string (serializable to client components). */
  createdAt: string
  requesterName: string
  requesterEmail: string
  reason: string | null
}

export async function listPendingKeyRequestsAction(): Promise<
  PendingKeyRequestRow[]
> {
  await requireAssistant()

  const rows = await database
    .select({
      id: keyRequestsInPing.id,
      createdAt: keyRequestsInPing.createdAt,
      reason: keyRequestsInPing.reason,
      requesterName: membersInPing.name,
      requesterEmail: membersInPing.email,
    })
    .from(keyRequestsInPing)
    .innerJoin(
      membersInPing,
      eq(keyRequestsInPing.requesterId, membersInPing.id),
    )
    .where(eq(keyRequestsInPing.status, 'pending'))
    .orderBy(asc(keyRequestsInPing.createdAt))

  return rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }))
}
