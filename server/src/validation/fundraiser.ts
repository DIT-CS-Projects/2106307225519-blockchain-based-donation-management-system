import { z } from 'zod'

// A rejection always carries a reason (api/admin.md).
export const rejectReasonSchema = z.object({
  reason: z.string().trim().min(3, 'A reason is required').max(500),
})

export type RejectReasonInput = z.infer<typeof rejectReasonSchema>
