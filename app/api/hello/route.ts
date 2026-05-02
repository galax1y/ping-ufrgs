import database from '@/database'
import { membersInPing } from '@/database/drizzle/schema'

export async function GET() {
  const result = await database.select().from(membersInPing)

  return Response.json(result)
}

export async function POST() {
  const result = await database.insert(membersInPing).values({
    name: 'Test',
    email: 'test@example.com',
    enrollmentNumber: '123456',
    passwordHash: 'not-a-real-hash',
  })

  return Response.json(result)
}
