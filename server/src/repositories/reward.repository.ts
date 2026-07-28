import { and, desc, eq, sql } from 'drizzle-orm'
import { requireDb } from '../config/database'
import { donations, rewardEvents, type NewRewardEventRow, type RewardEventRow } from '../database/schema'

/**
 * Insert one or more reward events. Idempotent: a duplicate (donationId, type)
 * is silently ignored via the unique index, so a re-processed payment callback
 * never double-awards points.
 */
export async function insertRewardEvents(events: NewRewardEventRow[]): Promise<void> {
  if (events.length === 0) return
  const client = requireDb()
  await client.insert(rewardEvents).values(events).onConflictDoNothing()
}

/** A donor's lifetime Impact Points balance (sum of the ledger). */
export async function getPointsBalance(userId: number): Promise<number> {
  const client = requireDb()
  const [row] = await client
    .select({ total: sql<string>`coalesce(sum(${rewardEvents.points}), 0)` })
    .from(rewardEvents)
    .where(eq(rewardEvents.userId, userId))
  return Number(row?.total ?? 0)
}

/** A donor's reward events, newest first. */
export async function findRewardEventsByUser(userId: number): Promise<RewardEventRow[]> {
  const client = requireDb()
  return client
    .select()
    .from(rewardEvents)
    .where(eq(rewardEvents.userId, userId))
    .orderBy(desc(rewardEvents.createdAt))
}

/** How many donations a donor has made in total (used to detect their first). */
export async function countDonationsByDonor(donorId: number): Promise<number> {
  const client = requireDb()
  const [row] = await client
    .select({ total: sql<string>`count(*)` })
    .from(donations)
    .where(eq(donations.donorId, donorId))
  return Number(row?.total ?? 0)
}

/** How many donations a donor has made to one campaign (used to detect a new one). */
export async function countDonationsByDonorAndCampaign(
  donorId: number,
  campaignId: number,
): Promise<number> {
  const client = requireDb()
  const [row] = await client
    .select({ total: sql<string>`count(*)` })
    .from(donations)
    .where(and(eq(donations.donorId, donorId), eq(donations.campaignId, campaignId)))
  return Number(row?.total ?? 0)
}
