import { and, eq, ne } from 'drizzle-orm'

import database from '@/database'
import { membersInPing } from '@/database/drizzle/schema'

const ASSISTANT_CONFLICT_MESSAGE =
  'There is already an active assistant. Change that member’s role, or disable their account, before assigning another assistant.'

export { ASSISTANT_CONFLICT_MESSAGE }

/** Another non-disabled member already has the assistant role (excluding `exceptMemberId` when set). */
export async function hasOtherActiveAssistant(
  exceptMemberId?: string,
): Promise<boolean> {
  const conditions =
    exceptMemberId != null
      ? and(
          eq(membersInPing.role, 'assistant'),
          eq(membersInPing.disabled, false),
          ne(membersInPing.id, exceptMemberId),
        )
      : and(
          eq(membersInPing.role, 'assistant'),
          eq(membersInPing.disabled, false),
        )

  const [row] = await database
    .select({ id: membersInPing.id })
    .from(membersInPing)
    .where(conditions)
    .limit(1)

  return row != null
}

/** Walk Drizzle / postgres-js error chain for PostgreSQL `code`. */
export function postgresErrorCode(e: unknown): string | undefined {
  let cur: unknown = e
  const seen = new Set<unknown>()
  for (let i = 0; i < 10 && cur && typeof cur === 'object'; i++) {
    if (seen.has(cur)) break
    seen.add(cur)
    const o = cur as Record<string, unknown>
    if (typeof o.code === 'string') return o.code
    cur = o.cause
  }
  return undefined
}

export function isUniqueViolation(e: unknown): boolean {
  if (postgresErrorCode(e) === '23505') return true
  return String(e).includes('23505')
}
