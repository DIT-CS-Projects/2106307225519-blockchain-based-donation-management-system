import { Check } from 'lucide-react'

const PROMISES = [
  {
    title: 'We verify before a shilling moves',
    body: 'An NGO is checked and approved before its campaign can accept a single donation. Verification is the entry fee, not an afterthought.',
  },
  {
    title: 'We record every donation permanently',
    body: 'Each completed donation and each payout is written to a public ledger that cannot be edited or erased later, by anyone.',
  },
  {
    title: 'We keep personal data off the ledger',
    body: 'The public record proves that money moved and where it went. It never carries your identity or a beneficiary’s private details.',
  },
  {
    title: 'We never invent the numbers',
    body: 'No fabricated totals, no stock testimonials, no borrowed logos. Until real donations exist, you will see honest blanks instead of decoration.',
  },
] as const

/** The trust commitments. The honest, memorable core of the About page. */
export function PromiseList() {
  return (
    <ul className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
      {PROMISES.map((promise) => (
        <li key={promise.title} className="bg-card p-6">
          <span className="flex size-8 items-center justify-center rounded-full bg-secondary">
            <Check className="size-4 text-secondary-foreground" aria-hidden="true" />
          </span>
          <h3 className="mt-4 font-sans text-lg font-semibold">{promise.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{promise.body}</p>
        </li>
      ))}
    </ul>
  )
}
