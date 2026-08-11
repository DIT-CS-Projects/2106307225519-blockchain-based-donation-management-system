import { timingSafeEqual } from 'node:crypto'
import { env } from '../../config/env'
import type { PaymentTransactionRow } from '../../database/schema'
import { ApiError } from '../../utils/ApiError'
import { logger } from '../../utils/logger'
import { AzampayClient, type AzampayConfig } from './azampay.client'
import { assertBankFallbackAllowed } from './bankFallback'
import { MockPaymentProvider } from './mock.provider'
import type {
  CallbackContext,
  CreateSessionInput,
  CreateSessionResult,
  NormalizedPaymentStatus,
  PaymentProvider,
  VerifyCallbackResult,
} from './provider'

// Our provider keys mapped to AzamPay operator names. 'mixx' (Mixx by Yas,
// formerly Tigo Pesa) is 'Tigo' at AzamPay.
const MNO_PROVIDER_MAP: Record<string, string> = {
  mpesa: 'Mpesa',
  airtel: 'Airtel',
  mixx: 'Tigo',
  halopesa: 'Halopesa',
}

/**
 * AzamPay adapter for the mobile-money rail. createSession triggers a USSD/PIN
 * push to the payer's handset (no hosted checkout page) and points the donor at
 * the in-app waiting screen; the async callback later resolves the transaction.
 * The bank rail is not on AzamPay yet, so it delegates to the mock provider so
 * bank checkouts keep working while PAYMENT_PROVIDER=azampay
 * (docs/PAYMENT_ARCHITECTURE.md).
 */
export class AzampayProvider implements PaymentProvider {
  readonly name = 'azampay'
  private readonly client: AzampayClient
  private readonly bankFallback: PaymentProvider = new MockPaymentProvider()

  constructor(private readonly config: AzampayConfig) {
    this.client = new AzampayClient(config)
  }

  async createSession(input: CreateSessionInput): Promise<CreateSessionResult> {
    if (input.method !== 'mobile_money') {
      assertBankFallbackAllowed()
      return this.bankFallback.createSession(input)
    }

    const operator = MNO_PROVIDER_MAP[input.provider]
    if (!operator) {
      throw ApiError.badRequest('This mobile money provider is not supported.')
    }
    const accountNumber = normalizeMsisdn(input.accountNumber)
    if (!accountNumber) {
      throw ApiError.badRequest('Enter a valid mobile money number to pay from.')
    }

    const result = await this.client.mnoCheckout({
      accountNumber,
      amount: input.amount,
      currency: input.currency,
      externalId: input.reference,
      provider: operator,
    })
    if (!result.success) {
      logger.warn(
        `AzamPay declined checkout for ${input.reference}: ${result.message ?? 'no message'}`,
      )
      throw ApiError.badGateway(result.message || 'The payment could not be started. Please try again.')
    }

    // No hosted page in the MNO flow: the donor approves the push on their phone.
    // Point at the in-app waiting screen, which polls status until the callback
    // resolves it. No capability token, so the checkout page shows the push UI.
    const checkoutUrl = new URL(`/pay/${input.reference}`, env.CLIENT_ORIGIN).toString()
    const ttlMs = env.PAYMENT_SESSION_TTL_MINUTES * 60_000
    return {
      checkoutUrl,
      expiresAt: new Date(Date.now() + ttlMs),
      raw: { provider: 'azampay', transactionId: result.transactionId, response: result.raw },
    }
  }

  extractReference(payload: unknown): string | null {
    const record = asRecord(payload)
    if (!record) return null
    // AzamPay MNO echoes our reference as utilityref; a mock bank callback carries
    // it as `reference`, which the fallback reads.
    return firstString(record, ['utilityref', 'utilityRef', 'externalId']) ?? this.bankFallback.extractReference(payload)
  }

  verifyCallback(
    payload: unknown,
    transaction: PaymentTransactionRow,
    context?: CallbackContext,
  ): VerifyCallbackResult {
    // Bank transactions still resolve through the mock's capability-token check.
    if (transaction.method !== 'mobile_money') {
      assertBankFallbackAllowed()
      return this.bankFallback.verifyCallback(payload, transaction, context)
    }

    const record = asRecord(payload) ?? {}
    const keyOk = safeEqual(context?.callbackKey, this.config.callbackSecret)
    const refOk =
      firstString(record, ['utilityref', 'utilityRef', 'externalId']) === transaction.reference
    const amountOk = readAmount(record) === transaction.amount
    const verified = keyOk && refOk && amountOk

    const rawStatus = (
      firstString(record, ['transactionstatus', 'transactionStatus', 'status']) ?? ''
    ).toLowerCase()
    const status: NormalizedPaymentStatus = rawStatus === 'success' ? 'success' : 'failed'
    return { status, verified, raw: payload }
  }
}

/**
 * Normalize a Tanzanian mobile number to AzamPay's local format (0XXXXXXXXX).
 * Accepts +255/255/0/bare-9-digit input; returns null if it is not a valid
 * TZ mobile number (prefixes 06/07).
 */
function normalizeMsisdn(raw?: string): string | null {
  if (!raw) return null
  const digits = raw.replace(/\D/g, '')
  let local: string
  if (digits.length === 12 && digits.startsWith('255')) local = `0${digits.slice(3)}`
  else if (digits.length === 10 && digits.startsWith('0')) local = digits
  else if (digits.length === 9) local = `0${digits}`
  else return null
  return /^0[67]\d{8}$/.test(local) ? local : null
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null
}

function firstString(record: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.length > 0) return value
  }
  return undefined
}

function readAmount(record: Record<string, unknown>): number | null {
  const value = record.amount
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN
  return Number.isFinite(parsed) ? Math.round(parsed) : null
}

/** Constant-time string comparison that is safe on unequal lengths. */
function safeEqual(a: string | undefined, b: string): boolean {
  if (!a) return false
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}
