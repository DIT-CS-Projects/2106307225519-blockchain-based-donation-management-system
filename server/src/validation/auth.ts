import { z } from 'zod'
import { passwordSchema } from '../utils/password'

const email = z.string().trim().toLowerCase().email().max(200)

// Permissive phone: local or international format, digits with optional
// separators. Phone is not unique; multiple accounts may share a number
// (Decision 025).
const phone = z
  .string()
  .trim()
  .min(7, 'Enter a valid phone number')
  .max(30)
  .regex(/^[+]?[0-9][0-9\s-]{5,}$/, 'Enter a valid phone number')

const fullName = z.string().trim().min(1, 'Full name is required').max(120)

// Required handle: 3-30 chars, letters/numbers/underscore, stored lowercased.
// A user may sign in with either their email or this username.
const username = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, 'Username must be at least 3 characters')
  .max(30)
  .regex(/^[a-z0-9_]+$/, 'Use letters, numbers, and underscores only')

// Direct fundraiser registration (Decision 021): a person may register as a
// fundraiser, which grants the role immediately and captures their identity.
export const registerSchema = z
  .object({
    fullName,
    email,
    username,
    phone,
    password: passwordSchema,
    accountType: z.enum(['donor', 'fundraiser']).default('donor'),
    displayName: z.string().trim().min(2, 'Enter the name you fundraise under').max(150).optional(),
    causeDescription: z
      .string()
      .trim()
      .min(20, 'Describe your cause in at least 20 characters')
      .max(2000)
      .optional(),
    identityReference: z
      .string()
      .trim()
      .min(4, 'Enter a valid national ID or registration number')
      .max(120)
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.accountType !== 'fundraiser') return
    const required = ['displayName', 'causeDescription', 'identityReference'] as const
    for (const field of required) {
      if (!data[field]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message: 'Required to register as a fundraiser',
        })
      }
    }
  })

export const loginSchema = z.object({
  // Email or username (Decision: email-or-username sign-in). Kept as a free
  // string; the service decides which lookup to use.
  identifier: z.string().trim().min(1, 'Enter your email or username'),
  // Login never reveals the policy: any non-empty password is accepted for the check.
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

export const updateProfileSchema = z
  .object({
    fullName: fullName.optional(),
    phone: phone.optional(),
    profilePhotoUrl: z.string().trim().url().max(500).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update',
  })

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({ email })

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: passwordSchema,
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
