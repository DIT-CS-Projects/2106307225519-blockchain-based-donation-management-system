import { eq } from 'drizzle-orm'
import { requireDb } from '../config/database'
import {
  campaigns,
  paymentTransactions,
  type NewPaymentTransactionRow,
  type PaymentTransactionRow,
} from '../database/schema'

export async function createTransaction(
  input: NewPaymentTransactionRow,
): Promise<PaymentTransactionRow> {
  const client = requireDb()
  const [row] = await client.insert(paymentTransactions).values(input).returning()
  return row
}

export async function findTransactionByReference(
  reference: string,
): Promise<PaymentTransactionRow | undefined> {
  const client = requireDb()
  const [row] = await client
    .select()
    .from(paymentTransactions)
    .where(eq(paymentTransactions.reference, reference))
    .limit(1)
  return row
}

/** A transaction plus its campaign title, for the status view shown at checkout. */
export interface TransactionStatusView {
  reference: string
  donorId: number
  status: PaymentTransactionRow['status']
  amount: number
  currency: string
  method: PaymentTransactionRow['method']
  provider: string
  campaignId: number
  campaignTitle: string
  donationId: number | null
  expiresAt: Date
}

export async function findTransactionStatusView(
  reference: string,
): Promise<TransactionStatusView | undefined> {
  const client = requireDb()
  const [row] = await client
    .select({
      reference: paymentTransactions.reference,
      donorId: paymentTransactions.donorId,
      status: paymentTransactions.status,
      amount: paymentTransactions.amount,
      currency: paymentTransactions.currency,
      method: paymentTransactions.method,
      provider: paymentTransactions.provider,
      campaignId: paymentTransactions.campaignId,
      campaignTitle: campaigns.title,
      donationId: paymentTransactions.donationId,
      expiresAt: paymentTransactions.expiresAt,
    })
    .from(paymentTransactions)
    .innerJoin(campaigns, eq(campaigns.id, paymentTransactions.campaignId))
    .where(eq(paymentTransactions.reference, reference))
    .limit(1)
  return row
}

/** Mark a transaction terminal without creating a donation (cancel / fail). */
export async function updateTransactionStatus(
  reference: string,
  status: PaymentTransactionRow['status'],
  providerResponse: unknown,
): Promise<void> {
  const client = requireDb()
  await client
    .update(paymentTransactions)
    .set({ status, providerResponse, updatedAt: new Date() })
    .where(eq(paymentTransactions.reference, reference))
}
