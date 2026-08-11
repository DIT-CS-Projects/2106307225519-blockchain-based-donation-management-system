import { env } from '../../config/env'
import { ApiError } from '../../utils/ApiError'

/**
 * Neither real gateway is onboarded for the bank rail yet, so bank checkouts
 * delegate to the mock provider. The mock proves authenticity with the
 * capability token it already handed the payer, which is fine for a local demo
 * (the donor plays the gateway) but would let a donor confirm their own bank
 * donation without any money moving. Outside development that path stays
 * closed: better to refuse the checkout than to record a donation nobody paid
 * for (docs/PAYMENT_ARCHITECTURE.md: only verified payments create donations).
 */
export function assertBankFallbackAllowed(): void {
  if (env.NODE_ENV === 'production') {
    throw ApiError.badRequest(
      'Bank transfer is not available yet. Please donate with mobile money.',
    )
  }
}
