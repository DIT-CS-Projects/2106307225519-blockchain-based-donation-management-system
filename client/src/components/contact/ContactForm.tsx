import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { sendContactMessage } from '@/services/contact'
import { toApiError } from '@/services/api'

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name').max(100),
  email: z.string().trim().min(1, 'Please enter your email').email('Enter a valid email'),
  subject: z.string().trim().min(1, 'Please add a subject').max(150),
  message: z
    .string()
    .trim()
    .min(10, 'Please write at least a sentence')
    .max(2000, 'Please keep it under 2000 characters'),
})

type ContactValues = z.infer<typeof contactSchema>

export function ContactForm() {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({ resolver: zodResolver(contactSchema) })

  const onSubmit = async (values: ContactValues) => {
    setSubmitError(null)
    try {
      await sendContactMessage(values)
      setSent(true)
      reset()
    } catch (error) {
      setSubmitError(toApiError(error).message)
    }
  }

  if (sent) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary">
          <CheckCircle2 className="size-6 text-secondary-foreground" aria-hidden="true" />
        </span>
        <h2 className="mt-5 font-display text-2xl font-semibold">Message received</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Thank you for reaching out. We read every message and will reply to the email
          you gave us.
        </p>
        <Button variant="secondary" className="mt-6" onClick={() => setSent(false)}>
          Send another message
        </Button>
      </div>
    )
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-lg border border-border bg-card p-6 sm:p-8"
    >
      <div className="grid gap-5">
        <Field id="name" label="Name" error={errors.name?.message}>
          <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register('name')} />
        </Field>

        <Field id="email" label="Email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register('email')}
          />
        </Field>

        <Field id="subject" label="Subject" error={errors.subject?.message}>
          <Input id="subject" aria-invalid={!!errors.subject} {...register('subject')} />
        </Field>

        <Field id="message" label="Message" error={errors.message?.message}>
          <Textarea
            id="message"
            rows={5}
            aria-invalid={!!errors.message}
            {...register('message')}
          />
        </Field>
      </div>

      {submitError && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {submitError}
        </p>
      )}

      <Button type="submit" size="lg" className="mt-6 w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Sending…' : 'Send message'}
      </Button>
    </form>
  )
}

interface FieldProps {
  id: string
  label: string
  error?: string
  children: ReactNode
}

function Field({ id, label, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
