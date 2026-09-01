import { createHmac } from 'node:crypto'
import { env } from '../../config/env'
import { ApiError } from '../../utils/ApiError'
import { logger } from '../../utils/logger'

/**
 * Everything the ClickPesa adapter needs. Read from the environment once
 * (docs/PAYMENT_ARCHITECTURE.md); null means the integration is not fully
 * configured and the factory should fall back to the mock.
 */
export interface ClickPesaConfig {
  clientId: string
  apiKey: string
  baseUrl: string
  webhookSecret: string
  /** Optional: when set, requests carry a checksum and webhooks are verified against it. */
  checksumKey?: string
}

/** The ClickPesa config, or null if a required credential is missing. */
export function readClickPesaConfig(): ClickPesaConfig | null {
  const { CLICKPESA_CLIENT_ID, CLICKPESA_API_KEY, CLICKPESA_WEBHOOK_SECRET } = env
  if (!CLICKPESA_CLIENT_ID || !CLICKPESA_API_KEY || !CLICKPESA_WEBHOOK_SECRET) {
    return null
  }
  return {
    clientId: CLICKPESA_CLIENT_ID,
    apiKey: CLICKPESA_API_KEY,
    baseUrl: env.CLICKPESA_BASE_URL,
    webhookSecret: CLICKPESA_WEBHOOK_SECRET,
    checksumKey: env.CLICKPESA_CHECKSUM_KEY,
  }
}

const REQUEST_TIMEOUT_MS = 30_000
// ClickPesa tokens last an hour. Refresh early so a request never rides an
// expiring token, but not so early that we waste the pre-KYC call budget.
const TOKEN_TTL_MS = 55 * 60_000

export interface UssdPushInput {
  /** Whole shillings; serialized as a string, as the API expects. */
  amount: number
  currency: string
  /** Alphanumeric only, unique per transaction. */
  orderReference: string
  /** Country code without '+', e.g. 255712345678. */
  phoneNumber: string
}

export interface UssdPushResult {
  /** PROCESSING while the donor is entering their PIN; SUCCESS/FAILED are terminal. */
  status: string
  id?: string
  channel?: string
  raw: unknown
}

export interface ClickPesaPaymentResult {
  status: string
  orderReference?: string
  collectedAmount?: number
  raw: unknown
}

export interface MobileMoneyPayoutInput {
  amount: number
  currency: string
  orderReference: string
  phoneNumber: string
}

export interface ClickPesaPayoutResult {
  status: string
  id?: string
  raw: unknown
}

/**
 * Canonical JSON for checksums: object keys sorted alphabetically at every
 * level, serialized compactly. Both sides must agree byte for byte, so the
 * ordering is explicit rather than relying on insertion order.
 */
function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value && typeof value === 'object') {
    const source = value as Record<string, unknown>
    const sorted: Record<string, unknown> = {}
    for (const key of Object.keys(source).sort()) {
      sorted[key] = canonicalize(source[key])
    }
    return sorted
  }
  return value
}

/**
 * HMAC-SHA256 over the canonicalized payload, hex encoded. `checksum` and
 * `checksumMethod` are never part of the hashed content.
 */
export function computeChecksum(payload: Record<string, unknown>, key: string): string {
  const { checksum: _checksum, checksumMethod: _method, ...rest } = payload
  const serialized = JSON.stringify(canonicalize(rest))
  return createHmac('sha256', key).update(serialized).digest('hex')
}

/**
 * Thin HTTP client for ClickPesa. Owns the token lifecycle and the USSD push
 * that sends a PIN prompt to the payer's handset. Uses global fetch (Node >=20).
 *
 * Pre-KYC accounts are capped at 100 API calls per day including token
 * generation, so the token is cached for its full life and the optional
 * preview endpoint is deliberately not called: one payment costs one call.
 */
export class ClickPesaClient {
  private token: string | null = null
  private tokenExpiryMs = 0

  constructor(private readonly config: ClickPesaConfig) {}

  async initiateUssdPush(input: UssdPushInput): Promise<UssdPushResult> {
    const token = await this.getToken()
    const body: Record<string, unknown> = {
      amount: String(input.amount),
      currency: input.currency,
      orderReference: input.orderReference,
      phoneNumber: input.phoneNumber,
    }
    if (this.config.checksumKey) {
      body.checksum = computeChecksum(body, this.config.checksumKey)
    }

    const data = await this.request(
      `${this.config.baseUrl}/third-parties/payments/initiate-ussd-push-request`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: bearer(token),
        },
        body: JSON.stringify(body),
      },
    )

    const record = asRecord(data) ?? {}
    return {
      status: String(record.status ?? '').toUpperCase(),
      id: readString(record, 'id'),
      channel: readString(record, 'channel'),
      raw: data,
    }
  }

  /** Query ClickPesa directly when a webhook did not reach us. */
  async getPayment(orderReference: string): Promise<ClickPesaPaymentResult | null> {
    const token = await this.getToken()
    const data = await this.request(
      `${this.config.baseUrl}/third-parties/payments/${encodeURIComponent(orderReference)}`,
      { headers: { Authorization: bearer(token) } },
    )
    const record = Array.isArray(data) ? asRecord(data[0]) : asRecord(data)
    if (!record) return null
    const amount = readNumber(record, 'collectedAmount')
    return {
      status: String(record.status ?? '').toUpperCase(),
      orderReference: readString(record, 'orderReference'),
      collectedAmount: amount ?? undefined,
      raw: data,
    }
  }

  /** Send funds from the merchant's available ClickPesa payout balance. */
  async createMobileMoneyPayout(input: MobileMoneyPayoutInput): Promise<ClickPesaPayoutResult> {
    const token = await this.getToken()
    const orderReference = toClickPesaOrderReference(input.orderReference)
    const body: Record<string, unknown> = {
      amount: String(input.amount),
      currency: input.currency,
      orderReference,
      phoneNumber: input.phoneNumber,
    }
    if (this.config.checksumKey) body.checksum = computeChecksum(body, this.config.checksumKey)
    const data = await this.request(`${this.config.baseUrl}/third-parties/payouts/create-mobile-money-payout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: bearer(token) },
      body: JSON.stringify(body),
    })
    const record = asRecord(data) ?? {}
    return { status: String(record.status ?? '').toUpperCase(), id: readString(record, 'id'), raw: data }
  }

  /** Look up an existing payout without creating another one. */
  async getPayout(orderReference: string): Promise<ClickPesaPayoutResult | null> {
    const token = await this.getToken()
    const clickPesaOrderReference = toClickPesaOrderReference(orderReference)
    const data = await this.request(
      `${this.config.baseUrl}/third-parties/payouts/${encodeURIComponent(clickPesaOrderReference)}`,
      { headers: { Authorization: bearer(token) } },
    )
    const record = Array.isArray(data) ? asRecord(data[0]) : asRecord(data)
    if (!record) return null
    return { status: String(record.status ?? '').toUpperCase(), id: readString(record, 'id'), raw: data }
  }

  private async getToken(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiryMs) return this.token

    const data = await this.request(`${this.config.baseUrl}/third-parties/generate-token`, {
      method: 'POST',
      headers: {
        'client-id': this.config.clientId,
        'api-key': this.config.apiKey,
      },
    })
    const token = readString(asRecord(data) ?? {}, 'token')
    if (!token) {
      throw ApiError.badGateway('The payment gateway did not return an access token.')
    }
    this.token = token
    this.tokenExpiryMs = Date.now() + TOKEN_TTL_MS
    return token
  }

  private async request(url: string, init: RequestInit): Promise<unknown> {
    let response: Response
    try {
      response = await fetch(url, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
    } catch (error) {
      logger.error(`ClickPesa request to ${url} failed: ${(error as Error).message}`)
      throw ApiError.badGateway('The payment gateway is unreachable. Please try again.')
    }

    const raw = await response.text()
    const parsed = raw ? safeJson(raw) : null
    if (!response.ok) {
      logger.error(`ClickPesa ${url} returned ${response.status}: ${raw.slice(0, 500)}`)
      // Surface the gateway's own wording when it explains a rejection, since it
      // names the actual problem (unknown number, limit reached, duplicate ref).
      const message = readString(asRecord(parsed) ?? {}, 'message')
      throw ApiError.badGateway(message || 'The payment gateway rejected the request. Please try again.')
    }
    return parsed
  }
}

/** ClickPesa returns the token already prefixed on some endpoints; never double it. */
function bearer(token: string): string {
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`
}

function toClickPesaOrderReference(reference: string): string {
  return reference.replace(/[^A-Za-z0-9]/g, '')
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null
}

function readString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function readNumber(record: Record<string, unknown>, key: string): number | null {
  const value = record[key]
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
  return Number.isFinite(parsed) ? Math.round(parsed) : null
}
