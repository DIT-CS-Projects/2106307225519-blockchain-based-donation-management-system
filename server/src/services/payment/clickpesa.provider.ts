import { timingSafeEqual } from 'node:crypto'
import { env } from '../../config/env'
import { PAYMENT_REFERENCE_PREFIX } from '../../constants/donations'
import type { PaymentTransactionRow } from '../../database/schema'
import { ApiError } from '../../utils/ApiError'
import { logger } from '../../utils/logger'
import { assertBankFallbackAllowed } from './bankFallback'
import { ClickPesaClient, computeChecksum, type ClickPesaConfig } from './clickpesa.client'
import { MockPaymentProvider } from './mock.provider'
import type {
  CallbackContext,
  CreateSessionInput,
  CreateSessionResult,
  NormalizedPaymentStatus,
  PaymentProvider,
  VerifyCallbackResult,
} from './provider'

/**
 * ClickPesa adapter for the mobile-money rail. createSession sends a USSD/PIN
 * push to the payer's handset and points the donor at the in-app waiting screen;
 * the async webhook later resolves the transaction.
 *
 * ClickPesa routes on the phone number alone, so the donor's chosen operator is
 * not sent. The operator it actually used comes back as `channel` and is kept in
 * the stored provider response (docs/PAYMENT_ARCHITECTURE.md).
 *
 * The bank rail is not onboarded here, so it delegates to the mock provider,
 * which stays closed in production.
 */
export class ClickPesaProvider implements PaymentProvider {
  readonly name = 'clickpesa'
  private readonly client: ClickPesaClient
  private readonly bankFallback: PaymentProvider = new MockPaymentProvider()

  constructor(private readonly config: ClickPesaConfig) {
    this.client = new ClickPesaClient(config)
  }

  async createSession(input: CreateSessionInput): Promise<CreateSessionResult> {
    if (input.method !== 'mobile_money') {
      assertBankFallbackAllowed()
      return this.bankFallback.createSession(input)
    }

    const phoneNumber = normalizeMsisdn(input.accountNumber)
    if (!phoneNumber) {
      throw ApiError.badRequest('Enter a valid mobile money number to pay from.')
    }

    const result = await this.client.initiateUssdPush({
      amount: input.amount,
      currency: input.currency,
      orderReference: toOrderReference(input.reference),
      phoneNumber,
    })

    // PROCESSING means the prompt is on its way and the donor has yet to enter a
    // PIN, which is the normal path. Anything terminal-and-failed stops here.
    if (result.status === 'FAILED') {
      logger.warn(`ClickPesa declined checkout for ${input.reference}`)
      throw ApiError.badGateway('The payment could not be started. Please try again.')
    }

    // No hosted page: the donor approves the push on their phone. Point at the
    // in-app waiting screen, which polls until the webhook resolves it. No
    // capability token, so that page shows the push UI rather than mock buttons.
    const checkoutUrl = new URL(`/pay/${input.reference}`, env.CLIENT_ORIGIN).toString()
    const ttlMs = env.PAYMENT_SESSION_TTL_MINUTES * 60_000
    return {
      checkoutUrl,
      expiresAt: new Date(Date.now() + ttlMs),
      raw: {
        provider: 'clickpesa',
        id: result.id,
        channel: result.channel,
        status: result.status,
        response: result.raw,
      },
    }
  }

  extractReference(payload: unknown): string | null {
    const data = webhookData(payload)
    const orderReference = readString(data, 'orderReference')
    if (orderReference) {
      return fromOrderReference(orderReference)
    }
    // A mock bank callback carries `reference`, which the fallback reads.
    return this.bankFallback.extractReference(payload)
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

    const data = webhookData(payload)

    // ClickPesa sends no signature header, so the secret on the registered
    // webhook URL is the primary proof that this callback is ours.
    const keyOk = safeEqual(context?.callbackKey, this.config.webhookSecret)
    const refOk = fromOrderReference(readString(data, 'orderReference') ?? '') === transaction.reference

    // A failure notice carries no collected amount, so only require the amount to
    // match when one is present. Success without a matching amount is rejected.
    const collected = readAmount(data)
    const rawStatus = (readString(data, 'status') ?? '').toUpperCase()
    const isSuccess = rawStatus === 'SUCCESS' || rawStatus === 'SETTLED'
    const amountOk = isSuccess ? collected === transaction.amount : true

    const checksumOk = this.checksumOk(data)

    const verified = keyOk && refOk && amountOk && checksumOk
    if (!verified) {
      logger.warn(
        `ClickPesa webhook rejected for ${transaction.reference}: ` +
          `key=${keyOk} ref=${refOk} amount=${amountOk} checksum=${checksumOk}`,
      )
    }

    const status: NormalizedPaymentStatus = isSuccess ? 'success' : 'failed'
    return { status, verified, raw: payload }
  }

  /**
   * A token-authenticated ClickPesa status lookup is the recovery mechanism
   * for a missed webhook. It repeats the same reference and amount checks as a
   * webhook before the payment service may finalize a donation.
   */
  async getTransactionStatus(transaction: PaymentTransactionRow): Promise<VerifyCallbackResult | null> {
    if (transaction.method !== 'mobile_money') return null
    const result = await this.client.getPayment(toOrderReference(transaction.reference))
    if (!result || !result.status || result.status === 'PROCESSING' || result.status === 'PENDING') {
      return null
    }

    const referenceOk = fromOrderReference(result.orderReference ?? '') === transaction.reference
    const successful = result.status === 'SUCCESS' || result.status === 'SETTLED'
    const amountOk = !successful || result.collectedAmount === transaction.amount
    if (!referenceOk || !amountOk) {
      logger.warn(`ClickPesa status lookup rejected for ${transaction.reference}: ref=${referenceOk} amount=${amountOk}`)
      return null
    }
    return {
      status: successful ? 'success' : 'failed',
      verified: true,
      raw: result.raw,
    }
  }

  /**
   * Verify the webhook checksum when both a key is configured and the payload
   * carries one. Absent either, there is nothing to check and the URL secret
   * remains the proof of authenticity.
   */
  private checksumOk(data: Record<string, unknown>): boolean {
    const provided = readString(data, 'checksum')
    if (!this.config.checksumKey || !provided) return true
    return safeEqual(provided, computeChecksum(data, this.config.checksumKey))
  }
}

/** Unwrap `{ event, data }` webhooks; tolerate a flat payload. */
function webhookData(payload: unknown): Record<string, unknown> {
  const record = asRecord(payload)
  if (!record) return {}
  return asRecord(record.data) ?? record
}

/**
 * ClickPesa requires an alphanumeric order reference, so the hyphens in our
 * `CHG-2026-ABCD1234` format are stripped on the way out and restored on the way
 * back. The layout is fixed (prefix, 4-digit year, code), which makes the round
 * trip exact rather than a lookup.
 */
function toOrderReference(reference: string): string {
  return reference.replace(/[^A-Za-z0-9]/g, '')
}

function fromOrderReference(orderReference: string): string | null {
  const prefix = PAYMENT_REFERENCE_PREFIX
  if (!orderReference.startsWith(prefix)) return null
  const rest = orderReference.slice(prefix.length)
  // 4-digit year plus at least one character of code.
  if (!/^\d{4}.+$/.test(rest)) return null
  return `${prefix}-${rest.slice(0, 4)}-${rest.slice(4)}`
}

/**
 * Normalize a Tanzanian mobile number to ClickPesa's format (255XXXXXXXXX).
 * Accepts +255/255/0/bare-9-digit input; returns null if it is not a valid TZ
 * mobile number (prefixes 06/07).
 */
function normalizeMsisdn(raw?: string): string | null {
  if (!raw) return null
  const digits = raw.replace(/\D/g, '')
  let local: string
  if (digits.length === 12 && digits.startsWith('255')) local = `0${digits.slice(3)}`
  else if (digits.length === 10 && digits.startsWith('0')) local = digits
  else if (digits.length === 9) local = `0${digits}`
  else return null
  return /^0[67]\d{8}$/.test(local) ? `255${local.slice(1)}` : null
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null
}

function readString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function readAmount(record: Record<string, unknown>): number | null {
  const value = record.collectedAmount ?? record.amount
  const parsed =
    typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN
  return Number.isFinite(parsed) ? Math.round(parsed) : null
}

/** Constant-time comparison that is safe on unequal lengths. */
function safeEqual(a: string | undefined, b: string): boolean {
  if (!a) return false
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}
