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
  /** Payer mobile number, required by mobile-money rails (AzamPay MNO push). */
  accountNumber?: string
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
 * Out-of-body signals a provider may need to authenticate a callback, taken from
 * the HTTP request rather than the payload. AzamPay uses the secret carried in
 * the registered callback URL (?key=...); the mock ignores this.
 */
export interface CallbackContext {
  callbackKey?: string
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
  verifyCallback(
    payload: unknown,
    transaction: PaymentTransactionRow,
    context?: CallbackContext,
  ): VerifyCallbackResult
  /**
   * Optional authoritative gateway lookup. Used as a recovery path when a
   * gateway webhook is delayed or misconfigured, never as a browser-facing API.
   */
  getTransactionStatus?(transaction: PaymentTransactionRow): Promise<VerifyCallbackResult | null>
}
