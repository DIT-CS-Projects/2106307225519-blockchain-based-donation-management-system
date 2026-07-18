import type { ReactNode } from 'react'

interface FormFieldProps {
  id: string
  label: string
  error?: string
  hint?: string
  children: ReactNode
}

/** Label + control + hint/error, with the wiring shared by every form. */
export function FormField({ id, label, error, hint, children }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
