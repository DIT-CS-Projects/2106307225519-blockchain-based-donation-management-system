import { env } from '../../config/env'
import { logger } from '../../utils/logger'
import { readAzampayConfig } from './azampay.client'
import { AzampayProvider } from './azampay.provider'
import { MockPaymentProvider } from './mock.provider'
import type { PaymentProvider } from './provider'

export type { PaymentProvider } from './provider'

let provider: PaymentProvider | null = null

/**
 * Return the configured payment provider (singleton). Selected by
 * PAYMENT_PROVIDER. 'azampay' drives the real gateway for mobile money (bank
 * still runs on the mock inside that adapter); it falls back to the mock if any
 * credential is missing, so a half-configured environment keeps working.
 */
export function getPaymentProvider(): PaymentProvider {
  if (provider) return provider

  if (env.PAYMENT_PROVIDER === 'azampay') {
    const config = readAzampayConfig()
    if (config) {
      // Say plainly which AzamPay environment is in force: the difference is
      // whether real money moves, and it is otherwise invisible at runtime.
      const authIsSandbox = config.authBaseUrl.includes('sandbox')
      const checkoutIsSandbox = config.checkoutBaseUrl.includes('sandbox')
      if (authIsSandbox !== checkoutIsSandbox) {
        logger.warn(
          'AzamPay hosts are mixed: one is sandbox and the other is production. ' +
            'Set AZAMPAY_AUTH_BASE_URL and AZAMPAY_CHECKOUT_BASE_URL to the same environment.',
        )
      }
      const label = authIsSandbox && checkoutIsSandbox ? 'sandbox, no real money' : 'PRODUCTION, real money'
      logger.info(`Payment provider: AzamPay [${label}] (mobile money live; bank via mock).`)
      provider = new AzampayProvider(config)
    } else {
      logger.warn(
        'PAYMENT_PROVIDER=azampay but credentials are incomplete; using the mock provider.',
      )
      provider = new MockPaymentProvider()
    }
  } else {
    provider = new MockPaymentProvider()
  }

  return provider
}
