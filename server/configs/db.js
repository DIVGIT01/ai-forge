import { neon } from '@neondatabase/serverless'
import { env } from './env.js'

/**
 * Tagged-template SQL client for Neon (serverless Postgres).
 *
 * Usage:  await sql`SELECT * FROM creations WHERE user_id = ${userId}`
 * Values interpolated into the template are sent as bound parameters, so this
 * is not string concatenation and is not open to SQL injection.
 */
const sql = neon(env.databaseUrl)

export default sql
