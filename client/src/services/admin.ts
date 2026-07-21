import { api } from '@/services/api'
import type { UserRole } from '@/services/auth'

// Contract: api/admin.md (base path /api/admin). Admin only.

export interface DashboardStats {
  totalDonations: number
  totalRevenue: number
  activeCampaigns: number
  beneficiaries: number
  registeredUsers: number
  blockchainTransactions: number
}

export interface DashboardResult {
  stats: DashboardStats
  recentDonations: {
    id: number
    donor: string
    campaign: string
    amount: number
    paymentStatus: string
    blockchainStatus: string
    createdAt: string
  }[]
  campaignOverview: {
    id: number
    title: string
    raisedAmount: number
    targetAmount: number
    status: string
    endDate: string
  }[]
  charts: {
    donationTrend: { month: string; total: number }[]
    paymentMethods: { method: string; total: number }[]
  }
}

export async function getDashboard(): Promise<DashboardResult> {
  const { data } = await api.get<DashboardResult>('/admin/dashboard')
  return data
}

export type UserStatus = 'active' | 'suspended' | 'deactivated'

export interface AdminUser {
  id: number
  fullName: string
  email: string
  phone: string
  role: UserRole
  status: UserStatus
  createdAt: string
}

export interface AdminUserListParams {
  role?: UserRole
  search?: string
  page?: number
  limit?: number
}

export interface AdminUserListResult {
  items: AdminUser[]
  total: number
  page: number
  limit: number
}

export async function getUsers(params: AdminUserListParams = {}): Promise<AdminUserListResult> {
  const { data } = await api.get<AdminUserListResult>('/admin/users', { params })
  return data
}

export async function getUser(id: number): Promise<AdminUser> {
  const { data } = await api.get<{ user: AdminUser }>(`/admin/users/${id}`)
  return data.user
}

export async function updateUserStatus(id: number, status: UserStatus): Promise<AdminUser> {
  const { data } = await api.patch<{ user: AdminUser }>(`/admin/users/${id}/status`, { status })
  return data.user
}

export interface AuditLogEntry {
  id: number
  admin: string
  action: string
  entityType: string | null
  entityId: number | null
  details: unknown
  createdAt: string
}

export interface AuditLogListParams {
  search?: string
  action?: string
  page?: number
  limit?: number
}

export interface AuditLogListResult {
  items: AuditLogEntry[]
  total: number
  page: number
  limit: number
}

export async function getAuditLogs(params: AuditLogListParams = {}): Promise<AuditLogListResult> {
  const { data } = await api.get<AuditLogListResult>('/admin/audit', { params })
  return data
}

export type BroadcastAudience = 'admins' | 'donors' | 'everyone'

export async function broadcastNotification(input: {
  title: string
  message: string
  audience: BroadcastAudience
}): Promise<void> {
  await api.post('/admin/notifications', input)
}
