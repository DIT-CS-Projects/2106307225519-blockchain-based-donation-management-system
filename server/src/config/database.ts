import { Pool } from 'pg'
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { env } from './env'
import { logger } from '../utils/logger'
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
  logger.warn('DATABASE_URL not set — database features are disabled until configured.')
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
