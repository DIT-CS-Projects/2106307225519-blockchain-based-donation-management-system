import { SQL, and, asc, count, desc, eq, ilike, isNull, ne, or } from 'drizzle-orm'
import { requireDb } from '../config/database'
import { campaigns, type CampaignRow } from '../database/schema'

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
