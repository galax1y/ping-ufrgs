// This is a Next.js server action
'use server'

import database from '@/database'
import { membersInPing } from '@/database/drizzle/schema'

// Example drizzle use
// If select returns nothing and you're sure the database has rows, probably the Supabase config has enabled RLS
// RLS is just a security measure that requires a policy to be followed for it to return data.

export const getUsers = async () => {
  const result = await database.select().from(membersInPing)

  return result
}
