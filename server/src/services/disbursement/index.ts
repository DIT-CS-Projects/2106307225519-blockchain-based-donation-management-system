import { env } from '../../config/env'
import { logger } from '../../utils/logger'
import { MockDisbursementProvider } from './mock.provider'
import type { DisbursementProvider } from './provider'

export type { DisbursementProvider } from './provider'

let provider: DisbursementProvider | null = null

export function getDisbursementProvider(): DisbursementProvider {
  if (provider) return provider

  if (env.DISBURSEMENT_PROVIDER === 'azampay') {
    logger.warn('DISBURSEMENT_PROVIDER=azampay has no adapter yet; using the mock provider.')
    provider = new MockDisbursementProvider()
  } else {
    provider = new MockDisbursementProvider()
  }

  return provider
}
