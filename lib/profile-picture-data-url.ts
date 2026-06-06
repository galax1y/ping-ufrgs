/** Parse a stored `data:mime;base64,...` profile picture into raw bytes. */
export function parseProfilePictureDataUrl(
  dataUrl: string,
): { mimeType: string; buffer: Buffer } | null {
  const match = /^data:([^;]+);base64,([\s\S]+)$/.exec(dataUrl)
  if (!match) return null
  try {
    return {
      mimeType: match[1],
      buffer: Buffer.from(match[2], 'base64'),
    }
  } catch {
    return null
  }
}

/** Cache-busting version for browser avatar URLs (matches route ETag). */
export function memberPhotoVersion(
  updatedAt: Date,
  hasProfilePicture: boolean,
): number | null {
  if (!hasProfilePicture) return null
  return updatedAt.getTime()
}

export function memberAvatarUrl(
  memberId: string,
  photoVersion: number | null,
): string | null {
  if (photoVersion == null) return null
  return `/api/members/${memberId}/avatar?v=${photoVersion}`
}
