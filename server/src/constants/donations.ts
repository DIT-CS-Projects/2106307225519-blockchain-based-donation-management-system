// Donation and payment constants. Source of truth: docs/BUSINESS_RULES.md.

/** Minimum donation amount, in whole TZS (Donation Rules). */
export const MIN_DONATION_TZS = 1_000

/** Upper guardrail on a single donation to catch fat-finger input, in TZS. */
export const MAX_DONATION_TZS = 100_000_000

export const DONATION_CURRENCY = 'TZS'

/** Payment rails offered at checkout, and the providers under each rail. */
export const PAYMENT_PROVIDERS = {
  mobile_money: ['mpesa', 'airtel', 'mixx', 'halopesa'],
  bank: ['crdb', 'nmb', 'nbc', 'stanchart'],
} as const

export type PaymentMethodKey = keyof typeof PAYMENT_PROVIDERS
export type PaymentProviderKey =
  (typeof PAYMENT_PROVIDERS)[PaymentMethodKey][number]

/** Prefixes for generated identifiers. */
export const PAYMENT_REFERENCE_PREFIX = 'CHG'
export const RECEIPT_NUMBER_PREFIX = 'RCP'
