import { config } from 'dotenv'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'

import * as schema from '../database/drizzle/schema'

config({ path: '.env' })

const { membersInPing, roomStateInPing, keyStateInPing } = schema

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('DATABASE_URL is not set')
    process.exit(1)
  }

  const client = postgres(url, { prepare: false })
  const db = drizzle(client, { schema })

  await db
    .insert(roomStateInPing)
    .values({
      id: 1,
      name: 'Room',
      isOpen: false,
    })
    .onConflictDoNothing({ target: roomStateInPing.id })

  await db
    .insert(keyStateInPing)
    .values({
      id: 1,
      holderId: null,
      heldSince: null,
    })
    .onConflictDoNothing({ target: keyStateInPing.id })

  const email = (process.env.SEED_ADMIN_EMAIL ?? 'admin@localhost').toLowerCase()
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'changeme-change-me-now'

  const [existing] = await db
    .select({ id: membersInPing.id })
    .from(membersInPing)
    .where(eq(membersInPing.email, email))
    .limit(1)

  if (existing) {
    console.log('Admin already exists:', email)
    await client.end()
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)
  await db.insert(membersInPing).values({
    name: 'Administrator',
    email,
    enrollmentNumber: process.env.SEED_ADMIN_ENROLLMENT ?? 'admin-0',
    passwordHash,
    role: 'admin',
  })

  console.log('Seeded admin:', email)
  console.log('Default password from SEED_ADMIN_PASSWORD (change immediately).')
  await client.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
