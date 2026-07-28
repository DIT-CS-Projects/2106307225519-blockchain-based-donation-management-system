import { findCampaignByIdAdmin, findDonatableCampaign } from '../repositories/campaign.repository'
import {
  createTransaction,
  findTransactionByReference,
  findTransactionStatusView,
  updateTransactionStatus,
} from '../repositories/payment.repository'
import { findDistinctDonorIdsByCampaign, recordDonation } from '../repositories/donation.repository'
import { recordBlockchainProof } from './donation.service'
import { awardForDonation } from './reward.service'
import { getPaymentProvider } from './payment'
import { notify } from './notification.service'
import {
  PAYMENT_REFERENCE_PREFIX,
  RECEIPT_NUMBER_PREFIX,
} from '../constants/donations'
import {
  generateCheckoutToken,
  generateReceiptNumber,
  generateReference,
} from '../utils/reference'
import { ApiError } from '../utils/ApiError'
import { logger } from '../utils/logger'
import type { CreateSessionInput } from '../validation/payment'
import type { CallbackContext } from './payment/provider'
import { formatTZS } from '../utils/format'

export interface CreateSessionResult {
  paymentReference: string
  checkoutUrl: string
  expiresAt: string
}

/**
 * Open a checkout session for a donor. Validates the campaign is donatable,
 * generates a unique reference and capability token, asks the provider for a
 * checkout URL, and records the attempt as pending (docs/PAYMENT_ARCHITECTURE.md).
 */
export async function createSession(
  donorId: number,
  input: CreateSessionInput,
): Promise<CreateSessionResult> {
  const campaign = await findDonatableCampaign(input.campaignId)
  if (!campaign) {
    throw ApiError.badRequest('This campaign is not accepting donations right now.')
  }

  const reference = generateReference(PAYMENT_REFERENCE_PREFIX)
  const callbackToken = generateCheckoutToken()
  const provider = getPaymentProvider()

  const session = await provider.createSession({
    reference,
    amount: input.amount,
    currency: input.currency,
    method: input.method,
    provider: input.provider,
    campaignTitle: campaign.title,
    callbackToken,
    accountNumber: input.accountNumber,
  })

  await createTransaction({
    reference,
    donorId,
    campaignId: campaign.id,
    amount: input.amount,
    currency: input.currency,
    method: input.method,
    provider: input.provider,
    status: 'pending',
    checkoutToken: callbackToken,
    checkoutUrl: session.checkoutUrl,
    providerResponse: session.raw ?? null,
    expiresAt: session.expiresAt,
  })

  return {
    paymentReference: reference,
    checkoutUrl: session.checkoutUrl,
    expiresAt: session.expiresAt.toISOString(),
  }
}

export interface CallbackResult {
  status: 'success' | 'failed' | 'cancelled'
  reference: string
  donationId?: number
}

/**
 * Handle a provider callback: verify authenticity, then either finalize the
 * donation or mark the attempt terminal. Idempotent, so duplicate callbacks
 * never double-record (flows/payment-flow.md).
 */
export async function handleCallback(
  payload: unknown,
  context?: CallbackContext,
): Promise<CallbackResult> {
  const provider = getPaymentProvider()

  const reference = provider.extractReference(payload)
  if (!reference) {
    throw ApiError.badRequest('Invalid payment callback')
  }

  const transaction = await findTransactionByReference(reference)
  if (!transaction) {
    throw ApiError.notFound('Payment not found')
  }

  const result = provider.verifyCallback(payload, transaction, context)
  if (!result.verified) {
    throw ApiError.badRequest('Payment callback could not be verified')
  }

  // Already finalized: return the existing donation without re-processing.
  if (transaction.status === 'success') {
    return {
      status: 'success',
      reference,
      donationId: transaction.donationId ?? undefined,
    }
  }

  // Any other terminal state is returned as-is; only pending attempts advance.
  if (transaction.status !== 'pending') {
    return { status: transaction.status === 'cancelled' ? 'cancelled' : 'failed', reference }
  }

  if (result.status === 'cancelled') {
    await updateTransactionStatus(reference, 'cancelled', result.raw)
    return { status: 'cancelled', reference }
  }

  if (result.status === 'failed') {
    await updateTransactionStatus(reference, 'failed', result.raw)
    return { status: 'failed', reference }
  }

  const donation = await recordDonation({
    reference,
    donorId: transaction.donorId,
    campaignId: transaction.campaignId,
    amount: transaction.amount,
    currency: transaction.currency,
    paymentReference: reference,
    receiptNumber: generateReceiptNumber(RECEIPT_NUMBER_PREFIX),
    providerResponse: result.raw,
  })

  logger.info(`Donation ${donation.id} recorded for payment ${reference}`)

  // Fire-and-forget: never block the payment response on a chain write
  // (flows/payment-flow.md). Failures are logged inside and heal on verify.
  void recordBlockchainProof(donation)

  // Fire-and-forget: Impact Points are a loyalty perk, never a reason to fail a
  // donation. Awarding is idempotent, so a duplicate callback is harmless.
  void awardForDonation(donation)

  void notify({
    userIds: [donation.donorId],
    type: 'donation_success',
    title: 'Thank you for your donation',
    message: `Your donation of ${formatTZS(donation.amount)} was received.`,
    link: `/donations/${donation.id}`,
  })
  void notifyIfGoalJustAchieved(donation.campaignId, donation.amount)

  return { status: 'success', reference, donationId: donation.id }
}

/**
 * Fire 'campaign_goal_achieved' exactly once, at the donation that crosses the
 * target (raisedAmount already includes this donation's credited amount).
 */
async function notifyIfGoalJustAchieved(campaignId: number, thisDonationAmount: number): Promise<void> {
  const campaign = await findCampaignByIdAdmin(campaignId)
  if (!campaign) return
  const before = campaign.raisedAmount - thisDonationAmount
  const justCrossed = before < campaign.targetAmount && campaign.raisedAmount >= campaign.targetAmount
  if (!justCrossed) return

  const donorIds = await findDistinctDonorIdsByCampaign(campaignId)
  if (donorIds.length === 0) return

  await notify({
    userIds: donorIds,
    type: 'campaign_goal_achieved',
    title: `${campaign.title} reached its goal!`,
    message: 'Thanks to donors like you, this campaign hit its funding target.',
    link: `/campaigns/${campaignId}`,
  })
}

export interface PaymentStatusResult {
  reference: string
  status: string
  amount: number
  currency: string
  method: string
  provider: string
  campaignId: number
  campaignTitle: string
  donationId: number | null
  receiptAvailable: boolean
  expiresAt: string
}

/** Payment status for the owning donor (owner-scoped; 404 otherwise). */
export async function getPaymentStatus(
  donorId: number,
  reference: string,
): Promise<PaymentStatusResult> {
  const view = await findTransactionStatusView(reference)
  if (!view || view.donorId !== donorId) {
    throw ApiError.notFound('Payment not found')
  }
  return {
    reference: view.reference,
    status: view.status,
    amount: view.amount,
    currency: view.currency,
    method: view.method,
    provider: view.provider,
    campaignId: view.campaignId,
    campaignTitle: view.campaignTitle,
    donationId: view.donationId,
    receiptAvailable: view.donationId !== null,
    expiresAt: view.expiresAt.toISOString(),
  }
}
