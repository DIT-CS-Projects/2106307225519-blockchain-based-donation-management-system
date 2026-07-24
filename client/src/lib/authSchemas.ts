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

const usernameField = z
  .string()
  .trim()
  .min(3, 'Username must be at least 3 characters')
  .max(30)
  .regex(/^[a-zA-Z0-9_]+$/, 'Use letters, numbers, and underscores only')

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Enter your email or username'),
  password: z.string().min(1, 'Enter your password'),
  rememberMe: z.boolean().optional(),
})

export const registerSchema = z
  .object({
    fullName,
    email,
    // Optional handle; when set it can be used to sign in.
    username: z.union([z.literal(''), usernameField]).optional(),
    phone,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password'),
    // Account type chosen at sign-up (Decision 021). The form supplies the
    // default via defaultValues, so this stays required to keep the resolver's
    // input and output types aligned.
    accountType: z.enum(['donor', 'fundraiser']),
    displayName: z.string().trim().max(150).optional(),
    causeDescription: z.string().trim().max(2000).optional(),
    identityReference: z.string().trim().max(120).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .superRefine((data, ctx) => {
    if (data.accountType !== 'fundraiser') return
    if (!data.displayName || data.displayName.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['displayName'],
        message: 'Enter the name you fundraise under',
      })
    }
    if (!data.causeDescription || data.causeDescription.length < 20) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['causeDescription'],
        message: 'Describe your cause in at least 20 characters',
      })
    }
    if (!data.identityReference || data.identityReference.length < 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['identityReference'],
        message: 'Enter a valid national ID or registration number',
      })
    }
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
