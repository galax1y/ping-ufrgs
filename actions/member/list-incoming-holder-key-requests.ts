'use server'

import { and, asc, eq } from 'drizzle-orm'

import database from '@/database'
import { keyRequestsInPing, membersInPing } from '@/database/drizzle/schema'
import type { IncomingHolderKeyRequestRow } from '@/actions/member/get-dashboard-state'
import { requireAuth } from '@/lib/auth/guards'
import { memberPhotoVersion } from '@/lib/profile-picture-data-url'

export type { IncomingHolderKeyRequestRow }

export async function listIncomingHolderKeyRequestsAction(): Promise<
  IncomingHolderKeyRequestRow[]
> {
  const member = await requireAuth()

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
        eq(keyRequestsInPing.kind, 'holder'),
        eq(keyRequestsInPing.targetHolderId, member.id),
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
