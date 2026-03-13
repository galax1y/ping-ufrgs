import database from '@/database'
import { usersInPing } from '@/database/drizzle/schema'

export async function GET() {
  const result = await database.select().from(usersInPing)

  return Response.json(result)
}

export async function POST() {
  const result = await database.insert(usersInPing).values({
    name: 'Test',
    email: 'test@example.com',
    enrollmentNumber: '123456',
  })

  return Response.json(result)
}
