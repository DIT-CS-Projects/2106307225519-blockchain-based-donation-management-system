import { env } from '../../config/env'
import { MockDisbursementProvider } from './mock.provider'
import { ClickPesaDisbursementProvider } from './clickpesa.provider'
import { readClickPesaConfig } from '../payment/clickpesa.client'
import type { DisbursementProvider } from './provider'

export type { DisbursementProvider } from './provider'

let provider: DisbursementProvider | null = null

export function getDisbursementProvider(): DisbursementProvider {
  if (provider) return provider

  if (env.DISBURSEMENT_PROVIDER === 'clickpesa') {
    const config = readClickPesaConfig()
    if (!config) throw new Error('DISBURSEMENT_PROVIDER=clickpesa but ClickPesa credentials are incomplete.')
    provider = new ClickPesaDisbursementProvider(config)
  } else {
    provider = new MockDisbursementProvider()
  }

  return provider
}
