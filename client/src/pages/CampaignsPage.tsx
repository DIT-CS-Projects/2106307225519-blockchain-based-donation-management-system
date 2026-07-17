import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { CampaignCard, CampaignCardSkeleton } from '@/components/cards/CampaignCard'
import { CampaignFilters } from '@/components/campaigns/CampaignFilters'
import { Pagination } from '@/components/shared/Pagination'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useFetch } from '@/hooks/useFetch'
import { getCampaigns, type CampaignSort } from '@/services/campaigns'
import type { CampaignCategory } from '@/constants/config'

const PAGE_SIZE = 9

export function CampaignsPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CampaignCategory | null>(null)
  const [sort, setSort] = useState<CampaignSort>('newest')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search.trim())

  const fetcher = useCallback(
    () =>
      getCampaigns({
        search: debouncedSearch || undefined,
        category: category ?? undefined,
        sort,
        page,
        limit: PAGE_SIZE,
      }),
    [debouncedSearch, category, sort, page],
  )
  const { data, error, loading, retry } = useFetch(fetcher)

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1
  const hasFilters = debouncedSearch !== '' || category !== null

  const changePage = (next: number) => {
    setPage(next)
    window.scrollTo(0, 0)
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-14 lg:py-20">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">Campaigns</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Every campaign is verified before it can raise a shilling — and every
          shilling is traceable after.
        </p>
      </div>

      <div className="mt-10">
        <CampaignFilters
          search={search}
          onSearchChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          category={category}
          onCategoryChange={(value) => {
            setCategory(value)
            setPage(1)
          }}
          sort={sort}
          onSortChange={(value) => {
            setSort(value)
            setPage(1)
          }}
        />
      </div>

      <div className="mt-10">
        {loading && (
          <div role="status" aria-label="Loading campaigns" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <CampaignCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div role="status" className="rounded-lg border border-border bg-card px-6 py-16 text-center">
            <p className="font-medium">Campaigns couldn't be loaded.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Check your connection and try again — nothing is lost.
            </p>
            <Button variant="secondary" onClick={retry} className="mt-6">
              Try again
            </Button>
          </div>
        )}

        {!loading && !error && data && data.items.length === 0 && (
          <div className="rounded-lg border border-border bg-card px-6 py-16 text-center">
            <p className="font-medium">No campaigns found.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {hasFilters
                ? 'Try a different search or category.'
                : 'Verified campaigns appear here as NGOs publish them.'}
            </p>
            {hasFilters && (
              <Button
                variant="secondary"
                className="mt-6"
                onClick={() => {
                  setSearch('')
                  setCategory(null)
                  setPage(1)
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        )}

        {!loading && !error && data && data.items.length > 0 && (
          <>
            <p aria-live="polite" className="text-sm text-muted-foreground">
              {data.total} campaign{data.total === 1 ? '' : 's'}
            </p>
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
            <div className="mt-12">
              <Pagination page={page} totalPages={totalPages} onPageChange={changePage} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
