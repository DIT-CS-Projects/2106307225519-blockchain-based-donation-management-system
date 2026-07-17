import { ShieldCheck } from 'lucide-react'

/**
 * The campaign's transparency summary. Live on-chain figures arrive with the
 * blockchain module (Stage 5); until then this states the guarantee without
 * inventing a transaction count.
 */
export function VerificationPanel() {
  return (
    <section aria-labelledby="verification-heading" className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          Verified NGO
        </span>
      </div>
      <h2 id="verification-heading" className="mt-4 font-display text-xl font-semibold">
        How this campaign stays honest
      </h2>
      <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
        <li>The NGO behind this campaign was verified before it could accept a shilling.</li>
        <li>Every completed donation is written to a permanent public record.</li>
        <li>Each payout to a beneficiary carries its own verification, published as it happens.</li>
      </ul>
    </section>
  )
}
