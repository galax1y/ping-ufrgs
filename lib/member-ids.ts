/** Compare member UUIDs from the database (case-insensitive). */
export function isSameMember(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  if (a == null || b == null) return false
  return a.toLowerCase() === b.toLowerCase()
}
