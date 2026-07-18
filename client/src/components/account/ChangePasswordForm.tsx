import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { FormField } from '@/components/shared/FormField'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { Button } from '@/components/ui/button'
import { changePassword } from '@/services/auth'
import { toApiError } from '@/services/api'
import { changePasswordSchema, type ChangePasswordValues } from '@/lib/authSchemas'

interface ChangePasswordFormProps {
  /** Called after a successful change (the server revokes every session). */
  onChanged: () => void
}

export function ChangePasswordForm({ onChanged }: ChangePasswordFormProps) {
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({ resolver: zodResolver(changePasswordSchema) })

  const onSubmit = async (values: ChangePasswordValues) => {
    setFormError(null)
    try {
      await changePassword(values)
      onChanged()
    } catch (error) {
      setFormError(toApiError(error).message)
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
      <FormField id="oldPassword" label="Current password" error={errors.oldPassword?.message}>
        <PasswordInput
          id="oldPassword"
          autoComplete="current-password"
          aria-invalid={!!errors.oldPassword}
          {...register('oldPassword')}
        />
      </FormField>

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

      <p className="text-xs leading-relaxed text-muted-foreground">
        Changing your password signs you out of every device.
      </p>

      <div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Updating…
            </>
          ) : (
            'Change password'
          )}
        </Button>
      </div>
    </form>
  )
}
