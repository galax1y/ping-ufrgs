import sharp from 'sharp'

import {
  ALLOWED_PROFILE_PICTURE_TYPES,
  MAX_PROFILE_PICTURE_BYTES,
  PROFILE_PICTURE_MAX_EDGE_PX,
  type ProfilePictureUpdate,
} from '@/lib/profile-picture'

export async function fileToProfilePictureDataUrl(
  file: File,
): Promise<{ dataUrl: string } | { error: string }> {
  if (!ALLOWED_PROFILE_PICTURE_TYPES.includes(
    file.type as (typeof ALLOWED_PROFILE_PICTURE_TYPES)[number],
  )) {
    return {
      error: 'Use JPEG, PNG, WebP ou GIF.',
    }
  }

  if (file.size > MAX_PROFILE_PICTURE_BYTES) {
    return {
      error: 'A imagem deve ter no máximo 2 MB.',
    }
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  let output: Buffer
  try {
    output = await sharp(buffer)
      .rotate()
      .resize(PROFILE_PICTURE_MAX_EDGE_PX, PROFILE_PICTURE_MAX_EDGE_PX, {
        fit: 'cover',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer()
  } catch {
    return { error: 'Não foi possível processar a imagem.' }
  }

  const dataUrl = `data:image/jpeg;base64,${output.toString('base64')}`

  return { dataUrl }
}

export async function resolveProfilePictureUpdate(
  formData: FormData,
): Promise<
  { ok: true; update: ProfilePictureUpdate } | { ok: false; error: string }
> {
  if (formData.get('clearProfilePicture') === '1') {
    return { ok: true, update: { action: 'clear' } }
  }

  const file = formData.get('profilePicture')
  if (!(file instanceof File) || file.size === 0) {
    return { ok: true, update: { action: 'keep' } }
  }

  const parsed = await fileToProfilePictureDataUrl(file)
  if ('error' in parsed) {
    return { ok: false, error: parsed.error }
  }

  return { ok: true, update: { action: 'set', dataUrl: parsed.dataUrl } }
}
