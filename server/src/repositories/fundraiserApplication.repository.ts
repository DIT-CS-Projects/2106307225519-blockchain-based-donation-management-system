import { and, count, desc, eq, type SQL } from 'drizzle-orm'
import { requireDb } from '../config/database'
import {
  fundraiserApplications,
  users,
  type FundraiserApplicationRow,
  type NewFundraiserApplicationRow,
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

/** A still-open (pending) application for the user, if any. */
export async function findPendingApplicationByUser(
  userId: number,
): Promise<FundraiserApplicationRow | undefined> {
  const client = requireDb()
  const [row] = await client
    .select()
    .from(fundraiserApplications)
    .where(
      and(
        eq(fundraiserApplications.userId, userId),
        eq(fundraiserApplications.status, 'pending'),
      ),
    )
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

export interface ApplicationListFilters {
  status?: FundraiserApplicationRow['status']
  page: number
  limit: number
}

export interface ApplicationListRow {
  id: number
  userId: number
  applicantName: string
  applicantEmail: string
  displayName: string
  causeDescription: string
  identityReference: string
  contactPhone: string
  status: FundraiserApplicationRow['status']
  decisionReason: string | null
  createdAt: Date
  reviewedAt: Date | null
}

const listColumns = {
  id: fundraiserApplications.id,
  userId: fundraiserApplications.userId,
  applicantName: users.fullName,
  applicantEmail: users.email,
  displayName: fundraiserApplications.displayName,
  causeDescription: fundraiserApplications.causeDescription,
  identityReference: fundraiserApplications.identityReference,
  contactPhone: fundraiserApplications.contactPhone,
  status: fundraiserApplications.status,
  decisionReason: fundraiserApplications.decisionReason,
  createdAt: fundraiserApplications.createdAt,
  reviewedAt: fundraiserApplications.reviewedAt,
} as const

export async function findApplications(
  filters: ApplicationListFilters,
): Promise<{ rows: ApplicationListRow[]; total: number }> {
  const client = requireDb()
  const conditions: SQL[] = []
  if (filters.status) conditions.push(eq(fundraiserApplications.status, filters.status))
  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [rows, [{ total }]] = await Promise.all([
    client
      .select(listColumns)
      .from(fundraiserApplications)
      .innerJoin(users, eq(users.id, fundraiserApplications.userId))
      .where(where)
      .orderBy(desc(fundraiserApplications.createdAt))
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit),
    client.select({ total: count() }).from(fundraiserApplications).where(where),
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
