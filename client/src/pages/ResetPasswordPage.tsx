import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { AuthShell } from '@/components/auth/AuthShell'
import { FormField } from '@/components/shared/FormField'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { Button } from '@/components/ui/button'
import { resetPassword } from '@/services/auth'
import { toApiError } from '@/services/api'
import { ROUTES } from '@/constants/routes'
import { resetPasswordSchema, type ResetPasswordValues } from '@/lib/authSchemas'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema) })

  if (!token) {
    return (
      <AuthShell
        title="Invalid reset link"
        subtitle="This link is missing its reset token. Request a new one to continue."
        footer={
          <Link to={ROUTES.login} className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        }
      >
        <Button asChild size="lg" className="w-full">
          <Link to={ROUTES.forgotPassword}>Request a new link</Link>
        </Button>
      </AuthShell>
    )
  }

  const onSubmit = async (values: ResetPasswordValues) => {
    setFormError(null)
    try {
      await resetPassword(token, values.newPassword)
      navigate(ROUTES.login, {
        replace: true,
        state: { notice: 'Your password has been reset. Please sign in.' },
      })
    } catch (error) {
      setFormError(toApiError(error).message)
    }
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a strong password you have not used before."
      footer={
        <Link to={ROUTES.login} className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
        <FormField
          id="newPassword"
          label="New password"
          error={errors.newPassword?.message}
          hint="At least 8 characters with an uppercase letter, a number, and a symbol."
        >
          <PasswordInput
            id="newPassword"
            autoComplete="new-password"
            aria-invalid={!!errors.newPassword}
            {...register('newPassword')}
          />
        </FormField>

        <FormField
          id="confirmPassword"
          label="Confirm new password"
          error={errors.confirmPassword?.message}
        >
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            {...register('confirmPassword')}
          />
        </FormField>

        {formError && (
          <p role="alert" className="text-sm text-destructive">
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Resetting…
            </>
          ) : (
            'Reset password'
          )}
        </Button>
      </form>
    </AuthShell>
  )
}
