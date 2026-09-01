export interface QueuePayoutInput {
  reference: string
  amount: number
  beneficiaryName: string
  beneficiaryMobileNumber: string
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
 * (docs/PAYMENT_ARCHITECTURE.md). The ClickPesa adapter uses the NGO's merchant
 * payout balance; the mock keeps the full approval + blockchain flow testable
 * locally without moving funds.
 */
export interface DisbursementProvider {
  readonly name: string
  queuePayout(input: QueuePayoutInput): Promise<QueuePayoutResult>
  /** Return the latest provider status, or null when it cannot be queried. */
  getPayoutStatus?(reference: string): Promise<string | null>
}
