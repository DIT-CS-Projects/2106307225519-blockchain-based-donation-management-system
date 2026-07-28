import { and, count, desc, eq, ilike, isNull, or, type SQL } from 'drizzle-orm'
import { requireDb } from '../config/database'
import {
  fundraiserApplications,
  users,
  type FundraiserApplicationRow,
  type NewFundraiserApplicationRow,
  type UserRow,
} from '../database/schema'

export async function insertApplication(
  data: NewFundraiserApplicationRow,
): Promise<FundraiserApplicationRow> {
  const client = requireDb()
  const [row] = await client.insert(fundraiserApplications).values(data).returning()
  return row
}

/** The applicant's most recent application, whatever its status. */
export async function findLatestApplicationByUser(
  userId: number,
): Promise<FundraiserApplicationRow | undefined> {
  const client = requireDb()
  const [row] = await client
    .select()
    .from(fundraiserApplications)
    .where(eq(fundraiserApplications.userId, userId))
    .orderBy(desc(fundraiserApplications.createdAt))
    .limit(1)
  return row
}

export async function findApplicationById(
  id: number,
): Promise<FundraiserApplicationRow | undefined> {
  const client = requireDb()
  const [row] = await client
    .select()
    .from(fundraiserApplications)
    .where(eq(fundraiserApplications.id, id))
    .limit(1)
  return row
}

// --- Admin fundraisers directory (Decision 024) ---

export interface FundraiserListFilters {
  status?: FundraiserApplicationRow['status']
  search?: string
  page: number
  limit: number
}

export interface FundraiserListRow {
  applicationId: number
  userId: number
  fullName: string
  email: string
  phone: string
  accountStatus: UserRow['status']
  joinedAt: Date
  displayName: string
  causeDescription: string
  identityReference: string
  contactPhone: string
  applicationStatus: FundraiserApplicationRow['status']
  decisionReason: string | null
  appliedAt: Date
  reviewedAt: Date | null
}

const fundraiserColumns = {
  applicationId: fundraiserApplications.id,
  userId: users.id,
  fullName: users.fullName,
  email: users.email,
  phone: users.phone,
  accountStatus: users.status,
  joinedAt: users.createdAt,
  displayName: fundraiserApplications.displayName,
  causeDescription: fundraiserApplications.causeDescription,
  identityReference: fundraiserApplications.identityReference,
  contactPhone: fundraiserApplications.contactPhone,
  applicationStatus: fundraiserApplications.status,
  decisionReason: fundraiserApplications.decisionReason,
  appliedAt: fundraiserApplications.createdAt,
  reviewedAt: fundraiserApplications.reviewedAt,
} as const

/**
 * Fundraiser accounts and their application/approval state, for the admin
 * fundraisers console. Keyed on the fundraiser role: each self-registered
 * fundraiser has exactly one application row.
 */
export async function findFundraisersAdmin(
  filters: FundraiserListFilters,
): Promise<{ rows: FundraiserListRow[]; total: number }> {
  const client = requireDb()
  const conditions: SQL[] = [eq(users.role, 'fundraiser'), isNull(users.deletedAt)]
  if (filters.status) conditions.push(eq(fundraiserApplications.status, filters.status))
  if (filters.search) {
    const term = `%${filters.search}%`
    conditions.push(
      or(
        ilike(users.fullName, term),
        ilike(users.email, term),
        ilike(fundraiserApplications.displayName, term),
      )!,
    )
  }
  const where = and(...conditions)

  const [rows, [{ total }]] = await Promise.all([
    client
      .select(fundraiserColumns)
      .from(fundraiserApplications)
      .innerJoin(users, eq(users.id, fundraiserApplications.userId))
      .where(where)
      .orderBy(desc(fundraiserApplications.createdAt))
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit),
    client
      .select({ total: count() })
      .from(fundraiserApplications)
      .innerJoin(users, eq(users.id, fundraiserApplications.userId))
      .where(where),
  ])
  return { rows, total }
}

/** Count of applications awaiting review (admin review-queue badge). */
export async function countPendingApplications(): Promise<number> {
  const client = requireDb()
  const [row] = await client
    .select({ total: count() })
    .from(fundraiserApplications)
    .where(eq(fundraiserApplications.status, 'pending'))
  return row?.total ?? 0
}

export type ApplicationPatch = Partial<
  Pick<NewFundraiserApplicationRow, 'status' | 'reviewedBy' | 'decisionReason' | 'reviewedAt'>
>

export async function updateApplication(
  id: number,
  data: ApplicationPatch,
): Promise<FundraiserApplicationRow | undefined> {
  const client = requireDb()
  const [row] = await client
    .update(fundraiserApplications)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(fundraiserApplications.id, id))
    .returning()
  return row
}
