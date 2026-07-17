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

/** Whole days from now until an ISO end date, floored at zero. */
export function daysRemaining(endIso: string): number {
  const MS_PER_DAY = 86_400_000
  const diff = new Date(endIso).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / MS_PER_DAY))
}

/** Clamp a funding progress ratio to a 0–100 percentage. */
export function fundingPercent(raised: number, target: number): number {
  if (target <= 0) return 0
  return Math.min(100, Math.round((raised / target) * 100))
}
