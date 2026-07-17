import { and, count, isNull, or, eq, sum } from 'drizzle-orm'
import { db } from '../config/database'
import { campaigns } from '../database/schema'
import { ApiError } from '../utils/ApiError'

export interface PlatformStats {
  totalDonationsTZS: number
  totalCampaigns: number
  peopleHelped: number
  verifiedDonations: number
}

/**
 * Platform totals for the landing page. Donation- and beneficiary-derived
 * numbers switch to their own tables when those modules land (Stages 4–6);
 * until then they are 0 and the client hides what it can't prove.
 */
export async function getPlatformStats(): Promise<PlatformStats> {
  if (!db) {
    throw new ApiError(503, 'Database is not available. Please try again shortly.')
  }

  const publicVisible = and(
    isNull(campaigns.deletedAt),
    or(eq(campaigns.status, 'active'), eq(campaigns.status, 'completed')),
  )

  const [{ totalCampaigns, totalRaised }] = await db
    .select({ totalCampaigns: count(), totalRaised: sum(campaigns.raisedAmount) })
    .from(campaigns)
    .where(publicVisible)

  return {
    totalDonationsTZS: Number(totalRaised ?? 0),
    totalCampaigns,
    peopleHelped: 0,
    verifiedDonations: 0,
  }
}
