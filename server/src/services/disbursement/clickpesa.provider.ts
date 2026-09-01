import { ClickPesaClient, type ClickPesaConfig } from '../payment/clickpesa.client'
import type { DisbursementProvider, QueuePayoutInput, QueuePayoutResult } from './provider'

/** Real outbound payouts from the NGO's ClickPesa merchant balance. */
export class ClickPesaDisbursementProvider implements DisbursementProvider {
  readonly name = 'clickpesa'
  private readonly client: ClickPesaClient

  constructor(config: ClickPesaConfig) {
    this.client = new ClickPesaClient(config)
  }

  async queuePayout(input: QueuePayoutInput): Promise<QueuePayoutResult> {
    const result = await this.client.createMobileMoneyPayout({
      amount: input.amount,
      currency: 'TZS',
      orderReference: input.reference,
      phoneNumber: input.beneficiaryMobileNumber,
    })
    return {
      // ClickPesa may accept a payout first and complete it asynchronously.
      completedImmediately: result.status === 'SUCCESS',
      raw: { provider: this.name, payoutId: result.id, status: result.status, response: result.raw },
    }
  }

  async getPayoutStatus(reference: string): Promise<string | null> {
    const result = await this.client.getPayout(reference)
    return result?.status || null
  }
}
