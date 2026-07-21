import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { BadgeCheck, Pencil, Plus, ShieldOff, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { toApiError } from '@/services/api'
import {
  deleteBeneficiary,
  getBeneficiariesAdmin,
  setBeneficiaryVerified,
} from '@/services/beneficiaries'
import { formatDate } from '@/utils/format'

export function AdminBeneficiariesPage() {
  const [busyId, setBusyId] = useState<number | null>(null)
  const { data, error, loading, retry } = useFetch(() => getBeneficiariesAdmin({ limit: 50 }))

  const onToggleVerify = async (id: number, verified: boolean) => {
    setBusyId(id)
    try {
      await setBeneficiaryVerified(id, verified)
      toast.success(verified ? 'Beneficiary verified' : 'Verification revoked')
      retry()
    } catch (err) {
      toast.error(toApiError(err).message)
    } finally {
      setBusyId(null)
    }
  }

  const onDelete = async (id: number) => {
    if (!confirm('Delete this beneficiary?')) return
    setBusyId(id)
    try {
      await deleteBeneficiary(id)
      toast.success('Beneficiary deleted')
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
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Beneficiaries</h1>
        <Button asChild>
          <Link to="/admin/beneficiaries/new">
            <Plus aria-hidden="true" />
            New beneficiary
          </Link>
        </Button>
      </div>

      {loading && <Skeleton className="mt-6 h-96 w-full" />}

      {!loading && error && (
        <div className="mt-6 rounded-lg border border-border bg-card p-10 text-center">
          <p className="text-muted-foreground">Could not load beneficiaries.</p>
          <Button variant="secondary" className="mt-4" onClick={retry}>
            Try again
          </Button>
        </div>
      )}

      {!loading && !error && data && (
        <div className="mt-6">
          {data.items.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No beneficiaries yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell className="text-muted-foreground">{b.location ?? '—'}</TableCell>
                    <TableCell>
                      <span
                        className={
                          b.verified
                            ? 'inline-flex items-center gap-1 text-primary'
                            : 'inline-flex items-center gap-1 text-muted-foreground'
                        }
                      >
                        {b.verified ? 'Verified' : 'Unverified'}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(b.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={b.verified ? 'Revoke verification' : 'Verify'}
                          disabled={busyId === b.id}
                          onClick={() => void onToggleVerify(b.id, !b.verified)}
                        >
                          {b.verified ? (
                            <ShieldOff className="size-4" />
                          ) : (
                            <BadgeCheck className="size-4 text-primary" />
                          )}
                        </Button>
                        <Button asChild variant="ghost" size="icon" aria-label="Edit">
                          <Link to={`/admin/beneficiaries/${b.id}/edit`}>
                            <Pencil className="size-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete"
                          disabled={busyId === b.id}
                          onClick={() => void onDelete(b.id)}
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
