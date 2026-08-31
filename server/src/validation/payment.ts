import { z } from 'zod'
import {
  MAX_DONATION_TZS,
  MIN_DONATION_TZS,
  PAYMENT_PROVIDERS,
} from '../constants/donations'

const METHODS = Object.keys(PAYMENT_PROVIDERS) as [keyof typeof PAYMENT_PROVIDERS]

// Tanzanian mobile number: optional +255/255/0 prefix, then a 6/7 line + 8 digits.
const TZ_MOBILE = /^(?:\+?255|0)?[67]\d{8}$/

function looksLikeTzMobile(value: string): boolean {
  return TZ_MOBILE.test(value.replace(/\s+/g, ''))
}

export const createSessionSchema = z
  .object({
    campaignId: z.coerce.number().int().positive(),
    amount: z
      .number()
      .int('Enter a whole shilling amount')
      .min(MIN_DONATION_TZS, `Enter at least TZS ${MIN_DONATION_TZS}`)
      .max(MAX_DONATION_TZS, 'That amount is too large'),
    currency: z.literal('TZS').default('TZS'),
    method: z.enum(METHODS),
    provider: z.string().trim().min(1),
    // Payer mobile number for mobile-money rails. Optional here (the AzamPay
    // adapter requires it for mobile money); when present it must be a valid
    // TZ mobile number so we never forward junk to the gateway.
    accountNumber: z.string().trim().min(1).optional(),
  })
  .refine(
    (data) =>
      (PAYMENT_PROVIDERS[data.method] as readonly string[]).includes(data.provider),
    { message: 'Unsupported payment provider for this method', path: ['provider'] },
  )
  .refine((data) => !data.accountNumber || looksLikeTzMobile(data.accountNumber), {
    message: 'Enter a valid Tanzanian mobile number',
    path: ['accountNumber'],
  })

export type CreateSessionInput = z.infer<typeof createSessionSchema>
