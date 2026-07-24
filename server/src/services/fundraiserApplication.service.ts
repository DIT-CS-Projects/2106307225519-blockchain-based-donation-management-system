import {
  countPendingApplications,
  findApplicationById,
  findApplications,
  findLatestApplicationByUser,
  findPendingApplicationByUser,
  insertApplication,
  updateApplication,
  type ApplicationListFilters,
  type ApplicationListRow,
} from '../repositories/fundraiserApplication.repository'
import { findUserById, setUserRole } from '../repositories/user.repository'
import type { FundraiserApplicationRow } from '../database/schema'
import { ApiError } from '../utils/ApiError'
import { AUDIT_ACTIONS, recordAudit } from './auditLog.service'
import { notify } from './notification.service'
import type { ApplyFundraiserInput } from '../validation/fundraiser'

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

/**
 * A donor applies to become a fundraiser (Decision 020). Only a donor may
 * apply, and only one application may be open at a time; a rejected applicant
 * may re-apply.
 */
export async function applyToFundraise(
  userId: number,
  input: ApplyFundraiserInput,
): Promise<FundraiserApplicationDto> {
  const user = await findUserById(userId)
  if (!user) throw ApiError.unauthorized('Authentication required')
  if (user.role !== 'donor') {
    throw ApiError.conflict('Only donors can apply to become a fundraiser')
  }

  const pending = await findPendingApplicationByUser(userId)
  if (pending) {
    throw ApiError.conflict('You already have an application awaiting review')
  }

  const row = await insertApplication({
    userId,
    displayName: input.displayName,
    causeDescription: input.causeDescription,
    identityReference: input.identityReference,
    contactPhone: input.contactPhone,
  })

  void recordAudit({
    userId,
    action: AUDIT_ACTIONS.fundraiserApply,
    entityType: 'fundraiser_application',
    entityId: row.id,
  })

  return toDto(row)
}

/** The current user's latest application, or null if they have never applied. */
export async function getMyApplication(userId: number): Promise<FundraiserApplicationDto | null> {
  const row = await findLatestApplicationByUser(userId)
  return row ? toDto(row) : null
}

// --- Admin review ---

export interface AdminApplicationDto extends FundraiserApplicationDto {
  userId: number
  applicantName: string
  applicantEmail: string
}

function toAdminDto(row: ApplicationListRow): AdminApplicationDto {
  return {
    id: row.id,
    userId: row.userId,
    applicantName: row.applicantName,
    applicantEmail: row.applicantEmail,
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

export interface AdminApplicationListResult {
  items: AdminApplicationDto[]
  total: number
  page: number
  limit: number
}

export async function listApplications(
  filters: ApplicationListFilters,
): Promise<AdminApplicationListResult> {
  const { rows, total } = await findApplications(filters)
  return { items: rows.map(toAdminDto), total, page: filters.page, limit: filters.limit }
}

export function countPending(): Promise<number> {
  return countPendingApplications()
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

/** Approve an application: promote the applicant to fundraiser and notify them. */
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
    title: 'You are now a fundraiser',
    message: 'Your application was approved. You can now create and manage your own campaigns.',
    link: '/dashboard',
  })

  return toReviewedDto(updated)
}

/** Reject an application with a reason. The applicant stays a donor. */
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
    title: 'Fundraiser application update',
    message: `Your fundraiser application was not approved. Reason: ${reason}. You may apply again.`,
    link: '/account',
  })

  return toReviewedDto(updated)
}
