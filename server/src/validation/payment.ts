import { z } from 'zod'
import {
  MAX_DONATION_TZS,
  MIN_DONATION_TZS,
  PAYMENT_PROVIDERS,
} from '../constants/donations'

const METHODS = Object.keys(PAYMENT_PROVIDERS) as [keyof typeof PAYMENT_PROVIDERS]

export const createSessionSchema = z
  .object({
    campaignId: z.coerce.number().int().positive(),
    amount: z
      .number()
      .int('Enter a whole shilling amount')
      .min(MIN_DONATION_TZS, `The minimum donation is ${MIN_DONATION_TZS} TZS`)
      .max(MAX_DONATION_TZS, 'That amount is too large'),
    currency: z.literal('TZS').default('TZS'),
    method: z.enum(METHODS),
    provider: z.string().trim().min(1),
  })
  .refine(
    (data) =>
      (PAYMENT_PROVIDERS[data.method] as readonly string[]).includes(data.provider),
    { message: 'Unsupported payment provider for this method', path: ['provider'] },
  )

export type CreateSessionInput = z.infer<typeof createSessionSchema>
