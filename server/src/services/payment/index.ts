import { env } from '../../config/env'
import { logger } from '../../utils/logger'
import { MockPaymentProvider } from './mock.provider'
import type { PaymentProvider } from './provider'

export type { PaymentProvider } from './provider'

let provider: PaymentProvider | null = null

/**
 * Return the configured payment provider (singleton). Selected by
 * PAYMENT_PROVIDER; only 'mock' ships today. The real AzamPay adapter registers
 * here once its credentials and callback verification land.
 */
export function getPaymentProvider(): PaymentProvider {
  if (provider) return provider

  switch (env.PAYMENT_PROVIDER) {
    case 'azampay':
      // Intentional: the adapter arrives with sandbox onboarding. Falling back
      // keeps local dev working rather than crashing on a missing integration.
      logger.warn('PAYMENT_PROVIDER=azampay has no adapter yet; using the mock provider.')
      provider = new MockPaymentProvider()
      break
    case 'mock':
    default:
      provider = new MockPaymentProvider()
      break
  }

  return provider
}
