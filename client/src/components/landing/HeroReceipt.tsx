import { Check, ShieldCheck } from 'lucide-react'

const RECEIPT_ROWS = [
  { label: 'Amount', value: 'TZS 50,000' },
  { label: 'Campaign', value: 'Clean water for Kigamboni' },
  { label: 'Method', value: 'M-Pesa' },
  { label: 'Reference', value: 'TMA-2481-0193' },
] as const

const TRAIL_STEPS = [
  'Payment confirmed',
  'Recorded permanently',
  'Publicly verifiable',
] as const

/**
 * The Glass Ledger made literal: an example of the receipt every completed
 * donation gets. Non-interactive, so it stays flat (Flat-At-Rest Rule).
 */
export function HeroReceipt() {
  return (
    <figure className="w-full max-w-md">
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-card-foreground">Donation receipt</p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            Verified
          </span>
        </div>

        <dl className="mt-4 border-t border-border">
          {RECEIPT_ROWS.map((row) => (
            <div
              key={row.label}
              className="flex items-baseline justify-between gap-4 border-b border-border py-3 text-sm"
            >
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="text-right font-medium tabular-nums text-card-foreground">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        <ul className="mt-4 space-y-2.5">
          {TRAIL_STEPS.map((step) => (
            <li key={step} className="flex items-center gap-2.5 text-sm text-card-foreground">
              <span className="flex size-5 items-center justify-center rounded-full bg-secondary">
                <Check className="size-3 text-secondary-foreground" aria-hidden="true" />
              </span>
              {step}
            </li>
          ))}
        </ul>
      </div>
      <figcaption className="mt-3 text-center text-sm text-muted-foreground">
        Example. Every completed donation gets one.
      </figcaption>
    </figure>
  )
}
