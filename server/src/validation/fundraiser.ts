import { z } from 'zod'

// Fundraiser application (api/authentication.md: Become a Fundraiser, Decision 020).
export const applyFundraiserSchema = z.object({
  displayName: z.string().trim().min(2, 'Enter the name you fundraise under').max(150),
  causeDescription: z
    .string()
    .trim()
    .min(20, 'Describe your cause in at least 20 characters')
    .max(2000),
  identityReference: z
    .string()
    .trim()
    .min(4, 'Enter a valid national ID or registration number')
    .max(120),
  contactPhone: z
    .string()
    .trim()
    .min(7, 'Enter a valid phone number')
    .max(30)
    .regex(/^[+]?[0-9][0-9\s-]{5,}$/, 'Enter a valid phone number'),
})

// A rejection always carries a reason (api/admin.md).
export const rejectReasonSchema = z.object({
  reason: z.string().trim().min(3, 'A reason is required').max(500),
})

export type ApplyFundraiserInput = z.infer<typeof applyFundraiserSchema>
export type RejectReasonInput = z.infer<typeof rejectReasonSchema>
