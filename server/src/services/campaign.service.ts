import {
  findCampaignById,
  findCampaignByIdAdmin,
  findCampaigns,
  findCampaignsAdmin,
  findCampaignsByOwner,
  findRelatedCampaigns,
  insertCampaign,
  softDeleteCampaign,
  updateCampaignRow,
  type AdminCampaignListFilters,
  type CampaignListFilters,
  type CampaignUpdate,
} from '../repositories/campaign.repository'
import { findUserIdsByRole, findUserNamesByIds } from '../repositories/user.repository'
import type { CampaignRow, UserRow } from '../database/schema'
import { ApiError } from '../utils/ApiError'
import { AUDIT_ACTIONS, recordAudit } from './auditLog.service'
import { notify } from './notification.service'
import { assertFundraiserApproved } from './fundraiserApplication.service'
import { findDistinctDonorIdsByCampaign } from '../repositories/donation.repository'
import type { CreateCampaignInput, UpdateCampaignInput } from '../validation/campaign'

/** Who is acting on a campaign: their id and role (Decision 020). */
export interface Actor {
  id: number
  role: UserRow['role']
}

/**
 * Ownership guard: an administrator may manage any campaign; a fundraiser may
 * manage only the campaigns they own. Anyone else is forbidden.
 */
function assertCanManage(actor: Actor, campaign: CampaignRow): void {
  if (actor.role === 'admin') return
  if (campaign.ownerId === actor.id) return
  throw ApiError.forbidden('You can only manage campaigns you own')
}

/**
 * Load a campaign and assert the actor may manage it (Decision 020). Shared by
 * the beneficiary and disbursement services so ownership rules live in one
 * place. Returns the campaign row for the caller to reuse.
 */
export async function assertCampaignManageable(
  actor: Actor,
  campaignId: number,
): Promise<CampaignRow> {
  const campaign = await findCampaignByIdAdmin(campaignId)
  if (!campaign) throw ApiError.badRequest('Campaign not found')
  assertCanManage(actor, campaign)
  return campaign
}

const RELATED_LIMIT = 3

/** Public shape of a campaign: what the client receives. */
export interface CampaignDto {
  id: number
  title: string
  description: string
  category: CampaignRow['category']
  imageUrl: string | null
  targetAmount: number
  raisedAmount: number
  startDate: string
  endDate: string
  status: 'active' | 'completed'
  featured: boolean
}

export interface CampaignListResult {
  items: CampaignDto[]
  total: number
  page: number
  limit: number
}

/**
 * Business rule: a campaign automatically becomes Completed after its end
 * date. Derived on read until a scheduled job owns the transition.
 */
function toDto(row: CampaignRow): CampaignDto {
  const ended = row.endDate.getTime() < Date.now()
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    imageUrl: row.imageUrl,
    targetAmount: row.targetAmount,
    raisedAmount: row.raisedAmount,
    startDate: row.startDate.toISOString(),
    endDate: row.endDate.toISOString(),
    status: row.status === 'active' && ended ? 'completed' : (row.status as 'active' | 'completed'),
    featured: row.featured,
  }
}

export async function listCampaigns(filters: CampaignListFilters): Promise<CampaignListResult> {
  const { rows, total } = await findCampaigns(filters)
  return {
    items: rows.map(toDto),
    total,
    page: filters.page,
    limit: filters.limit,
  }
}

export interface CampaignDetailsResult {
  campaign: CampaignDto
  relatedCampaigns: CampaignDto[]
}

export async function getCampaignDetails(id: number): Promise<CampaignDetailsResult> {
  const row = await findCampaignById(id)
  if (!row) {
    throw ApiError.notFound('Campaign not found')
  }
  const related = await findRelatedCampaigns(row.category, row.id, RELATED_LIMIT)
  return {
    campaign: toDto(row),
    relatedCampaigns: related.map(toDto),
  }
}

// --- Management (admin + owning fundraiser) ---

/** Admin shape: the real stored status, plus ownership and review metadata. */
export interface AdminCampaignDto extends Omit<CampaignDto, 'status'> {
  status: CampaignRow['status']
  ownerId: number | null
  ownerName: string | null
  rejectionReason: string | null
}

function toAdminDto(row: CampaignRow, ownerName: string | null = null): AdminCampaignDto {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    imageUrl: row.imageUrl,
    targetAmount: row.targetAmount,
    raisedAmount: row.raisedAmount,
    startDate: row.startDate.toISOString(),
    endDate: row.endDate.toISOString(),
    status: row.status,
    ownerId: row.ownerId,
    ownerName,
    rejectionReason: row.rejectionReason,
    featured: row.featured,
  }
}

/** Resolve owner display names for a page of campaigns in a single query. */
async function withOwnerNames(rows: CampaignRow[]): Promise<AdminCampaignDto[]> {
  const ownerIds = [...new Set(rows.map((r) => r.ownerId).filter((v): v is number => v != null))]
  const names = await findUserNamesByIds(ownerIds)
  return rows.map((row) => toAdminDto(row, row.ownerId != null ? names.get(row.ownerId) ?? null : null))
}

export interface AdminCampaignListResult {
  items: AdminCampaignDto[]
  total: number
  page: number
  limit: number
}

export async function listCampaignsAdmin(
  filters: AdminCampaignListFilters,
): Promise<AdminCampaignListResult> {
  const { rows, total } = await findCampaignsAdmin(filters)
  return { items: await withOwnerNames(rows), total, page: filters.page, limit: filters.limit }
}

/** Campaigns owned by the acting fundraiser/administrator (their dashboard). */
export async function listMyCampaigns(
  ownerId: number,
  filters: AdminCampaignListFilters,
): Promise<AdminCampaignListResult> {
  const { rows, total } = await findCampaignsByOwner(ownerId, filters)
  return { items: await withOwnerNames(rows), total, page: filters.page, limit: filters.limit }
}

export async function getCampaignAdmin(id: number): Promise<AdminCampaignDto> {
  const row = await findCampaignByIdAdmin(id)
  if (!row) throw ApiError.notFound('Campaign not found')
  return (await withOwnerNames([row]))[0]
}

/** Fetch a campaign for management, enforcing ownership for a fundraiser. */
export async function getManagedCampaign(actor: Actor, id: number): Promise<AdminCampaignDto> {
  const row = await findCampaignByIdAdmin(id)
  if (!row) throw ApiError.notFound('Campaign not found')
  assertCanManage(actor, row)
  return (await withOwnerNames([row]))[0]
}

/**
 * Create a campaign (Decision 020). A fundraiser's campaign starts in
 * Pending Review; an administrator's starts as a Draft they can publish. The
 * creator becomes the owner.
 */
export async function createCampaign(
  actor: Actor,
  input: CreateCampaignInput,
): Promise<AdminCampaignDto> {
  const isFundraiser = actor.role === 'fundraiser'
  // A fundraiser cannot create campaigns until an administrator approves their
  // account (Decision 024). Administrators are never gated.
  if (isFundraiser) await assertFundraiserApproved(actor.id)
  const row = await insertCampaign({
    title: input.title,
    description: input.description,
    category: input.category,
    imageUrl: input.imageUrl ?? null,
    ownerId: actor.id,
    targetAmount: input.targetAmount,
    startDate: input.startDate,
    endDate: input.endDate,
    // Only administrators may feature a campaign.
    featured: actor.role === 'admin' ? input.featured ?? false : false,
    status: isFundraiser ? 'pending_review' : 'draft',
  })
  void recordAudit({
    userId: actor.id,
    action: AUDIT_ACTIONS.campaignCreate,
    entityType: 'campaign',
    entityId: row.id,
    details: { title: row.title },
  })
  if (isFundraiser) void notifyAdminsOfSubmission(row)
  return toAdminDto(row)
}

export async function updateCampaign(
  actor: Actor,
  id: number,
  input: UpdateCampaignInput,
): Promise<AdminCampaignDto> {
  const existing = await findCampaignByIdAdmin(id)
  if (!existing) throw ApiError.notFound('Campaign not found')
  assertCanManage(actor, existing)

  const patch: CampaignUpdate = { ...input }
  // A fundraiser cannot self-publish or feature a campaign; those transitions
  // go through the review flow and stay administrator-only.
  if (actor.role !== 'admin') {
    delete patch.status
    delete patch.featured
  }

  const row = await updateCampaignRow(id, patch)
  if (!row) throw ApiError.notFound('Campaign not found')

  void recordAudit({
    userId: actor.id,
    action: AUDIT_ACTIONS.campaignUpdate,
    entityType: 'campaign',
    entityId: row.id,
    details: { fields: Object.keys(patch) },
  })

  // Closed early (-> archived via a direct status update): tell past donors.
  if (existing.status !== 'archived' && row.status === 'archived') {
    void notifyPastDonorsOfClosure(row)
  }

  return toAdminDto(row)
}

/**
 * Submit a Draft (or previously Rejected) campaign for administrator review.
 * Owner or administrator (Decision 020).
 */
export async function submitCampaign(actor: Actor, id: number): Promise<AdminCampaignDto> {
  const existing = await findCampaignByIdAdmin(id)
  if (!existing) throw ApiError.notFound('Campaign not found')
  assertCanManage(actor, existing)
  if (existing.status !== 'draft' && existing.status !== 'rejected') {
    throw ApiError.badRequest('Only a draft or rejected campaign can be submitted for review')
  }

  const row = await updateCampaignRow(id, { status: 'pending_review', rejectionReason: null })
  if (!row) throw ApiError.notFound('Campaign not found')

  void recordAudit({
    userId: actor.id,
    action: AUDIT_ACTIONS.campaignSubmit,
    entityType: 'campaign',
    entityId: row.id,
  })
  void notifyAdminsOfSubmission(row)
  return toAdminDto(row)
}

/** Approve a campaign awaiting review, publishing it (administrator only). */
export async function approveCampaign(adminId: number, id: number): Promise<AdminCampaignDto> {
  const existing = await findCampaignByIdAdmin(id)
  if (!existing) throw ApiError.notFound('Campaign not found')
  if (existing.status !== 'pending_review') {
    throw ApiError.badRequest('Only a campaign pending review can be approved')
  }

  const row = await updateCampaignRow(id, { status: 'active', rejectionReason: null })
  if (!row) throw ApiError.notFound('Campaign not found')

  void recordAudit({
    userId: adminId,
    action: AUDIT_ACTIONS.campaignApprove,
    entityType: 'campaign',
    entityId: row.id,
  })
  if (row.ownerId) {
    void notify({
      userIds: [row.ownerId],
      type: 'campaign_approved',
      title: `${row.title} is now live`,
      message: 'An administrator approved your campaign. It is now visible to donors.',
      link: `/campaigns/${row.id}`,
    })
  }
  return toAdminDto(row)
}

/** Reject a campaign awaiting review, with a reason (administrator only). */
export async function rejectCampaign(
  adminId: number,
  id: number,
  reason: string,
): Promise<AdminCampaignDto> {
  const existing = await findCampaignByIdAdmin(id)
  if (!existing) throw ApiError.notFound('Campaign not found')
  if (existing.status !== 'pending_review') {
    throw ApiError.badRequest('Only a campaign pending review can be rejected')
  }

  const row = await updateCampaignRow(id, { status: 'rejected', rejectionReason: reason })
  if (!row) throw ApiError.notFound('Campaign not found')

  void recordAudit({
    userId: adminId,
    action: AUDIT_ACTIONS.campaignReject,
    entityType: 'campaign',
    entityId: row.id,
    details: { reason },
  })
  if (row.ownerId) {
    void notify({
      userIds: [row.ownerId],
      type: 'campaign_rejected',
      title: `${row.title} needs changes`,
      message: `An administrator did not approve this campaign. Reason: ${reason}. You can edit and resubmit it.`,
      link: '/dashboard',
    })
  }
  return toAdminDto(row)
}

export async function archiveCampaign(actor: Actor, id: number): Promise<AdminCampaignDto> {
  const existing = await findCampaignByIdAdmin(id)
  if (!existing) throw ApiError.notFound('Campaign not found')
  assertCanManage(actor, existing)

  const row = await updateCampaignRow(id, { status: 'archived' })
  if (!row) throw ApiError.notFound('Campaign not found')

  void recordAudit({
    userId: actor.id,
    action: AUDIT_ACTIONS.campaignArchive,
    entityType: 'campaign',
    entityId: row.id,
  })
  if (existing.status !== 'archived') {
    void notifyPastDonorsOfClosure(row)
  }
  return toAdminDto(row)
}

async function notifyPastDonorsOfClosure(campaign: CampaignRow): Promise<void> {
  const donorIds = await findDistinctDonorIdsByCampaign(campaign.id)
  if (donorIds.length === 0) return
  await notify({
    userIds: donorIds,
    type: 'campaign_closed',
    title: `${campaign.title} has closed`,
    message: 'This campaign is no longer accepting donations. Thank you for your support.',
    link: `/campaigns/${campaign.id}`,
  })
}

/** Tell administrators a fundraiser campaign is waiting in the review queue. */
async function notifyAdminsOfSubmission(campaign: CampaignRow): Promise<void> {
  const adminIds = await findUserIdsByRole('admin')
  if (adminIds.length === 0) return
  await notify({
    userIds: adminIds,
    type: 'system_announcement',
    title: 'A campaign is awaiting review',
    message: `"${campaign.title}" was submitted and needs administrator review.`,
    link: '/admin/campaigns?status=pending_review',
  })
}

export async function deleteCampaign(actor: Actor, id: number): Promise<void> {
  const existing = await findCampaignByIdAdmin(id)
  if (!existing) throw ApiError.notFound('Campaign not found')
  assertCanManage(actor, existing)

  await softDeleteCampaign(id)
  void recordAudit({
    userId: actor.id,
    action: AUDIT_ACTIONS.campaignDelete,
    entityType: 'campaign',
    entityId: id,
    details: { title: existing.title },
  })
}
