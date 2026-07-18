import { env } from '../../config/env'
import type { PaymentTransactionRow } from '../../database/schema'
import type {
  CreateSessionInput,
  CreateSessionResult,
  PaymentProvider,
  VerifyCallbackResult,
} from './provider'

interface MockCallbackPayload {
  reference?: unknown
  token?: unknown
  status?: unknown
}

function asPayload(payload: unknown): MockCallbackPayload {
  return (payload ?? {}) as MockCallbackPayload
}

/**
 * A self-contained payment provider for local development and demos. Its
 * checkout URL points at an in-app page that plays the donor's role, then posts
 * a callback the same way a real gateway would. Authenticity is proven with the
 * per-transaction capability token instead of a signed webhook, so no external
 * credentials or public tunnel are needed. Swap PAYMENT_PROVIDER=azampay to use
 * the real adapter (docs/PAYMENT_ARCHITECTURE.md).
 */
export class MockPaymentProvider implements PaymentProvider {
  readonly name = 'mock'

  async createSession(input: CreateSessionInput): Promise<CreateSessionResult> {
    const url = new URL(`/pay/${input.reference}`, env.CLIENT_ORIGIN)
    url.searchParams.set('token', input.callbackToken)
    const ttlMs = env.PAYMENT_SESSION_TTL_MINUTES * 60_000
    return {
      checkoutUrl: url.toString(),
      expiresAt: new Date(Date.now() + ttlMs),
      raw: { provider: 'mock', reference: input.reference },
    }
  }

  extractReference(payload: unknown): string | null {
    const reference = asPayload(payload).reference
    return typeof reference === 'string' && reference.length > 0 ? reference : null
  }

  verifyCallback(
    payload: unknown,
    transaction: PaymentTransactionRow,
  ): VerifyCallbackResult {
    const { token, status } = asPayload(payload)
    const verified = typeof token === 'string' && token === transaction.checkoutToken
    const normalized = String(status ?? '').toUpperCase()
    const mapped =
      normalized === 'SUCCESS'
        ? 'success'
        : normalized === 'CANCELLED'
          ? 'cancelled'
          : 'failed'
    return { status: mapped, verified, raw: payload }
  }
}
