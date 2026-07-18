import type { PaymentMethodKey } from '../../constants/donations'
import type { PaymentTransactionRow } from '../../database/schema'

/** What the backend hands a provider to open a checkout session. */
export interface CreateSessionInput {
  reference: string
  amount: number
  currency: string
  method: PaymentMethodKey
  provider: string
  campaignTitle: string
  /** Capability secret the provider must echo back on the callback. */
  callbackToken: string
}

/** What a provider returns once a checkout session exists. */
export interface CreateSessionResult {
  checkoutUrl: string
  expiresAt: Date
  raw?: unknown
}

/** Normalized outcome extracted from a provider callback. */
export type NormalizedPaymentStatus = 'success' | 'failed' | 'cancelled'

export interface VerifyCallbackResult {
  status: NormalizedPaymentStatus
  /** Whether the callback is authentic for the given transaction. */
  verified: boolean
  raw: unknown
}

/**
 * A payment provider adapter. The backend talks to every gateway through this
 * interface so business logic never depends on a specific provider
 * (docs/PAYMENT_ARCHITECTURE.md: Payment Service Layer). Real AzamPay drops in
 * as another implementation with no changes to the payment service.
 */
export interface PaymentProvider {
  readonly name: string
  createSession(input: CreateSessionInput): Promise<CreateSessionResult>
  /** Pull the payment reference out of a raw callback payload. */
  extractReference(payload: unknown): string | null
  /** Verify authenticity and read the outcome, given the stored transaction. */
  verifyCallback(payload: unknown, transaction: PaymentTransactionRow): VerifyCallbackResult
}
