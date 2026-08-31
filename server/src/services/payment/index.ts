import { env } from '../../config/env'
import { logger } from '../../utils/logger'
import { ApiError } from '../../utils/ApiError'
import { readAzampayConfig } from './azampay.client'
import { AzampayProvider } from './azampay.provider'
import { readClickPesaConfig } from './clickpesa.client'
import { ClickPesaProvider } from './clickpesa.provider'
import { MockPaymentProvider } from './mock.provider'
import type { PaymentProvider } from './provider'

export type { PaymentProvider } from './provider'

let provider: PaymentProvider | null = null

/**
 * Return the configured payment provider (singleton). Selected by
 * PAYMENT_PROVIDER. 'azampay' and 'clickpesa' drive real gateways for mobile
 * money (bank still runs on the mock inside those adapters). A selected real
 * provider with missing credentials must fail visibly rather than silently
 * showing a mock flow and making it look as if no handset prompt was sent.
 */
export function getPaymentProvider(): PaymentProvider {
  if (provider) return provider

  if (env.PAYMENT_PROVIDER === 'clickpesa') {
    const config = readClickPesaConfig()
    if (config) {
      // ClickPesa has one host for every account: the KYC state decides the
      // ceiling, so say what is capped rather than implying a test environment.
      logger.info(
        'Payment provider: ClickPesa [real money] (mobile money live; bank via mock). ' +
          'Pre-KYC accounts are capped at TZS 100,000 total and 100 API calls per day.',
      )
      provider = new ClickPesaProvider(config)
    } else {
      logger.error('PAYMENT_PROVIDER=clickpesa but ClickPesa credentials are incomplete.')
      throw ApiError.serviceUnavailable(
        'Mobile payments are not configured yet. Please contact support and try again later.',
      )
    }
  } else if (env.PAYMENT_PROVIDER === 'azampay') {
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
      logger.error('PAYMENT_PROVIDER=azampay but AzamPay credentials are incomplete.')
      throw ApiError.serviceUnavailable(
        'Mobile payments are not configured yet. Please contact support and try again later.',
      )
    }
  } else {
    provider = new MockPaymentProvider()
  }

  return provider
}
