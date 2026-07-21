import { and, count, desc, eq, ilike, or, type SQL } from 'drizzle-orm'
import { requireDb } from '../config/database'
import { auditLogs, users, type NewAuditLogRow } from '../database/schema'

export async function insertAuditLog(entry: NewAuditLogRow): Promise<void> {
  const client = requireDb()
  await client.insert(auditLogs).values(entry)
}

export interface AuditLogFilters {
  search?: string
  action?: string
  page: number
  limit: number
}

export interface AuditLogListRow {
  id: number
  userId: number
  userName: string
  action: string
  entityType: string | null
  entityId: number | null
  details: unknown
  createdAt: Date
}

export async function findAuditLogs(
  filters: AuditLogFilters,
): Promise<{ rows: AuditLogListRow[]; total: number }> {
  const client = requireDb()

  const conditions: SQL[] = []
  if (filters.action) conditions.push(eq(auditLogs.action, filters.action))
  if (filters.search) {
    const term = `%${filters.search}%`
    conditions.push(or(ilike(users.fullName, term), ilike(auditLogs.action, term))!)
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [rows, [{ total }]] = await Promise.all([
    client
      .select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        userName: users.fullName,
        action: auditLogs.action,
        entityType: auditLogs.entityType,
        entityId: auditLogs.entityId,
        details: auditLogs.details,
        createdAt: auditLogs.createdAt,
      })
      .from(auditLogs)
      .innerJoin(users, eq(users.id, auditLogs.userId))
      .where(where)
      .orderBy(desc(auditLogs.createdAt))
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit),
    client
      .select({ total: count() })
      .from(auditLogs)
      .innerJoin(users, eq(users.id, auditLogs.userId))
      .where(where),
  ])

  return { rows, total }
}
