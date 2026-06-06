import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

import database from '@/database'
import { membersInPing } from '@/database/drizzle/schema'
import { requireAuth } from '@/lib/auth/guards'
import { parseProfilePictureDataUrl } from '@/lib/profile-picture-data-url'

const CACHE_CONTROL =
  'private, max-age=86400, stale-while-revalidate=604800'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth()
  } catch {
    return new NextResponse(null, { status: 401 })
  }

  const { id } = await context.params
  if (!id) {
    return new NextResponse(null, { status: 400 })
  }

  const [row] = await database
    .select({
      profilePicture: membersInPing.profilePicture,
      updatedAt: membersInPing.updatedAt,
    })
    .from(membersInPing)
    .where(eq(membersInPing.id, id))
    .limit(1)

  if (!row?.profilePicture) {
    return new NextResponse(null, { status: 404 })
  }

  const parsed = parseProfilePictureDataUrl(row.profilePicture)
  if (!parsed) {
    return new NextResponse(null, { status: 404 })
  }

  const etag = `"${id}-${row.updatedAt.getTime()}"`
  if (request.headers.get('if-none-match') === etag) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        ETag: etag,
        'Cache-Control': CACHE_CONTROL,
      },
    })
  }

  return new NextResponse(new Uint8Array(parsed.buffer), {
    headers: {
      'Content-Type': parsed.mimeType,
      'Cache-Control': CACHE_CONTROL,
      ETag: etag,
    },
  })
}
