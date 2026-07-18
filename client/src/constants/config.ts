// Brand and platform-wide configuration.
// Rename APP_NAME to rebrand the platform.

export const APP_NAME = 'Changia'
export const APP_TAGLINE = 'Transparent giving, verified forever.'
export const APP_DESCRIPTION =
  'Donate to verified NGO campaigns with familiar Tanzanian payment methods. Every donation is recorded immutably on the blockchain.'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export const CURRENCY = 'TZS'

// Business constants. Source of truth: docs/BUSINESS_RULES.md
export const MIN_DONATION_TZS = 1_000
export const DUAL_APPROVAL_THRESHOLD_TZS = 1_000_000

export const CAMPAIGN_CATEGORIES = [
  'Education',
  'Health',
  'Disaster Relief',
  'Environment',
  'Community',
  'Other',
] as const

export type CampaignCategory = (typeof CAMPAIGN_CATEGORIES)[number]

// Payment rails offered at checkout. Mirrors the server's PAYMENT_PROVIDERS
// (docs/PAYMENT_ARCHITECTURE.md: Supported Payment Methods).
export const PAYMENT_METHODS = [
  {
    key: 'mobile_money',
    label: 'Mobile money',
    providers: [
      { key: 'mpesa', label: 'M-Pesa' },
      { key: 'airtel', label: 'Airtel Money' },
      { key: 'mixx', label: 'Mixx by Yas' },
      { key: 'halopesa', label: 'HaloPesa' },
    ],
  },
  {
    key: 'bank',
    label: 'Bank transfer',
    providers: [
      { key: 'crdb', label: 'CRDB Bank' },
      { key: 'nmb', label: 'NMB Bank' },
      { key: 'nbc', label: 'NBC Bank' },
      { key: 'stanchart', label: 'Standard Chartered' },
    ],
  },
] as const

export type PaymentMethodKey = (typeof PAYMENT_METHODS)[number]['key']
