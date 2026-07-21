import { findAuditLogs, insertAuditLog, type AuditLogFilters } from '../repositories/auditLog.repository'
import { logger } from '../utils/logger'

/**
 * Dotted action names used across the admin surface. Kept as a const object
 * (not an enum) so callers get autocomplete without a schema migration to add one.
 */
export const AUDIT_ACTIONS = {
  campaignCreate: 'campaign.create',
  campaignUpdate: 'campaign.update',
  campaignArchive: 'campaign.archive',
  campaignDelete: 'campaign.delete',
  beneficiaryCreate: 'beneficiary.create',
  beneficiaryUpdate: 'beneficiary.update',
  beneficiaryVerify: 'beneficiary.verify',
  beneficiaryDelete: 'beneficiary.delete',
  disbursementInitiate: 'disbursement.initiate',
  disbursementApprove: 'disbursement.approve',
  disbursementReject: 'disbursement.reject',
  userStatusChange: 'user.status_change',
  notificationBroadcast: 'notification.broadcast',
  loginSuccess: 'login.success',
  loginFailed: 'login.failed',
  blockchainVerify: 'blockchain.verify',
} as const

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS]

/**
 * Record an administrator action (docs/BUSINESS_RULES.md: Audit Rules).
 * Fire-and-forget from the caller's perspective: a logging failure must never
 * fail the underlying admin action, so this only logs internally on error.
 */
export async function recordAudit(entry: {
  userId: number
  action: AuditAction
  entityType?: string
  entityId?: number
  details?: Record<string, unknown>
}): Promise<void> {
  try {
    await insertAuditLog({
      userId: entry.userId,
      action: entry.action,
      entityType: entry.entityType ?? null,
      entityId: entry.entityId ?? null,
      details: entry.details ?? null,
    })
  } catch (error) {
    logger.error('Failed to record audit log:', error)
  }
}

export interface AuditLogDto {
  id: number
  admin: string
  action: string
  entityType: string | null
  entityId: number | null
  details: unknown
  createdAt: string
}

export interface AuditLogListResult {
  items: AuditLogDto[]
  total: number
  page: number
  limit: number
}

export async function listAuditLogs(filters: AuditLogFilters): Promise<AuditLogListResult> {
  const { rows, total } = await findAuditLogs(filters)
  return {
    items: rows.map((row) => ({
      id: row.id,
      admin: row.userName,
      action: row.action,
      entityType: row.entityType,
      entityId: row.entityId,
      details: row.details,
      createdAt: row.createdAt.toISOString(),
    })),
    total,
    page: filters.page,
    limit: filters.limit,
  }
}
