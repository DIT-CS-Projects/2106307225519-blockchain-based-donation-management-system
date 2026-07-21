import { bigint, pgEnum, pgTable, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core'
import { donations } from './donations'
import { disbursements } from './disbursements'

// Blockchain proof lifecycle. Stage 4/6 insert 'pending'; Stage 5 moves rows
// to 'confirmed' once the on-chain transaction settles.
export const proofStatus = pgEnum('proof_status', ['pending', 'confirmed', 'failed'])

/**
 * Authoritative source for blockchain proof data (database/DATABASE_SCHEMA.md).
 * One row per donation OR per disbursement (exactly one of donationId /
 * disbursementId is set, mirroring the contract's own RecordType), matching
 * TransparencyRegistry.sol recording both under one Proof concept. Never
 * deleted. A plain unique index on a nullable column allows unlimited NULLs
 * (Postgres treats NULL <> NULL), so this needs no partial index.
 */
export const blockchainRecords = pgTable(
  'blockchain_records',
  {
    id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
    donationId: bigint('donation_id', { mode: 'number' }).references(() => donations.id),
    disbursementId: bigint('disbursement_id', { mode: 'number' }).references(
      () => disbursements.id,
    ),
    status: proofStatus('status').notNull().default('pending'),
    txHash: varchar('tx_hash', { length: 66 }),
    network: varchar('network', { length: 40 }),
    blockNumber: bigint('block_number', { mode: 'number' }),
    recordedAt: timestamp('recorded_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('blockchain_records_donation_unique').on(table.donationId),
    uniqueIndex('blockchain_records_disbursement_unique').on(table.disbursementId),
  ],
)

export type BlockchainRecordRow = typeof blockchainRecords.$inferSelect
export type NewBlockchainRecordRow = typeof blockchainRecords.$inferInsert
