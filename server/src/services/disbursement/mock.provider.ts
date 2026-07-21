import type { DisbursementProvider, QueuePayoutInput, QueuePayoutResult } from './provider'

/**
 * Local-development disbursement provider: completes every payout instantly,
 * no external credentials or callback round-trip needed. Swap
 * DISBURSEMENT_PROVIDER=azampay for the real adapter once onboarded.
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
