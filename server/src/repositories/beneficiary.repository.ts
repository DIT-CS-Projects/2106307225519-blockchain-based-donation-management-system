import { and, count, desc, eq, isNull } from 'drizzle-orm'
import { requireDb } from '../config/database'
import { beneficiaries, type BeneficiaryRow, type NewBeneficiaryRow } from '../database/schema'

/** Total (non-deleted) beneficiaries, for the admin dashboard stat. */
export async function countBeneficiaries(): Promise<number> {
  const client = requireDb()
  const [row] = await client
    .select({ total: count() })
    .from(beneficiaries)
    .where(isNull(beneficiaries.deletedAt))
  return row?.total ?? 0
}

export interface PublicBeneficiaryFilters {
  campaignId?: number
}

/** Verified, non-deleted beneficiaries only (api/beneficiaries.md: donor read access). */
export async function findVerifiedBeneficiaries(
  filters: PublicBeneficiaryFilters,
): Promise<BeneficiaryRow[]> {
  const client = requireDb()
  const conditions = [eq(beneficiaries.verified, true), isNull(beneficiaries.deletedAt)]
  if (filters.campaignId) conditions.push(eq(beneficiaries.campaignId, filters.campaignId))
  return client
    .select()
    .from(beneficiaries)
    .where(and(...conditions))
    .orderBy(desc(beneficiaries.createdAt))
}

export async function findVerifiedBeneficiaryById(id: number): Promise<BeneficiaryRow | undefined> {
  const client = requireDb()
  const [row] = await client
    .select()
    .from(beneficiaries)
    .where(and(eq(beneficiaries.id, id), eq(beneficiaries.verified, true), isNull(beneficiaries.deletedAt)))
    .limit(1)
  return row
}

/** A verified beneficiary belonging to a specific campaign (disbursement eligibility). */
export async function findVerifiedBeneficiaryInCampaign(
  id: number,
  campaignId: number,
): Promise<BeneficiaryRow | undefined> {
  const client = requireDb()
  const [row] = await client
    .select()
    .from(beneficiaries)
    .where(
      and(
        eq(beneficiaries.id, id),
        eq(beneficiaries.campaignId, campaignId),
        eq(beneficiaries.verified, true),
        isNull(beneficiaries.deletedAt),
      ),
    )
    .limit(1)
  return row
}

// --- Admin: full visibility ---

export interface AdminBeneficiaryFilters {
  campaignId?: number
  verified?: boolean
  page: number
  limit: number
}

export async function findBeneficiariesAdmin(
  filters: AdminBeneficiaryFilters,
): Promise<{ rows: BeneficiaryRow[]; total: number }> {
  const client = requireDb()
  const conditions = [isNull(beneficiaries.deletedAt)]
  if (filters.campaignId) conditions.push(eq(beneficiaries.campaignId, filters.campaignId))
  if (filters.verified !== undefined) conditions.push(eq(beneficiaries.verified, filters.verified))
  const where = and(...conditions)

  const [rows, [{ total }]] = await Promise.all([
    client
      .select()
      .from(beneficiaries)
      .where(where)
      .orderBy(desc(beneficiaries.createdAt))
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit),
    client.select({ total: count() }).from(beneficiaries).where(where),
  ])
  return { rows, total }
}

export async function findBeneficiaryByIdAdmin(id: number): Promise<BeneficiaryRow | undefined> {
  const client = requireDb()
  const [row] = await client
    .select()
    .from(beneficiaries)
    .where(and(eq(beneficiaries.id, id), isNull(beneficiaries.deletedAt)))
    .limit(1)
  return row
}

export async function insertBeneficiary(data: NewBeneficiaryRow): Promise<BeneficiaryRow> {
  const client = requireDb()
  const [row] = await client.insert(beneficiaries).values(data).returning()
  return row
}

export type BeneficiaryUpdate = Partial<
  Pick<
    NewBeneficiaryRow,
    'name' | 'description' | 'category' | 'location' | 'mobileNumber' | 'contactInfo' | 'imageUrl'
  >
>

export async function updateBeneficiaryRow(
  id: number,
  data: BeneficiaryUpdate,
): Promise<BeneficiaryRow | undefined> {
  const client = requireDb()
  const [row] = await client
    .update(beneficiaries)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(beneficiaries.id, id))
    .returning()
  return row
}

export async function setBeneficiaryVerified(
  id: number,
  verified: boolean,
  verifiedBy: number,
): Promise<BeneficiaryRow | undefined> {
  const client = requireDb()
  const [row] = await client
    .update(beneficiaries)
    .set({
      verified,
      verifiedAt: verified ? new Date() : null,
      verifiedBy: verified ? verifiedBy : null,
      updatedAt: new Date(),
    })
    .where(eq(beneficiaries.id, id))
    .returning()
  return row
}

export async function softDeleteBeneficiary(id: number): Promise<void> {
  const client = requireDb()
  await client
    .update(beneficiaries)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(beneficiaries.id, id))
}
