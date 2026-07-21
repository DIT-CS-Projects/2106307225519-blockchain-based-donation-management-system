import { and, count, isNotNull, isNull, or, eq, sum } from 'drizzle-orm'
import { db } from '../config/database'
import { beneficiaries, blockchainRecords, campaigns } from '../database/schema'
import { ApiError } from '../utils/ApiError'

export interface PlatformStats {
  totalDonationsTZS: number
  totalCampaigns: number
  peopleHelped: number
  verifiedDonations: number
}

/** Platform totals for the landing page. Never shows fabricated numbers. */
export async function getPlatformStats(): Promise<PlatformStats> {
  if (!db) {
    throw new ApiError(503, 'Database is not available. Please try again shortly.')
  }

  const publicVisible = and(
    isNull(campaigns.deletedAt),
    or(eq(campaigns.status, 'active'), eq(campaigns.status, 'completed')),
  )

  const [[{ totalCampaigns, totalRaised }], [{ peopleHelped }], [{ verifiedDonations }]] =
    await Promise.all([
      db
        .select({ totalCampaigns: count(), totalRaised: sum(campaigns.raisedAmount) })
        .from(campaigns)
        .where(publicVisible),
      db
        .select({ peopleHelped: count() })
        .from(beneficiaries)
        .where(and(eq(beneficiaries.verified, true), isNull(beneficiaries.deletedAt))),
      db
        .select({ verifiedDonations: count() })
        .from(blockchainRecords)
        // blockchain_records is polymorphic (donations + disbursements, Stage 6);
        // this stat is specifically about donations.
        .where(and(eq(blockchainRecords.status, 'confirmed'), isNotNull(blockchainRecords.donationId))),
    ])

  return {
    totalDonationsTZS: Number(totalRaised ?? 0),
    totalCampaigns,
    peopleHelped,
    verifiedDonations,
  }
}
