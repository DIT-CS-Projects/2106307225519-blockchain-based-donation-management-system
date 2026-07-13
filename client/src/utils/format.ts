// Pure formatting helpers.

/** Format a whole-shilling amount as Tanzanian currency. */
export function formatTZS(amount: number): string {
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Format an ISO date string for display in East Africa Time. */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

/** Clamp a funding progress ratio to a 0–100 percentage. */
export function fundingPercent(raised: number, target: number): number {
  if (target <= 0) return 0
  return Math.min(100, Math.round((raised / target) * 100))
}
