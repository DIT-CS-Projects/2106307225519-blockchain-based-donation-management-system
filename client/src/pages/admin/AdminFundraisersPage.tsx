import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { FundraiserCard } from '@/components/admin/FundraiserCard'
import { useFetch } from '@/hooks/useFetch'
import { getFundraisers, type FundraiserApplicationStatus } from '@/services/admin'

const STATUS_FILTERS: { value: FundraiserApplicationStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

/**
 * Administrator fundraisers console (Decision 024): a directory of fundraiser
 * accounts with the approval queue built in. A fundraiser cannot create
 * campaigns until approved here.
 */
export function AdminFundraisersPage() {
  const [status, setStatus] = useState<FundraiserApplicationStatus | 'all'>('all')
  const [search, setSearch] = useState('')

  const fetcher = useCallback(
    () =>
      getFundraisers({
        status: status === 'all' ? undefined : status,
        search: search || undefined,
        limit: 50,
      }),
    [status, search],
  )
  const { data, error, loading, retry } = useFetch(fetcher)

  return (
    <div>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Fundraisers</h1>
      <p className="mt-2 text-muted-foreground">
        Approve new fundraisers and manage existing ones. A fundraiser cannot create campaigns until
        their account is approved.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by name, email, or organisation"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as FundraiserApplicationStatus | 'all')}
          className="w-48"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>

      {loading && <Skeleton className="mt-6 h-96 w-full" />}

      {!loading && error && (
        <div className="mt-6 rounded-lg border border-border bg-card p-10 text-center">
          <p className="text-muted-foreground">Could not load fundraisers.</p>
          <Button variant="secondary" className="mt-4" onClick={retry}>
            Try again
          </Button>
        </div>
      )}

      {!loading && !error && data && (
        <div className="mt-6">
          {data.items.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No fundraisers found.
            </p>
          ) : (
            <div className="grid gap-3">
              {data.items.map((f) => (
                <FundraiserCard key={f.applicationId} fundraiser={f} onChanged={retry} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
