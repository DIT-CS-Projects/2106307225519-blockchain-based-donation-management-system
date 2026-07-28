import { SQL, and, asc, count, desc, eq, gte, ilike, inArray, isNull, lte, ne, or, sql } from 'drizzle-orm'
import { requireDb } from '../config/database'
import { campaigns, type CampaignRow, type NewCampaignRow } from '../database/schema'

export type CampaignSort = 'newest' | 'endingSoon' | 'mostFunded' | 'alphabetical'

export interface CampaignListFilters {
  search?: string
  category?: CampaignRow['category']
  featured?: boolean
  sort: CampaignSort
  page: number
  limit: number
}

/** Statuses visible to the public site. */
const PUBLIC_STATUSES: SQL = or(
  eq(campaigns.status, 'active'),
  eq(campaigns.status, 'completed'),
)!

const SORT_ORDER = {
  newest: desc(campaigns.createdAt),
  endingSoon: asc(campaigns.endDate),
  mostFunded: desc(campaigns.raisedAmount),
  alphabetical: asc(campaigns.title),
} as const

export async function findCampaigns(
  filters: CampaignListFilters,
): Promise<{ rows: CampaignRow[]; total: number }> {
  const client = requireDb()

  const conditions: SQL[] = [isNull(campaigns.deletedAt), PUBLIC_STATUSES]
  if (filters.category) conditions.push(eq(campaigns.category, filters.category))
  if (filters.featured) conditions.push(eq(campaigns.featured, true))
  if (filters.search) {
    const term = `%${filters.search}%`
    conditions.push(or(ilike(campaigns.title, term), ilike(campaigns.description, term))!)
  }

  const where = and(...conditions)

  const [rows, [{ total }]] = await Promise.all([
    client
      .select()
      .from(campaigns)
      .where(where)
      .orderBy(SORT_ORDER[filters.sort])
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit),
    client.select({ total: count() }).from(campaigns).where(where),
  ])

  return { rows, total }
}

export async function findCampaignById(id: number): Promise<CampaignRow | undefined> {
  const client = requireDb()
  const [row] = await client
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, id), isNull(campaigns.deletedAt), PUBLIC_STATUSES))
    .limit(1)
  return row
}

/**
 * A campaign that can currently accept donations: active, not soft-deleted, and
 * within its start/end window (docs/BUSINESS_RULES.md: Campaign Rules).
 */
export async function findDonatableCampaign(id: number): Promise<CampaignRow | undefined> {
  const client = requireDb()
  const now = new Date()
  const [row] = await client
    .select()
    .from(campaigns)
    .where(
      and(
        eq(campaigns.id, id),
        eq(campaigns.status, 'active'),
        isNull(campaigns.deletedAt),
        lte(campaigns.startDate, now),
        gte(campaigns.endDate, now),
      ),
    )
    .limit(1)
  return row
}

// --- Admin: full visibility, no public-status filter ---

export interface AdminCampaignListFilters {
  status?: CampaignRow['status']
  page: number
  limit: number
}

export async function findCampaignsAdmin(
  filters: AdminCampaignListFilters,
): Promise<{ rows: CampaignRow[]; total: number }> {
  const client = requireDb()
  const conditions: SQL[] = [isNull(campaigns.deletedAt)]
  if (filters.status) conditions.push(eq(campaigns.status, filters.status))
  const where = and(...conditions)

  const [rows, [{ total }]] = await Promise.all([
    client
      .select()
      .from(campaigns)
      .where(where)
      .orderBy(desc(campaigns.createdAt))
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit),
    client.select({ total: count() }).from(campaigns).where(where),
  ])
  return { rows, total }
}

export async function findCampaignByIdAdmin(id: number): Promise<CampaignRow | undefined> {
  const client = requireDb()
  const [row] = await client
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, id), isNull(campaigns.deletedAt)))
    .limit(1)
  return row
}

/** Campaigns owned by a given user (fundraiser dashboard — Decision 020). */
export async function findCampaignsByOwner(
  ownerId: number,
  filters: AdminCampaignListFilters,
): Promise<{ rows: CampaignRow[]; total: number }> {
  const client = requireDb()
  const conditions: SQL[] = [isNull(campaigns.deletedAt), eq(campaigns.ownerId, ownerId)]
  if (filters.status) conditions.push(eq(campaigns.status, filters.status))
  const where = and(...conditions)

  const [rows, [{ total }]] = await Promise.all([
    client
      .select()
      .from(campaigns)
      .where(where)
      .orderBy(desc(campaigns.createdAt))
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit),
    client.select({ total: count() }).from(campaigns).where(where),
  ])
  return { rows, total }
}

export async function insertCampaign(data: NewCampaignRow): Promise<CampaignRow> {
  const client = requireDb()
  const [row] = await client.insert(campaigns).values(data).returning()
  return row
}

export type CampaignUpdate = Partial<
  Pick<
    NewCampaignRow,
    | 'title'
    | 'description'
    | 'category'
    | 'imageUrl'
    | 'targetAmount'
    | 'startDate'
    | 'endDate'
    | 'status'
    | 'featured'
    | 'rejectionReason'
  >
>

export async function updateCampaignRow(
  id: number,
  data: CampaignUpdate,
): Promise<CampaignRow | undefined> {
  const client = requireDb()
  const [row] = await client
    .update(campaigns)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(campaigns.id, id))
    .returning()
  return row
}

export async function softDeleteCampaign(id: number): Promise<void> {
  const client = requireDb()
  await client
    .update(campaigns)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(campaigns.id, id))
}

/**
 * Per-owner campaign totals (count and money raised) for a set of owners, in a
 * single grouped query. Used by the admin fundraisers directory (Decision 024).
 */
export async function aggregateCampaignsByOwners(
  ownerIds: number[],
): Promise<Map<number, { count: number; raised: number }>> {
  if (ownerIds.length === 0) return new Map()
  const client = requireDb()
  const rows = await client
    .select({
      ownerId: campaigns.ownerId,
      total: count(),
      raised: sql<number>`coalesce(sum(${campaigns.raisedAmount}), 0)`,
    })
    .from(campaigns)
    .where(and(inArray(campaigns.ownerId, ownerIds), isNull(campaigns.deletedAt)))
    .groupBy(campaigns.ownerId)
  return new Map(
    rows
      .filter((r): r is typeof r & { ownerId: number } => r.ownerId != null)
      .map((r) => [r.ownerId, { count: Number(r.total), raised: Number(r.raised) }]),
  )
}

/** Count of campaigns in a given status (admin dashboard stat). */
export async function countCampaignsByStatus(status: CampaignRow['status']): Promise<number> {
  const client = requireDb()
  const [row] = await client
    .select({ total: count() })
    .from(campaigns)
    .where(and(eq(campaigns.status, status), isNull(campaigns.deletedAt)))
  return row?.total ?? 0
}

export async function findRelatedCampaigns(
  category: CampaignRow['category'],
  excludeId: number,
  limit: number,
): Promise<CampaignRow[]> {
  const client = requireDb()
  return client
    .select()
    .from(campaigns)
    .where(
      and(
        eq(campaigns.category, category),
        eq(campaigns.status, 'active'),
        isNull(campaigns.deletedAt),
        ne(campaigns.id, excludeId),
      ),
    )
    .orderBy(desc(campaigns.createdAt))
    .limit(limit)
}
