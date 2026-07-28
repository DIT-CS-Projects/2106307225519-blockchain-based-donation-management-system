import {
  countDonationsByDonor,
  countDonationsByDonorAndCampaign,
  findRewardEventsByUser,
  getPointsBalance,
  insertRewardEvents,
} from '../repositories/reward.repository'
import { logger } from '../utils/logger'
import type { DonationRow, NewRewardEventRow, RewardEventRow } from '../database/schema'

/** Donor-facing name for the loyalty currency (Decision 022). */
export const POINTS_LABEL = 'Impact Points'

// Earning rules. One place, so the client can display them and the awarding
// logic uses the same numbers (no drift).
const TZS_PER_POINT = 1000 // 1 point per 1,000 TZS donated
const MIN_POINTS_PER_DONATION = 1 // every donation earns at least this
const FIRST_DONATION_BONUS = 100 // one-time, on a donor's first ever donation
const NEW_CAMPAIGN_BONUS = 50 // each time a donor backs a campaign for the first time

// Tier ladder, ascending. A balance sits in the highest tier it clears.
export interface Tier {
  name: string
  min: number
}
const TIERS: Tier[] = [
  { name: 'Bronze', min: 0 },
  { name: 'Silver', min: 500 },
  { name: 'Gold', min: 2_000 },
  { name: 'Platinum', min: 5_000 },
]

function basePointsFor(amount: number): number {
  return Math.max(MIN_POINTS_PER_DONATION, Math.floor(amount / TZS_PER_POINT))
}

/**
 * Award Impact Points for a successful donation. Called fire-and-forget from the
 * payment flow, so failures are logged and never affect the donation. Insertion
 * is idempotent (unique donationId+type), so a duplicate callback is a no-op.
 */
export async function awardForDonation(donation: DonationRow): Promise<void> {
  try {
    const [donationCount, campaignCount] = await Promise.all([
      countDonationsByDonor(donation.donorId),
      countDonationsByDonorAndCampaign(donation.donorId, donation.campaignId),
    ])

    const events: NewRewardEventRow[] = [
      {
        userId: donation.donorId,
        type: 'donation',
        points: basePointsFor(donation.amount),
        donationId: donation.id,
        description: 'Donation made',
      },
    ]

    // The just-recorded donation is already counted, so "1" means "first".
    if (donationCount === 1) {
      events.push({
        userId: donation.donorId,
        type: 'first_donation',
        points: FIRST_DONATION_BONUS,
        donationId: donation.id,
        description: 'Welcome bonus for your first donation',
      })
    }
    if (campaignCount === 1) {
      events.push({
        userId: donation.donorId,
        type: 'new_campaign',
        points: NEW_CAMPAIGN_BONUS,
        donationId: donation.id,
        description: 'Bonus for supporting a new campaign',
      })
    }

    await insertRewardEvents(events)
    logger.info(`Awarded Impact Points for donation ${donation.id} (${events.length} event(s))`)
  } catch (error) {
    logger.error(`Failed to award Impact Points for donation ${donation.id}:`, error)
  }
}

export interface RewardEventDto {
  id: number
  type: RewardEventRow['type']
  points: number
  description: string
  donationId: number | null
  createdAt: string
}

export interface RewardsOverview {
  pointsLabel: string
  balance: number
  tier: Tier
  nextTier: { name: string; pointsNeeded: number } | null
  tiers: Tier[]
  rules: { basePer1000: number; minPerDonation: number; firstDonation: number; newCampaign: number }
  events: RewardEventDto[]
}

function tierFor(balance: number): Tier {
  return [...TIERS].reverse().find((t) => balance >= t.min) ?? TIERS[0]
}

function nextTierFor(balance: number): { name: string; pointsNeeded: number } | null {
  const next = TIERS.find((t) => t.min > balance)
  return next ? { name: next.name, pointsNeeded: next.min - balance } : null
}

/** Everything the rewards page needs: balance, tier, ladder, rules, history. */
export async function getOverview(userId: number): Promise<RewardsOverview> {
  const [balance, events] = await Promise.all([
    getPointsBalance(userId),
    findRewardEventsByUser(userId),
  ])

  return {
    pointsLabel: POINTS_LABEL,
    balance,
    tier: tierFor(balance),
    nextTier: nextTierFor(balance),
    tiers: TIERS,
    rules: {
      basePer1000: 1,
      minPerDonation: MIN_POINTS_PER_DONATION,
      firstDonation: FIRST_DONATION_BONUS,
      newCampaign: NEW_CAMPAIGN_BONUS,
    },
    events: events.map((e) => ({
      id: e.id,
      type: e.type,
      points: e.points,
      description: e.description,
      donationId: e.donationId,
      createdAt: e.createdAt.toISOString(),
    })),
  }
}
