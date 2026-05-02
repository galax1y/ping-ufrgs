'use server'

import { asc } from 'drizzle-orm'

import database from '@/database'
import { membersInPing } from '@/database/drizzle/schema'
import { requireAdmin } from '@/lib/auth/guards'

export type AdminMemberRow = {
  id: string
  name: string
  email: string
  enrollmentNumber: string
  role: 'admin' | 'member' | 'assistant'
  createdAt: Date | null
}

export async function listMembersAction(): Promise<AdminMemberRow[]> {
  await requireAdmin()

  return database
    .select({
      id: membersInPing.id,
      name: membersInPing.name,
      email: membersInPing.email,
      enrollmentNumber: membersInPing.enrollmentNumber,
      role: membersInPing.role,
      createdAt: membersInPing.createdAt,
    })
    .from(membersInPing)
    .orderBy(asc(membersInPing.name))
}
