import { z } from 'zod'

const MOBILE_NUMBER_PATTERN = /^(?:\+?255|0)\d{9}$/

/**
 * Tanzanian mobile number, stored normalized as 255XXXXXXXXX. Accepts the
 * common local and international entry forms at the API boundary.
 *
 * A blank string is treated as "no payout number" rather than as an invalid
 * one, so a form that always posts the field can leave it empty on create and
 * clear it on update. An omitted field leaves the stored number untouched.
 */
const mobileNumberSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === '' || MOBILE_NUMBER_PATTERN.test(value),
    'Enter a valid Tanzanian mobile number',
  )
  .nullable()
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined
    if (value === null || value === '') return null
    return value.startsWith('0') ? `255${value.slice(1)}` : value.replace(/^\+/, '')
  })

export const createBeneficiarySchema = z.object({
  campaignId: z.coerce.number().int().positive(),
  name: z.string().trim().min(1, 'Name is required').max(150),
  description: z.string().trim().min(1, 'Description is required'),
  category: z.string().trim().max(80).optional(),
  location: z.string().trim().max(150).optional(),
  mobileNumber: mobileNumberSchema,
  contactInfo: z.string().trim().max(500).optional(),
  imageUrl: z.string().trim().url().max(2000).nullable().optional(),
})

export const updateBeneficiarySchema = z
  .object({
    name: z.string().trim().min(1).max(150).optional(),
    description: z.string().trim().min(1).optional(),
    category: z.string().trim().max(80).optional(),
    location: z.string().trim().max(150).optional(),
    mobileNumber: mobileNumberSchema,
    contactInfo: z.string().trim().max(500).optional(),
    imageUrl: z.string().trim().url().max(2000).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update',
  })

export type CreateBeneficiaryInput = z.infer<typeof createBeneficiarySchema>
export type UpdateBeneficiaryInput = z.infer<typeof updateBeneficiarySchema>
