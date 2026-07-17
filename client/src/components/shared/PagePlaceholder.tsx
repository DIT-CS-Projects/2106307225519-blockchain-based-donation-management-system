interface PagePlaceholderProps {
  eyebrow: string
  title: string
  description: string
}

/**
 * Temporary stand-in for pages that ship in a later Stage 2 slice.
 * Static content only — no data, so no loading/error states apply.
 */
export function PagePlaceholder({ eyebrow, title, description }: PagePlaceholderProps) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <p className="text-sm font-medium text-primary">{eyebrow}</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">{title}</h1>
      <p className="mt-4 max-w-prose text-lg leading-relaxed text-muted-foreground">
        {description}
      </p>
    </section>
  )
}
