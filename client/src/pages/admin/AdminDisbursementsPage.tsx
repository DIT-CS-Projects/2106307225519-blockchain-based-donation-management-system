import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useFetch } from '@/hooks/useFetch'
import { getDisbursements, type DisbursementStatus } from '@/services/disbursements'
import { formatDate, formatTZS } from '@/utils/format'

const STATUSES: (DisbursementStatus | 'all')[] = [
  'all',
  'pending_approval',
  'approved',
  'processing',
  'completed',
  'failed',
  'rejected',
]

const STATUS_LABEL: Record<DisbursementStatus, string> = {
  pending_approval: 'Pending approval',
  approved: 'Approved',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
  rejected: 'Rejected',
}

export function AdminDisbursementsPage() {
  const [status, setStatus] = useState<DisbursementStatus | 'all'>('all')
  const fetcher = useCallback(
    () => getDisbursements({ status: status === 'all' ? undefined : status, limit: 50 }),
    [status],
  )
  const { data, error, loading, retry } = useFetch(fetcher)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Disbursements</h1>
        <Button asChild>
          <Link to="/admin/disbursements/new">
            <Plus aria-hidden="true" />
            Initiate disbursement
          </Link>
        </Button>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <label htmlFor="status-filter" className="text-sm font-medium">
          Status
        </label>
        <Select
          id="status-filter"
          className="w-52"
          value={status}
          onChange={(e) => setStatus(e.target.value as DisbursementStatus | 'all')}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === 'all' ? 'All' : STATUS_LABEL[s]}
            </option>
          ))}
        </Select>
      </div>

      {loading && <Skeleton className="mt-6 h-96 w-full" />}

      {!loading && error && (
        <div className="mt-6 rounded-lg border border-border bg-card p-10 text-center">
          <p className="text-muted-foreground">Could not load disbursements.</p>
          <Button variant="secondary" className="mt-4" onClick={retry}>
            Try again
          </Button>
        </div>
      )}

      {!loading && !error && data && (
        <div className="mt-6">
          {data.items.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No disbursements found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Beneficiary</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Initiated by</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((d) => (
                  <TableRow
                    key={d.id}
                    className={
                      d.status === 'pending_approval'
                        ? 'bg-secondary/30 hover:bg-secondary/50'
                        : 'hover:bg-muted/30'
                    }
                  >
                    <TableCell className="font-medium">{d.campaignTitle}</TableCell>
                    <TableCell>{d.beneficiaryName}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatTZS(d.amount)}</TableCell>
                    <TableCell>{STATUS_LABEL[d.status]}</TableCell>
                    <TableCell className="text-muted-foreground">{d.initiatedByName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      <Link to={`/admin/disbursements/${d.id}`} className="hover:underline">
                        {formatDate(d.createdAt)}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  )
}
