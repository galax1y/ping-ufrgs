'use server'

import { and, asc, eq, sql } from 'drizzle-orm'

import database from '@/database'
import { keyStateInPing, membersInPing } from '@/database/drizzle/schema'
import { requireAdmin } from '@/lib/auth/guards'

export type AdminMemberRow = {
  id: string
  name: string
  email: string
  enrollmentNumber: string
  role: 'admin' | 'member' | 'assistant'
  createdAt: Date | null
  disabled: boolean
  holdsKey: boolean
}

export async function listMembersAction(): Promise<AdminMemberRow[]> {
  await requireAdmin()

  const rows = await database
    .select({
      id: membersInPing.id,
      name: membersInPing.name,
      email: membersInPing.email,
      enrollmentNumber: membersInPing.enrollmentNumber,
      role: membersInPing.role,
      createdAt: membersInPing.createdAt,
      disabled: membersInPing.disabled,
      holdsKey: sql<boolean>`(${keyStateInPing.holderId}) IS NOT NULL`,
    })
    .from(membersInPing)
    .leftJoin(
      keyStateInPing,
      and(
        eq(keyStateInPing.id, 1),
        eq(keyStateInPing.holderId, membersInPing.id),
      ),
    )
    .orderBy(asc(membersInPing.name))

  return rows.map((r) => ({
    ...r,
    holdsKey: Boolean(r.holdsKey),
  }))
}
