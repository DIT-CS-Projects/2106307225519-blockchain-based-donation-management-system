import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { AuthShell } from '@/components/auth/AuthShell'
import { FormField } from '@/components/shared/FormField'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/useAuth'
import { toApiError } from '@/services/api'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import { registerSchema, type RegisterValues } from '@/lib/authSchemas'

const ACCOUNT_TYPES = [
  { value: 'donor', label: 'Donor', hint: 'Support campaigns you believe in.' },
  { value: 'fundraiser', label: 'Fundraiser', hint: 'Raise funds for your own cause.' },
] as const

export function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [formError, setFormError] = useState<string | null>(null)
  const initialAccountType = searchParams.get('type') === 'fundraiser' ? 'fundraiser' : 'donor'

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { accountType: initialAccountType },
  })

  const accountType = watch('accountType')
  const isFundraiser = accountType === 'fundraiser'

  const onSubmit = async (values: RegisterValues) => {
    setFormError(null)
    try {
      await registerUser({
        fullName: values.fullName,
        email: values.email,
        username: values.username || undefined,
        phone: values.phone,
        password: values.password,
        accountType: values.accountType,
        displayName: values.displayName,
        causeDescription: values.causeDescription,
        identityReference: values.identityReference,
      })
      // Signed in automatically; fundraisers land on their dashboard.
      navigate(values.accountType === 'fundraiser' ? ROUTES.fundraiser : ROUTES.campaigns, {
        replace: true,
      })
    } catch (error) {
      setFormError(toApiError(error).message)
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Give once, follow every shilling to where it lands."
      footer={
        <>
          Already have an account?{' '}
          <Link to={ROUTES.login} className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
        <input type="hidden" {...register('accountType')} />
        <fieldset className="grid grid-cols-2 gap-3">
          <legend className="mb-2 text-sm font-medium">I want to join as a</legend>
          {ACCOUNT_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setValue('accountType', t.value, { shouldValidate: true })}
              aria-pressed={accountType === t.value}
              className={cn(
                'rounded-lg border p-4 text-left transition-colors',
                accountType === t.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/40',
              )}
            >
              <span className="block font-medium">{t.label}</span>
              <span className="mt-1 block text-xs text-muted-foreground">{t.hint}</span>
            </button>
          ))}
        </fieldset>

        <FormField id="fullName" label="Full name" error={errors.fullName?.message}>
          <Input
            id="fullName"
            autoComplete="name"
            aria-invalid={!!errors.fullName}
            {...register('fullName')}
          />
        </FormField>

        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register('email')}
          />
        </FormField>

        <FormField
          id="username"
          label="Username (optional)"
          error={errors.username?.message}
          hint="You can sign in with your email or this username."
        >
          <Input
            id="username"
            type="text"
            autoComplete="username"
            aria-invalid={!!errors.username}
            {...register('username')}
          />
        </FormField>

        <FormField id="phone" label="Phone" error={errors.phone?.message}>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+255 700 000 000"
            aria-invalid={!!errors.phone}
            {...register('phone')}
          />
        </FormField>

        {isFundraiser && (
          <div className="grid gap-5 rounded-lg border border-border bg-muted/30 p-5">
            <p className="text-sm text-muted-foreground">
              Tell us about your fundraising. Your campaigns still go live only after an administrator
              reviews them.
            </p>
            <FormField
              id="displayName"
              label="Name you fundraise under"
              error={errors.displayName?.message}
            >
              <Input id="displayName" placeholder="e.g. Hope Foundation" {...register('displayName')} />
            </FormField>
            <FormField id="causeDescription" label="Your cause" error={errors.causeDescription?.message}>
              <Textarea id="causeDescription" rows={3} {...register('causeDescription')} />
            </FormField>
            <FormField
              id="identityReference"
              label="National ID or registration no."
              error={errors.identityReference?.message}
            >
              <Input id="identityReference" {...register('identityReference')} />
            </FormField>
          </div>
        )}

        <FormField
          id="password"
          label="Password"
          error={errors.password?.message}
          hint="At least 8 characters with an uppercase letter, a number, and a symbol."
        >
          <PasswordInput
            id="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            {...register('password')}
          />
        </FormField>

        <FormField
          id="confirmPassword"
          label="Confirm password"
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
              <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Creating account…
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>
    </AuthShell>
  )
}
