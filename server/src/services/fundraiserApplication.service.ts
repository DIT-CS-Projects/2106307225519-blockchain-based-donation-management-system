import {
  countPendingApplications,
  findApplicationById,
  findFundraisersAdmin,
  findLatestApplicationByUser,
  updateApplication,
  type FundraiserListFilters,
  type FundraiserListRow,
} from '../repositories/fundraiserApplication.repository'
import { aggregateCampaignsByOwners } from '../repositories/campaign.repository'
import { findUserById, setUserRole } from '../repositories/user.repository'
import type { FundraiserApplicationRow, UserRow } from '../database/schema'
import { ApiError } from '../utils/ApiError'
import { AUDIT_ACTIONS, recordAudit } from './auditLog.service'
import { notify } from './notification.service'

export interface FundraiserApplicationDto {
  id: number
  displayName: string
  causeDescription: string
  identityReference: string
  contactPhone: string
  status: FundraiserApplicationRow['status']
  decisionReason: string | null
  createdAt: string
  reviewedAt: string | null
}

function toDto(row: FundraiserApplicationRow): FundraiserApplicationDto {
  return {
    id: row.id,
    displayName: row.displayName,
    causeDescription: row.causeDescription,
    identityReference: row.identityReference,
    contactPhone: row.contactPhone,
    status: row.status,
    decisionReason: row.decisionReason,
    createdAt: row.createdAt.toISOString(),
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
  }
}

/** The current user's latest application, or null if they have never applied. */
export async function getMyApplication(userId: number): Promise<FundraiserApplicationDto | null> {
  const row = await findLatestApplicationByUser(userId)
  return row ? toDto(row) : null
}

/**
 * Guard: a fundraiser may only create campaigns once an administrator has
 * approved their account (Decision 024). Administrators are never gated. Throws
 * 403 while the account is pending or rejected.
 */
export async function assertFundraiserApproved(userId: number): Promise<void> {
  const latest = await findLatestApplicationByUser(userId)
  if (latest?.status === 'approved') return
  if (latest?.status === 'rejected') {
    throw ApiError.forbidden(
      'Your fundraiser account was not approved. Contact support if you believe this is a mistake.',
    )
  }
  throw ApiError.forbidden('Your fundraiser account is awaiting administrator approval.')
}

// --- Admin fundraisers directory (Decision 024) ---

export interface AdminFundraiserDto {
  applicationId: number
  userId: number
  fullName: string
  email: string
  phone: string
  accountStatus: UserRow['status']
  joinedAt: string
  displayName: string
  causeDescription: string
  identityReference: string
  contactPhone: string
  applicationStatus: FundraiserApplicationRow['status']
  decisionReason: string | null
  appliedAt: string
  reviewedAt: string | null
  campaignsCount: number
  totalRaised: number
}

export interface AdminFundraiserListResult {
  items: AdminFundraiserDto[]
  total: number
  page: number
  limit: number
}

function toFundraiserDto(
  row: FundraiserListRow,
  stats: Map<number, { count: number; raised: number }>,
): AdminFundraiserDto {
  const owned = stats.get(row.userId)
  return {
    applicationId: row.applicationId,
    userId: row.userId,
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
    accountStatus: row.accountStatus,
    joinedAt: row.joinedAt.toISOString(),
    displayName: row.displayName,
    causeDescription: row.causeDescription,
    identityReference: row.identityReference,
    contactPhone: row.contactPhone,
    applicationStatus: row.applicationStatus,
    decisionReason: row.decisionReason,
    appliedAt: row.appliedAt.toISOString(),
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
    campaignsCount: owned?.count ?? 0,
    totalRaised: owned?.raised ?? 0,
  }
}

/** Fundraiser accounts with approval state and campaign totals (admin console). */
export async function listFundraisers(
  filters: FundraiserListFilters,
): Promise<AdminFundraiserListResult> {
  const { rows, total } = await findFundraisersAdmin(filters)
  const stats = await aggregateCampaignsByOwners(rows.map((r) => r.userId))
  return {
    items: rows.map((row) => toFundraiserDto(row, stats)),
    total,
    page: filters.page,
    limit: filters.limit,
  }
}

export function countPending(): Promise<number> {
  return countPendingApplications()
}

export interface AdminApplicationDto extends FundraiserApplicationDto {
  userId: number
  applicantName: string
  applicantEmail: string
}

/** Build an admin DTO from an updated application row plus the applicant record. */
async function toReviewedDto(row: FundraiserApplicationRow): Promise<AdminApplicationDto> {
  const applicant = await findUserById(row.userId)
  return {
    ...toDto(row),
    userId: row.userId,
    applicantName: applicant?.fullName ?? '',
    applicantEmail: applicant?.email ?? '',
  }
}

/**
 * Approve a pending fundraiser account (Decision 024): the applicant may now
 * create campaigns. The fundraiser role was granted at sign-up; setUserRole is
 * kept as a defensive no-op that also settles any legacy pending row.
 */
export async function approveApplication(
  adminId: number,
  id: number,
): Promise<AdminApplicationDto> {
  const application = await findApplicationById(id)
  if (!application) throw ApiError.notFound('Application not found')
  if (application.status !== 'pending') {
    throw ApiError.badRequest('Only pending applications can be reviewed')
  }

  await setUserRole(application.userId, 'fundraiser')
  const updated = await updateApplication(id, {
    status: 'approved',
    reviewedBy: adminId,
    reviewedAt: new Date(),
  })
  if (!updated) throw ApiError.notFound('Application not found')

  void recordAudit({
    userId: adminId,
    action: AUDIT_ACTIONS.fundraiserApprove,
    entityType: 'fundraiser_application',
    entityId: id,
    details: { userId: application.userId },
  })

  void notify({
    userIds: [application.userId],
    type: 'fundraiser_application_approved',
    title: 'Your fundraiser account is approved',
    message: 'An administrator approved your account. You can now create and manage campaigns.',
    link: '/fundraiser',
  })

  return toReviewedDto(updated)
}

/** Reject a pending fundraiser account with a reason (Decision 024). */
export async function rejectApplication(
  adminId: number,
  id: number,
  reason: string,
): Promise<AdminApplicationDto> {
  const application = await findApplicationById(id)
  if (!application) throw ApiError.notFound('Application not found')
  if (application.status !== 'pending') {
    throw ApiError.badRequest('Only pending applications can be reviewed')
  }

  const updated = await updateApplication(id, {
    status: 'rejected',
    reviewedBy: adminId,
    decisionReason: reason,
    reviewedAt: new Date(),
  })
  if (!updated) throw ApiError.notFound('Application not found')

  void recordAudit({
    userId: adminId,
    action: AUDIT_ACTIONS.fundraiserReject,
    entityType: 'fundraiser_application',
    entityId: id,
    details: { reason },
  })

  void notify({
    userIds: [application.userId],
    type: 'fundraiser_application_rejected',
    title: 'Fundraiser account update',
    message: `Your fundraiser account was not approved. Reason: ${reason}.`,
    link: '/fundraiser',
  })

  return toReviewedDto(updated)
}
