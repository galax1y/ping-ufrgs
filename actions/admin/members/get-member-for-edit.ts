'use server'

import { eq } from 'drizzle-orm'

import database from '@/database'
import { membersInPing } from '@/database/drizzle/schema'
import { requireAdmin } from '@/lib/auth/guards'

export type AdminMemberEditRow = {
  id: string
  name: string
  email: string
  enrollmentNumber: string
  role: 'admin' | 'member' | 'assistant'
  disabled: boolean
  profilePicture: string | null
}

export async function getMemberForAdminEditAction(
  id: string,
): Promise<AdminMemberEditRow | null> {
  await requireAdmin()

  if (!id) return null

  const [row] = await database
    .select({
      id: membersInPing.id,
      name: membersInPing.name,
      email: membersInPing.email,
      enrollmentNumber: membersInPing.enrollmentNumber,
      role: membersInPing.role,
      disabled: membersInPing.disabled,
      profilePicture: membersInPing.profilePicture,
    })
    .from(membersInPing)
    .where(eq(membersInPing.id, id))
    .limit(1)

  return row ?? null
}
