import {
  findBeneficiariesAdmin,
  findBeneficiaryByIdAdmin,
  findVerifiedBeneficiaries,
  findVerifiedBeneficiaryById,
  insertBeneficiary,
  setBeneficiaryVerified,
  softDeleteBeneficiary,
  updateBeneficiaryRow,
  type AdminBeneficiaryFilters,
  type PublicBeneficiaryFilters,
} from '../repositories/beneficiary.repository'
import { findCampaignByIdAdmin } from '../repositories/campaign.repository'
import { findDistinctDonorIdsByCampaign } from '../repositories/donation.repository'
import type { BeneficiaryRow } from '../database/schema'
import { ApiError } from '../utils/ApiError'
import { AUDIT_ACTIONS, recordAudit } from './auditLog.service'
import { notify } from './notification.service'
import type { CreateBeneficiaryInput, UpdateBeneficiaryInput } from '../validation/beneficiary'

/** Public shape: no contact info (docs/BLOCKCHAIN_ARCHITECTURE.md-style PII discipline). */
export interface BeneficiaryDto {
  id: number
  campaignId: number
  name: string
  description: string
  category: string | null
  location: string | null
  imageUrl: string | null
  verified: boolean
  createdAt: string
}

function toDto(row: BeneficiaryRow): BeneficiaryDto {
  return {
    id: row.id,
    campaignId: row.campaignId,
    name: row.name,
    description: row.description,
    category: row.category,
    location: row.location,
    imageUrl: row.imageUrl,
    verified: row.verified,
    createdAt: row.createdAt.toISOString(),
  }
}

export async function listPublicBeneficiaries(
  filters: PublicBeneficiaryFilters,
): Promise<BeneficiaryDto[]> {
  const rows = await findVerifiedBeneficiaries(filters)
  return rows.map(toDto)
}

export async function getPublicBeneficiary(id: number): Promise<BeneficiaryDto> {
  const row = await findVerifiedBeneficiaryById(id)
  if (!row) throw ApiError.notFound('Beneficiary not found')
  return toDto(row)
}

// --- Admin ---

export interface AdminBeneficiaryDto extends BeneficiaryDto {
  contactInfo: string | null
  verifiedAt: string | null
  verifiedBy: number | null
}

function toAdminDto(row: BeneficiaryRow): AdminBeneficiaryDto {
  return {
    ...toDto(row),
    contactInfo: row.contactInfo,
    verifiedAt: row.verifiedAt?.toISOString() ?? null,
    verifiedBy: row.verifiedBy,
  }
}

export interface AdminBeneficiaryListResult {
  items: AdminBeneficiaryDto[]
  total: number
  page: number
  limit: number
}

export async function listBeneficiariesAdmin(
  filters: AdminBeneficiaryFilters,
): Promise<AdminBeneficiaryListResult> {
  const { rows, total } = await findBeneficiariesAdmin(filters)
  return { items: rows.map(toAdminDto), total, page: filters.page, limit: filters.limit }
}

export async function getBeneficiaryAdmin(id: number): Promise<AdminBeneficiaryDto> {
  const row = await findBeneficiaryByIdAdmin(id)
  if (!row) throw ApiError.notFound('Beneficiary not found')
  return toAdminDto(row)
}

export async function createBeneficiary(
  adminId: number,
  input: CreateBeneficiaryInput,
): Promise<AdminBeneficiaryDto> {
  const campaign = await findCampaignByIdAdmin(input.campaignId)
  if (!campaign) throw ApiError.badRequest('Campaign not found')

  const row = await insertBeneficiary({
    campaignId: input.campaignId,
    name: input.name,
    description: input.description,
    category: input.category ?? null,
    location: input.location ?? null,
    contactInfo: input.contactInfo ?? null,
    imageUrl: input.imageUrl ?? null,
  })
  void recordAudit({
    userId: adminId,
    action: AUDIT_ACTIONS.beneficiaryCreate,
    entityType: 'beneficiary',
    entityId: row.id,
    details: { name: row.name, campaignId: row.campaignId },
  })
  return toAdminDto(row)
}

export async function updateBeneficiary(
  adminId: number,
  id: number,
  input: UpdateBeneficiaryInput,
): Promise<AdminBeneficiaryDto> {
  const existing = await findBeneficiaryByIdAdmin(id)
  if (!existing) throw ApiError.notFound('Beneficiary not found')

  const row = await updateBeneficiaryRow(id, input)
  if (!row) throw ApiError.notFound('Beneficiary not found')

  void recordAudit({
    userId: adminId,
    action: AUDIT_ACTIONS.beneficiaryUpdate,
    entityType: 'beneficiary',
    entityId: row.id,
    details: { fields: Object.keys(input) },
  })

  if (row.verified) {
    void notifyPastDonorsOfUpdate(row)
  }
  return toAdminDto(row)
}

export async function setVerification(
  adminId: number,
  id: number,
  verified: boolean,
): Promise<AdminBeneficiaryDto> {
  const existing = await findBeneficiaryByIdAdmin(id)
  if (!existing) throw ApiError.notFound('Beneficiary not found')

  const row = await setBeneficiaryVerified(id, verified, adminId)
  if (!row) throw ApiError.notFound('Beneficiary not found')

  void recordAudit({
    userId: adminId,
    action: AUDIT_ACTIONS.beneficiaryVerify,
    entityType: 'beneficiary',
    entityId: row.id,
    details: { verified },
  })
  return toAdminDto(row)
}

async function notifyPastDonorsOfUpdate(beneficiary: BeneficiaryRow): Promise<void> {
  const donorIds = await findDistinctDonorIdsByCampaign(beneficiary.campaignId)
  if (donorIds.length === 0) return
  await notify({
    userIds: donorIds,
    type: 'beneficiary_updated',
    title: `An update on ${beneficiary.name}`,
    message: 'A beneficiary you helped support has an update on their campaign.',
    link: `/campaigns/${beneficiary.campaignId}`,
  })
}

export async function deleteBeneficiary(adminId: number, id: number): Promise<void> {
  const existing = await findBeneficiaryByIdAdmin(id)
  if (!existing) throw ApiError.notFound('Beneficiary not found')

  await softDeleteBeneficiary(id)
  void recordAudit({
    userId: adminId,
    action: AUDIT_ACTIONS.beneficiaryDelete,
    entityType: 'beneficiary',
    entityId: id,
    details: { name: existing.name },
  })
}
