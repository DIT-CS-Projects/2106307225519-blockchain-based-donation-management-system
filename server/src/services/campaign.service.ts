import {
  findCampaignById,
  findCampaignByIdAdmin,
  findCampaigns,
  findCampaignsAdmin,
  findRelatedCampaigns,
  insertCampaign,
  softDeleteCampaign,
  updateCampaignRow,
  type AdminCampaignListFilters,
  type CampaignListFilters,
  type CampaignUpdate,
} from '../repositories/campaign.repository'
import type { CampaignRow } from '../database/schema'
import { ApiError } from '../utils/ApiError'
import { AUDIT_ACTIONS, recordAudit } from './auditLog.service'
import { notify } from './notification.service'
import { findDistinctDonorIdsByCampaign } from '../repositories/donation.repository'
import type { CreateCampaignInput, UpdateCampaignInput } from '../validation/campaign'

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

// --- Admin ---

/** Admin shape: the real stored status, not the derived public 'active'|'completed'. */
export interface AdminCampaignDto extends Omit<CampaignDto, 'status'> {
  status: CampaignRow['status']
}

function toAdminDto(row: CampaignRow): AdminCampaignDto {
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
    featured: row.featured,
  }
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
  return { items: rows.map(toAdminDto), total, page: filters.page, limit: filters.limit }
}

export async function getCampaignAdmin(id: number): Promise<AdminCampaignDto> {
  const row = await findCampaignByIdAdmin(id)
  if (!row) throw ApiError.notFound('Campaign not found')
  return toAdminDto(row)
}

export async function createCampaign(
  adminId: number,
  input: CreateCampaignInput,
): Promise<AdminCampaignDto> {
  const row = await insertCampaign({
    title: input.title,
    description: input.description,
    category: input.category,
    imageUrl: input.imageUrl ?? null,
    targetAmount: input.targetAmount,
    startDate: input.startDate,
    endDate: input.endDate,
    featured: input.featured ?? false,
    status: 'draft',
  })
  void recordAudit({
    userId: adminId,
    action: AUDIT_ACTIONS.campaignCreate,
    entityType: 'campaign',
    entityId: row.id,
    details: { title: row.title },
  })
  return toAdminDto(row)
}

export async function updateCampaign(
  adminId: number,
  id: number,
  input: UpdateCampaignInput,
): Promise<AdminCampaignDto> {
  const existing = await findCampaignByIdAdmin(id)
  if (!existing) throw ApiError.notFound('Campaign not found')

  const patch: CampaignUpdate = { ...input }
  const row = await updateCampaignRow(id, patch)
  if (!row) throw ApiError.notFound('Campaign not found')

  void recordAudit({
    userId: adminId,
    action: AUDIT_ACTIONS.campaignUpdate,
    entityType: 'campaign',
    entityId: row.id,
    details: { fields: Object.keys(input) },
  })

  // Newly published (draft -> active): no existing donors yet, nothing to notify.
  // Closed early (-> archived via a direct status update): tell past donors.
  if (existing.status !== 'archived' && row.status === 'archived') {
    void notifyPastDonorsOfClosure(row)
  }

  return toAdminDto(row)
}

export async function archiveCampaign(adminId: number, id: number): Promise<AdminCampaignDto> {
  const existing = await findCampaignByIdAdmin(id)
  if (!existing) throw ApiError.notFound('Campaign not found')

  const row = await updateCampaignRow(id, { status: 'archived' })
  if (!row) throw ApiError.notFound('Campaign not found')

  void recordAudit({
    userId: adminId,
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

export async function deleteCampaign(adminId: number, id: number): Promise<void> {
  const existing = await findCampaignByIdAdmin(id)
  if (!existing) throw ApiError.notFound('Campaign not found')

  await softDeleteCampaign(id)
  void recordAudit({
    userId: adminId,
    action: AUDIT_ACTIONS.campaignDelete,
    entityType: 'campaign',
    entityId: id,
    details: { title: existing.title },
  })
}
