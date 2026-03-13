import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema'

const client = postgres(process.env.DATABASE_URL!, { prepare: false })

const database = drizzle(client, { schema, logger: true })

export default database
