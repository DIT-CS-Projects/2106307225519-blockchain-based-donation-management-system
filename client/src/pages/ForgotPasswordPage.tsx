import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, MailCheck } from 'lucide-react'
import { AuthShell } from '@/components/auth/AuthShell'
import { FormField } from '@/components/shared/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { forgotPassword } from '@/services/auth'
import { toApiError } from '@/services/api'
import { ROUTES } from '@/constants/routes'
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/lib/authSchemas'

export function ForgotPasswordPage() {
  const [formError, setFormError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema) })

  const onSubmit = async (values: ForgotPasswordValues) => {
    setFormError(null)
    try {
      await forgotPassword(values.email)
      setSubmitted(true)
    } catch (error) {
      setFormError(toApiError(error).message)
    }
  }

  if (submitted) {
    return (
      <AuthShell
        title="Check your email"
        footer={
          <Link to={ROUTES.login} className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        }
      >
        <div className="text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary">
            <MailCheck className="size-6 text-secondary-foreground" aria-hidden="true" />
          </span>
          <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
            If an account exists for that email, we have sent a link to reset your password.
            The link expires in one hour.
          </p>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we will send you a reset link."
      footer={
        <Link to={ROUTES.login} className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register('email')}
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
              <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Sending link…
            </>
          ) : (
            'Send reset link'
          )}
        </Button>
      </form>
    </AuthShell>
  )
}
