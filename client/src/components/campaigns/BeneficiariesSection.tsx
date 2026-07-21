import { useCallback } from 'react'
import { BadgeCheck } from 'lucide-react'
import { useFetch } from '@/hooks/useFetch'
import { getBeneficiaries } from '@/services/beneficiaries'

/** Verified beneficiaries of a campaign (campaign-pages.md: Campaign Details layout). */
export function BeneficiariesSection({ campaignId }: { campaignId: number }) {
  const fetcher = useCallback(() => getBeneficiaries(campaignId), [campaignId])
  const { data } = useFetch(fetcher)

  if (!data || data.length === 0) return null

  return (
    <section aria-labelledby="beneficiaries-heading" className="mt-14">
      <h2 id="beneficiaries-heading" className="font-display text-2xl font-semibold">
        Who this helps
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {data.map((b) => (
          <div key={b.id} className="flex gap-4 rounded-lg border border-border bg-card p-4">
            {b.imageUrl && (
              <img
                src={b.imageUrl}
                alt=""
                className="size-16 shrink-0 rounded-md object-cover"
              />
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-medium">{b.name}</h3>
                <BadgeCheck className="size-4 shrink-0 text-primary" aria-label="Verified" />
              </div>
              {b.location && <p className="text-xs text-muted-foreground">{b.location}</p>}
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{b.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
