import { api } from '@/services/api'

// Contract: api/payment.md (base path /api/payments). All calls are authenticated
// except the provider callback, which the mock checkout page invokes on the
// donor's behalf.

export type PaymentMethod = 'mobile_money' | 'bank'

export interface CreatePaymentSessionPayload {
  campaignId: number
  amount: number
  method: PaymentMethod
  provider: string
  currency?: 'TZS'
}

export interface PaymentSession {
  paymentReference: string
  checkoutUrl: string
  expiresAt: string
}

export interface PaymentStatus {
  reference: string
  status: string
  amount: number
  currency: string
  method: PaymentMethod
  provider: string
  campaignId: number
  campaignTitle: string
  donationId: number | null
  receiptAvailable: boolean
  expiresAt: string
}

export type PaymentOutcome = 'SUCCESS' | 'CANCELLED'

export interface CallbackResult {
  status: 'success' | 'failed' | 'cancelled'
  reference: string
  donationId?: number
}

export async function createPaymentSession(
  payload: CreatePaymentSessionPayload,
): Promise<PaymentSession> {
  const { data } = await api.post<PaymentSession>('/payments/create-session', {
    currency: 'TZS',
    ...payload,
  })
  return data
}

export async function getPaymentStatus(reference: string): Promise<PaymentStatus> {
  const { data } = await api.get<PaymentStatus>(`/payments/status/${reference}`)
  return data
}

/**
 * Drive the mock provider callback. The real gateway posts this itself; the mock
 * checkout page stands in for the donor, presenting the capability token issued
 * with the checkout URL.
 */
export async function completeMockPayment(
  reference: string,
  token: string,
  outcome: PaymentOutcome,
): Promise<CallbackResult> {
  const { data } = await api.post<CallbackResult>('/payments/callback', {
    reference,
    token,
    status: outcome,
  })
  return data
}
