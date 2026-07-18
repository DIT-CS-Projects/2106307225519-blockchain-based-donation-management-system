import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { FormField } from '@/components/shared/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateProfile, type AuthUser } from '@/services/auth'
import { toApiError } from '@/services/api'

const profileSchema = z.object({
  fullName: z.string().trim().min(1, 'Enter your full name').max(120),
  phone: z
    .string()
    .trim()
    .min(1, 'Enter your phone number')
    .regex(/^[+]?[0-9][0-9\s-]{5,}$/, 'Enter a valid phone number'),
})

type ProfileValues = z.infer<typeof profileSchema>

interface ProfileFormProps {
  user: AuthUser
  onUpdated: (user: AuthUser) => void
}

export function ProfileForm({ user, onUpdated }: ProfileFormProps) {
  const [formError, setFormError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: user.fullName, phone: user.phone },
  })

  const onSubmit = async (values: ProfileValues) => {
    setFormError(null)
    setSaved(false)
    try {
      const updated = await updateProfile(values)
      onUpdated(updated)
      setSaved(true)
    } catch (error) {
      setFormError(toApiError(error).message)
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
      <FormField id="fullName" label="Full name" error={errors.fullName?.message}>
        <Input id="fullName" autoComplete="name" aria-invalid={!!errors.fullName} {...register('fullName')} />
      </FormField>

      <FormField id="phone" label="Phone" error={errors.phone?.message}>
        <Input
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          aria-invalid={!!errors.phone}
          {...register('phone')}
        />
      </FormField>

      <FormField id="email" label="Email">
        <Input id="email" value={user.email} disabled readOnly />
      </FormField>

      {formError && (
        <p role="alert" className="text-sm text-destructive">
          {formError}
        </p>
      )}
      {saved && !formError && (
        <p role="status" className="text-sm text-primary">
          Profile updated.
        </p>
      )}

      <div>
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Saving…
            </>
          ) : (
            'Save changes'
          )}
        </Button>
      </div>
    </form>
  )
}
