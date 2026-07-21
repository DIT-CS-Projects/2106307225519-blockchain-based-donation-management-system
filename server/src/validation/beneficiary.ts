import { z } from 'zod'

export const createBeneficiarySchema = z.object({
  campaignId: z.coerce.number().int().positive(),
  name: z.string().trim().min(1, 'Name is required').max(150),
  description: z.string().trim().min(1, 'Description is required'),
  category: z.string().trim().max(80).optional(),
  location: z.string().trim().max(150).optional(),
  contactInfo: z.string().trim().max(500).optional(),
  imageUrl: z.string().trim().url().max(2000).nullable().optional(),
})

export const updateBeneficiarySchema = z
  .object({
    name: z.string().trim().min(1).max(150).optional(),
    description: z.string().trim().min(1).optional(),
    category: z.string().trim().max(80).optional(),
    location: z.string().trim().max(150).optional(),
    contactInfo: z.string().trim().max(500).optional(),
    imageUrl: z.string().trim().url().max(2000).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update',
  })

export type CreateBeneficiaryInput = z.infer<typeof createBeneficiarySchema>
export type UpdateBeneficiaryInput = z.infer<typeof updateBeneficiarySchema>
