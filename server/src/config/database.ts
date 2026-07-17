import { Pool } from 'pg'
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { env } from './env'
import { logger } from '../utils/logger'
import { ApiError } from '../utils/ApiError'
import * as schema from '../database/schema'

/**
 * Shared PostgreSQL connection pool.
 * Null until DATABASE_URL is configured, so the server can boot before the
 * database is provisioned (Stage 1). Repositories must handle a null client.
 */
export const pool = env.DATABASE_URL
  ? new Pool({ connectionString: env.DATABASE_URL })
  : null

/**
 * Drizzle ORM client (Decision 019). Repositories query through this.
 * Null until the pool is configured.
 */
export const db: NodePgDatabase<typeof schema> | null = pool
  ? drizzle(pool, { schema })
  : null

if (!pool) {
  logger.warn('DATABASE_URL not set. Database features are disabled until configured.')
}

/**
 * Return the Drizzle client or fail with a 503. Repositories call this so a
 * missing DATABASE_URL degrades to a clean "try again shortly" instead of a
 * null dereference.
 */
export function requireDb(): NodePgDatabase<typeof schema> {
  if (!db) {
    throw new ApiError(503, 'Database is not available. Please try again shortly.')
  }
  return db
}

/** Lightweight connectivity check used by the health endpoint. */
export async function checkDatabase(): Promise<boolean> {
  if (!pool) return false
  try {
    await pool.query('SELECT 1')
    return true
  } catch (error) {
    logger.error('Database health check failed:', error)
    return false
  }
}
