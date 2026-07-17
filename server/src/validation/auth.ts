import { z } from 'zod'
import { passwordSchema } from '../utils/password'

const email = z.string().trim().toLowerCase().email().max(200)

// Permissive phone: local or international format, digits with optional
// separators. Uniqueness (not format) is the real constraint here.
const phone = z
  .string()
  .trim()
  .min(7, 'Enter a valid phone number')
  .max(30)
  .regex(/^[+]?[0-9][0-9\s-]{5,}$/, 'Enter a valid phone number')

const fullName = z.string().trim().min(1, 'Full name is required').max(120)

export const registerSchema = z.object({
  fullName,
  email,
  phone,
  password: passwordSchema,
})

export const loginSchema = z.object({
  email,
  // Login never reveals the policy: any non-empty password is accepted for the check.
  password: z.string().min(1, 'Password is required'),
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
