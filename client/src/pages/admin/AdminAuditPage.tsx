import { useCallback, useState } from 'react'
import { Input } from '@/components/ui/input'
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
import { getAuditLogs } from '@/services/admin'
import { formatDate } from '@/utils/format'

export function AdminAuditPage() {
  const [search, setSearch] = useState('')
  const fetcher = useCallback(() => getAuditLogs({ search: search || undefined, limit: 50 }), [search])
  const { data, error, loading, retry } = useFetch(fetcher)

  return (
    <div>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Audit log</h1>

      <div className="mt-6">
        <Input
          placeholder="Search by admin or action"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {loading && <Skeleton className="mt-6 h-96 w-full" />}

      {!loading && error && (
        <div className="mt-6 rounded-lg border border-border bg-card p-10 text-center">
          <p className="text-muted-foreground">Could not load the audit log.</p>
          <Button variant="secondary" className="mt-4" onClick={retry}>
            Try again
          </Button>
        </div>
      )}

      {!loading && !error && data && (
        <div className="mt-6">
          {data.items.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No activity available.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.admin}</TableCell>
                    <TableCell className="font-mono text-xs">{log.action}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {log.entityType ? `${log.entityType} #${log.entityId}` : '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(log.createdAt)}</TableCell>
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
