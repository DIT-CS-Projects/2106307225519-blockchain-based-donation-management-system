import { env } from '../../config/env'
import { ApiError } from '../../utils/ApiError'
import { logger } from '../../utils/logger'

/**
 * Everything the AzamPay adapter needs to talk to the gateway. Read from the
 * environment once (docs/PAYMENT_ARCHITECTURE.md); a null result means the
 * integration is not fully configured and the factory should fall back to mock.
 */
export interface AzampayConfig {
  appName: string
  clientId: string
  clientSecret: string
  apiKey: string
  authBaseUrl: string
  checkoutBaseUrl: string
  callbackSecret: string
}

/** The AzamPay config, or null if any required credential is missing. */
export function readAzampayConfig(): AzampayConfig | null {
  const {
    AZAMPAY_APP_NAME,
    AZAMPAY_CLIENT_ID,
    AZAMPAY_CLIENT_SECRET,
    AZAMPAY_API_KEY,
    AZAMPAY_CALLBACK_SECRET,
  } = env
  if (
    !AZAMPAY_APP_NAME ||
    !AZAMPAY_CLIENT_ID ||
    !AZAMPAY_CLIENT_SECRET ||
    !AZAMPAY_API_KEY ||
    !AZAMPAY_CALLBACK_SECRET
  ) {
    return null
  }
  return {
    appName: AZAMPAY_APP_NAME,
    clientId: AZAMPAY_CLIENT_ID,
    clientSecret: AZAMPAY_CLIENT_SECRET,
    apiKey: AZAMPAY_API_KEY,
    authBaseUrl: env.AZAMPAY_AUTH_BASE_URL,
    checkoutBaseUrl: env.AZAMPAY_CHECKOUT_BASE_URL,
    callbackSecret: AZAMPAY_CALLBACK_SECRET,
  }
}

const REQUEST_TIMEOUT_MS = 15_000
// Refresh a little before the token actually expires to avoid edge-of-life 401s.
const TOKEN_SKEW_MS = 60_000
// Conservative fallback lifetime when AzamPay omits an expiry we can parse.
const DEFAULT_TOKEN_TTL_MS = 30 * 60_000

export interface MnoCheckoutInput {
  /** Payer mobile number in AzamPay's expected local format (0XXXXXXXXX). */
  accountNumber: string
  amount: number
  currency: string
  /** Our payment reference; AzamPay echoes it back as utilityref on callback. */
  externalId: string
  /** AzamPay operator name (Mpesa, Airtel, Tigo, Halopesa). */
  provider: string
}

export interface MnoCheckoutResult {
  success: boolean
  transactionId?: string
  message?: string
  raw: unknown
}

/**
 * Thin HTTP client for AzamPay. Owns the OAuth-style token lifecycle (fetch,
 * cache, refresh) and the MNO checkout call that pushes a USSD/PIN prompt to the
 * payer's handset. Uses the global fetch (Node >=20); no extra dependency.
 */
export class AzampayClient {
  private token: string | null = null
  private tokenExpiryMs = 0

  constructor(private readonly config: AzampayConfig) {}

  async mnoCheckout(input: MnoCheckoutInput): Promise<MnoCheckoutResult> {
    const token = await this.getToken()
    const data = await this.request(`${this.config.checkoutBaseUrl}/azampay/mno/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-API-Key': this.config.apiKey,
      },
      body: JSON.stringify({
        accountNumber: input.accountNumber,
        // AzamPay expects the amount as a string.
        amount: String(input.amount),
        currency: input.currency,
        externalId: input.externalId,
        provider: input.provider,
      }),
    })
    return {
      success: readBoolean(data, 'success') ?? false,
      transactionId: readString(data, 'transactionId'),
      message: readString(data, 'message'),
      raw: data,
    }
  }

  private async getToken(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiryMs - TOKEN_SKEW_MS) {
      return this.token
    }
    const data = await this.request(`${this.config.authBaseUrl}/AppRegistration/GenerateToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appName: this.config.appName,
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret,
      }),
    })
    const token = readNestedString(data, 'data', 'accessToken')
    if (!token) {
      throw ApiError.badGateway('The payment gateway did not return an access token.')
    }
    const expiry = Date.parse(readNestedString(data, 'data', 'expire') ?? '')
    this.token = token
    this.tokenExpiryMs = Number.isNaN(expiry) ? Date.now() + DEFAULT_TOKEN_TTL_MS : expiry
    return token
  }

  private async request(url: string, init: RequestInit): Promise<unknown> {
    let response: Response
    try {
      response = await fetch(url, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
    } catch (error) {
      logger.error(`AzamPay request to ${url} failed: ${(error as Error).message}`)
      throw ApiError.badGateway('The payment gateway is unreachable. Please try again.')
    }
    const raw = await response.text()
    const parsed = raw ? safeJson(raw) : null
    if (!response.ok) {
      logger.error(`AzamPay ${url} returned ${response.status}: ${raw.slice(0, 500)}`)
      throw ApiError.badGateway('The payment gateway rejected the request. Please try again.')
    }
    return parsed
  }
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

function readString(value: unknown, key: string): string | undefined {
  const record = asRecord(value)
  const field = record?.[key]
  return typeof field === 'string' && field.length > 0 ? field : undefined
}

function readNestedString(value: unknown, outer: string, inner: string): string | undefined {
  return readString(asRecord(value)?.[outer], inner)
}

function readBoolean(value: unknown, key: string): boolean | undefined {
  const field = asRecord(value)?.[key]
  return typeof field === 'boolean' ? field : undefined
}
