import {
  findUserById,
  findUsersAdmin,
  setUserStatus,
  type AdminUserFilters,
} from '../repositories/user.repository'
import type { UserRow } from '../database/schema'
import { ApiError } from '../utils/ApiError'
import { AUDIT_ACTIONS, recordAudit } from './auditLog.service'
import { revokeAllSessions } from './session.service'

export interface AdminUserDto {
  id: number
  fullName: string
  email: string
  phone: string
  role: UserRow['role']
  status: UserRow['status']
  createdAt: string
}

function toDto(row: UserRow): AdminUserDto {
  return {
    id: row.id,
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
    role: row.role,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  }
}

export interface AdminUserListResult {
  items: AdminUserDto[]
  total: number
  page: number
  limit: number
}

export async function listUsers(filters: AdminUserFilters): Promise<AdminUserListResult> {
  const { rows, total } = await findUsersAdmin(filters)
  return { items: rows.map(toDto), total, page: filters.page, limit: filters.limit }
}

export async function getUserDetail(id: number): Promise<AdminUserDto> {
  const row = await findUserById(id)
  if (!row) throw ApiError.notFound('User not found')
  return toDto(row)
}

/**
 * Activate, suspend, or deactivate a user (api/admin.md). Suspended/deactivated
 * users are blocked from logging in (server/src/services/auth.service.ts) and
 * have every existing session revoked immediately.
 */
export async function updateUserStatus(
  adminId: number,
  id: number,
  status: UserRow['status'],
): Promise<AdminUserDto> {
  const target = await findUserById(id)
  if (!target) throw ApiError.notFound('User not found')
  if (target.id === adminId && status !== 'active') {
    throw ApiError.badRequest('You cannot suspend or deactivate your own account')
  }

  const row = await setUserStatus(id, status)
  if (!row) throw ApiError.notFound('User not found')

  if (status !== 'active') {
    await revokeAllSessions(id)
  }

  void recordAudit({
    userId: adminId,
    action: AUDIT_ACTIONS.userStatusChange,
    entityType: 'user',
    entityId: id,
    details: { status },
  })

  return toDto(row)
}
