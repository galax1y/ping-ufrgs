'use server'

import { and, asc, eq } from 'drizzle-orm'

import database from '@/database'
import { keyRequestsInPing, membersInPing } from '@/database/drizzle/schema'
import { requireAssistant } from '@/lib/auth/guards'

import { memberPhotoVersion } from '@/lib/profile-picture-data-url'

export type PendingKeyRequestRow = {
  id: string
  /** ISO string (serializable to client components). */
  createdAt: string
  requesterId: string
  requesterName: string
  requesterEmail: string
  requesterPhotoVersion: number | null
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
      requesterId: keyRequestsInPing.requesterId,
      requesterName: membersInPing.name,
      requesterEmail: membersInPing.email,
      profilePicture: membersInPing.profilePicture,
      updatedAt: membersInPing.updatedAt,
    })
    .from(keyRequestsInPing)
    .innerJoin(
      membersInPing,
      eq(keyRequestsInPing.requesterId, membersInPing.id),
    )
    .where(
      and(
        eq(keyRequestsInPing.status, 'pending'),
        eq(keyRequestsInPing.kind, 'assistant'),
      ),
    )
    .orderBy(asc(keyRequestsInPing.createdAt))

  return rows.map((r) => ({
    id: r.id,
    createdAt: r.createdAt.toISOString(),
    requesterId: r.requesterId,
    requesterName: r.requesterName,
    requesterEmail: r.requesterEmail,
    requesterPhotoVersion: memberPhotoVersion(
      r.updatedAt,
      r.profilePicture != null,
    ),
    reason: r.reason,
  }))
}
