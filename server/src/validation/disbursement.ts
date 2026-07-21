import { z } from 'zod'

export const initiateDisbursementSchema = z.object({
  campaignId: z.coerce.number().int().positive(),
  beneficiaryId: z.coerce.number().int().positive(),
  amount: z.number().int().positive('Amount must be greater than zero'),
  purpose: z.string().trim().min(1, 'Purpose is required').max(500),
})

export const rejectDisbursementSchema = z.object({
  reason: z.string().trim().min(1, 'A reason is required').max(500),
})

export type InitiateDisbursementInput = z.infer<typeof initiateDisbursementSchema>
export type RejectDisbursementInput = z.infer<typeof rejectDisbursementSchema>
