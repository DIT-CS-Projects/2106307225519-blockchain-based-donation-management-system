import type { DisbursementProvider, QueuePayoutInput, QueuePayoutResult } from './provider'

/**
 * Local-development disbursement provider: completes every payout instantly,
 * no external credentials or callback round-trip needed. Set
 * DISBURSEMENT_PROVIDER=clickpesa for real mobile-money payouts.
 */
export class MockDisbursementProvider implements DisbursementProvider {
  readonly name = 'mock'

  async queuePayout(input: QueuePayoutInput): Promise<QueuePayoutResult> {
    return {
      completedImmediately: true,
      raw: { provider: 'mock', reference: input.reference, status: 'COMPLETED' },
    }
  }
}
