import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { AuthShell } from '@/components/auth/AuthShell'
import { FormField } from '@/components/shared/FormField'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { toApiError } from '@/services/api'
import { ROUTES, homeForRole } from '@/constants/routes'
import { APP_NAME } from '@/constants/config'
import { loginSchema, type LoginValues } from '@/lib/authSchemas'

interface LocationState {
  from?: { pathname: string; search?: string }
  notice?: string
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const notice = (location.state as LocationState | null)?.notice ?? null
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (values: LoginValues) => {
    setFormError(null)
    try {
      const user = await login({
        identifier: values.identifier,
        password: values.password,
        rememberMe: values.rememberMe,
      })
      const from = (location.state as LocationState | null)?.from
      const destination = from ? `${from.pathname}${from.search ?? ''}` : homeForRole(user.role)
      navigate(destination, { replace: true })
    } catch (error) {
      setFormError(toApiError(error).message)
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue to your account."
      footer={
        <>
          New to {APP_NAME}?{' '}
          <Link to={ROUTES.register} className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
        {notice && (
          <p
            role="status"
            className="rounded-md border border-border bg-secondary px-3 py-2 text-sm text-secondary-foreground"
          >
            {notice}
          </p>
        )}

        <FormField id="identifier" label="Email or username" error={errors.identifier?.message}>
          <Input
            id="identifier"
            type="text"
            autoComplete="username"
            aria-invalid={!!errors.identifier}
            {...register('identifier')}
          />
        </FormField>

        <FormField id="password" label="Password" error={errors.password?.message}>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register('password')}
          />
        </FormField>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              defaultChecked
              className="size-4 rounded border-input accent-primary"
              {...register('rememberMe')}
            />
            Remember me
          </label>
          <Link
            to={ROUTES.forgotPassword}
            className="text-sm font-medium text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {formError && (
          <p role="alert" className="text-sm text-destructive">
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>
    </AuthShell>
  )
}
