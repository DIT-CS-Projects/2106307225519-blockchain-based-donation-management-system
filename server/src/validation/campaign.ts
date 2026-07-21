import { z } from 'zod'

const CATEGORIES = [
  'Education',
  'Health',
  'Disaster Relief',
  'Environment',
  'Community',
  'Other',
] as const

export const createCampaignSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(200),
    description: z.string().trim().min(1, 'Description is required'),
    category: z.enum(CATEGORIES),
    imageUrl: z.string().trim().url().max(2000).nullable().optional(),
    targetAmount: z.number().int().positive('Target amount must be greater than zero'),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    featured: z.boolean().optional(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'End date must be after the start date',
    path: ['endDate'],
  })

export const updateCampaignSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().min(1).optional(),
    category: z.enum(CATEGORIES).optional(),
    imageUrl: z.string().trim().url().max(2000).nullable().optional(),
    targetAmount: z.number().int().positive().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    status: z.enum(['draft', 'active', 'completed', 'archived']).optional(),
    featured: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update',
  })
  .refine((data) => !data.startDate || !data.endDate || data.endDate > data.startDate, {
    message: 'End date must be after the start date',
    path: ['endDate'],
  })

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>
