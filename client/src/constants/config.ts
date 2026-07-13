// Brand and platform-wide configuration.
// Rename APP_NAME to rebrand the platform.

export const APP_NAME = 'Tuma'
export const APP_TAGLINE = 'Transparent giving, verified forever.'
export const APP_DESCRIPTION =
  'Donate to verified NGO campaigns with familiar Tanzanian payment methods. Every donation is recorded immutably on the blockchain.'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export const CURRENCY = 'TZS'

// Business constants — source of truth: docs/BUSINESS_RULES.md
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
