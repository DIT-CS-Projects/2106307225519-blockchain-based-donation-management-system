export interface QueuePayoutInput {
  reference: string
  amount: number
  beneficiaryName: string
  purpose: string
}

export interface QueuePayoutResult {
  /** True when the mock/sandbox provider completes the payout immediately. */
  completedImmediately: boolean
  raw?: unknown
}

/**
 * The backend talks to the disbursement (payout) gateway through this
 * abstraction, same pattern as the donation PaymentProvider
 * (docs/PAYMENT_ARCHITECTURE.md). A real AzamPay disbursement adapter drops in
 * behind this interface once onboarded; until then the mock completes payouts
 * instantly so the full dual-approval + blockchain flow is testable locally.
 */
export interface DisbursementProvider {
  readonly name: string
  queuePayout(input: QueuePayoutInput): Promise<QueuePayoutResult>
}
