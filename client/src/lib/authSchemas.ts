import { z } from 'zod'

// Mirrors the server password policy (docs/SECURITY.md). The backend remains
// the source of truth; this gives instant, friendly client-side feedback.
export const passwordSchema = z
  .string()
  .min(8, 'Use at least 8 characters')
  .regex(/[A-Z]/, 'Add an uppercase letter')
  .regex(/[a-z]/, 'Add a lowercase letter')
  .regex(/[0-9]/, 'Add a number')
  .regex(/[^A-Za-z0-9]/, 'Add a special character')

const email = z.string().trim().min(1, 'Enter your email').email('Enter a valid email')

const phone = z
  .string()
  .trim()
  .min(1, 'Enter your phone number')
  .regex(/^[+]?[0-9][0-9\s-]{5,}$/, 'Enter a valid phone number')

const fullName = z.string().trim().min(1, 'Enter your full name').max(120)

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password'),
  rememberMe: z.boolean().optional(),
})

export const registerSchema = z
  .object({
    fullName,
    email,
    phone,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({ email })

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Enter your current password'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>
