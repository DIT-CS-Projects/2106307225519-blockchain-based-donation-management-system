import { z } from 'zod'
import { CAMPAIGN_CATEGORIES } from '@/constants/config'

const positiveIntString = z
  .string()
  .trim()
  .min(1, 'Required')
  .refine((v) => Number.isInteger(Number(v)) && Number(v) > 0, 'Must be a whole number greater than zero')

export const campaignFormSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(200),
    description: z.string().trim().min(1, 'Description is required'),
    category: z.enum(CAMPAIGN_CATEGORIES),
    targetAmount: positiveIntString,
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    featured: z.boolean().optional(),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: 'End date must be after the start date',
    path: ['endDate'],
  })

export type CampaignFormValues = z.infer<typeof campaignFormSchema>

export const beneficiaryFormSchema = z.object({
  campaignId: positiveIntString,
  name: z.string().trim().min(1, 'Name is required').max(150),
  description: z.string().trim().min(1, 'Description is required'),
  category: z.string().trim().max(80).optional(),
  location: z.string().trim().max(150).optional(),
  mobileNumber: z.string().trim().regex(/^(?:\+?255|0)\d{9}$/, 'Enter a valid Tanzanian mobile number').optional(),
  contactInfo: z.string().trim().max(500).optional(),
})

export type BeneficiaryFormValues = z.infer<typeof beneficiaryFormSchema>

export const disbursementFormSchema = z.object({
  campaignId: positiveIntString,
  beneficiaryId: positiveIntString,
  amount: positiveIntString,
  purpose: z.string().trim().min(1, 'Purpose is required').max(500),
})

export type DisbursementFormValues = z.infer<typeof disbursementFormSchema>

export const broadcastFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(150),
  message: z.string().trim().min(1, 'Message is required').max(1000),
  audience: z.enum(['admins', 'donors', 'everyone']),
})

export type BroadcastFormValues = z.infer<typeof broadcastFormSchema>
