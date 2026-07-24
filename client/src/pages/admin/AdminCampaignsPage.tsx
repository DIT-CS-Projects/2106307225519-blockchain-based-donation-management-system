import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Archive, Pencil, Plus, Trash2 } from 'lucide-react'
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
import { StatusBadge, campaignStatusTone } from '@/components/shared/StatusBadge'
import { useFetch } from '@/hooks/useFetch'
import { toApiError } from '@/services/api'
import {
  archiveCampaign,
  deleteCampaign,
  getCampaignsAdmin,
  type AdminCampaignStatus,
} from '@/services/adminCampaigns'
import { formatDate, formatTZS, fundingPercent } from '@/utils/format'

const STATUSES: (AdminCampaignStatus | 'all')[] = [
  'all',
  'draft',
  'pending_review',
  'active',
  'rejected',
  'completed',
  'archived',
]

function statusLabel(s: AdminCampaignStatus | 'all'): string {
  if (s === 'all') return 'All'
  const words = s.replace(/_/g, ' ')
  return words[0].toUpperCase() + words.slice(1)
}

export function AdminCampaignsPage() {
  const [status, setStatus] = useState<AdminCampaignStatus | 'all'>('all')
  const [busyId, setBusyId] = useState<number | null>(null)

  const fetcher = useCallback(
    () => getCampaignsAdmin({ status: status === 'all' ? undefined : status, limit: 50 }),
    [status],
  )
  const { data, error, loading, retry } = useFetch(fetcher)

  const onArchive = async (id: number) => {
    setBusyId(id)
    try {
      await archiveCampaign(id)
      toast.success('Campaign archived')
      retry()
    } catch (err) {
      toast.error(toApiError(err).message)
    } finally {
      setBusyId(null)
    }
  }

  const onDelete = async (id: number) => {
    if (!confirm('Delete this campaign? This cannot be undone from the UI.')) return
    setBusyId(id)
    try {
      await deleteCampaign(id)
      toast.success('Campaign deleted')
      retry()
    } catch (err) {
      toast.error(toApiError(err).message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Campaigns</h1>
        <Button asChild>
          <Link to="/admin/campaigns/new">
            <Plus aria-hidden="true" />
            New campaign
          </Link>
        </Button>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <label htmlFor="status-filter" className="text-sm font-medium">
          Status
        </label>
        <Select
          id="status-filter"
          className="w-44"
          value={status}
          onChange={(e) => setStatus(e.target.value as AdminCampaignStatus | 'all')}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </Select>
      </div>

      {loading && <Skeleton className="mt-6 h-96 w-full" />}

      {!loading && error && (
        <div className="mt-6 rounded-lg border border-border bg-card p-10 text-center">
          <p className="text-muted-foreground">Could not load campaigns.</p>
          <Button variant="secondary" className="mt-4" onClick={retry}>
            Try again
          </Button>
        </div>
      )}

      {!loading && !error && data && (
        <div className="mt-6">
          {data.items.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No campaigns found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Progress</TableHead>
                  <TableHead>Ends</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell className="text-muted-foreground">{c.ownerName ?? 'Platform'}</TableCell>
                    <TableCell>{c.category}</TableCell>
                    <TableCell>
                      <StatusBadge label={c.status} tone={campaignStatusTone(c.status)} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {fundingPercent(c.raisedAmount, c.targetAmount)}% of {formatTZS(c.targetAmount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(c.endDate)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" aria-label="Edit">
                          <Link to={`/admin/campaigns/${c.id}/edit`}>
                            <Pencil className="size-4" />
                          </Link>
                        </Button>
                        {c.status !== 'archived' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Archive"
                            disabled={busyId === c.id}
                            onClick={() => void onArchive(c.id)}
                          >
                            <Archive className="size-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete"
                          disabled={busyId === c.id}
                          onClick={() => void onDelete(c.id)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
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
