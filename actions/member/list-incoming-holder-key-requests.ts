'use server'

import { and, asc, eq } from 'drizzle-orm'

import database from '@/database'
import { keyRequestsInPing, membersInPing } from '@/database/drizzle/schema'
import type { IncomingHolderKeyRequestRow } from '@/actions/member/get-dashboard-state'
import { requireAuth } from '@/lib/auth/guards'

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
      requesterName: membersInPing.name,
      requesterEmail: membersInPing.email,
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
    requesterName: r.requesterName,
    requesterEmail: r.requesterEmail,
    reason: r.reason,
  }))
}
