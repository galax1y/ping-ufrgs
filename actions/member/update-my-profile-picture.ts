'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import database from '@/database'
import { membersInPing } from '@/database/drizzle/schema'
import { requireAuth } from '@/lib/auth/guards'
import {
  applyProfilePictureUpdate,
} from '@/lib/profile-picture'
import { resolveProfilePictureUpdate } from '@/lib/profile-picture-server'

export type UpdateMyProfilePictureResult =
  | { ok: true }
  | { ok: false; error: string }

export async function updateMyProfilePictureAction(
  formData: FormData,
): Promise<UpdateMyProfilePictureResult> {
  const member = await requireAuth()

  const resolved = await resolveProfilePictureUpdate(formData)
  if (!resolved.ok) {
    return { ok: false, error: resolved.error }
  }

  const patch = applyProfilePictureUpdate(resolved.update)
  if (Object.keys(patch).length === 0) {
    return { ok: false, error: 'Selecione uma imagem para enviar.' }
  }

  await database
    .update(membersInPing)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(membersInPing.id, member.id))

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/key-requests')
  revalidatePath('/admin/members')
  return { ok: true }
}
