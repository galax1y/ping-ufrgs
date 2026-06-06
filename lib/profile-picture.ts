export const MAX_PROFILE_PICTURE_BYTES = 2 * 1024 * 1024

export const PROFILE_PICTURE_MAX_EDGE_PX = 256

export const ALLOWED_PROFILE_PICTURE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const

export type ProfilePictureUpdate =
  | { action: 'keep' }
  | { action: 'clear' }
  | { action: 'set'; dataUrl: string }

export function memberInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function applyProfilePictureUpdate(
  update: ProfilePictureUpdate,
): { profilePicture?: string | null } {
  if (update.action === 'keep') return {}
  if (update.action === 'clear') return { profilePicture: null }
  return { profilePicture: update.dataUrl }
}
