import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { Select } from '@/components/ui/select'
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
import { useAuth } from '@/hooks/useAuth'
import { toApiError } from '@/services/api'
import { getUsers, updateUserStatus, type UserStatus } from '@/services/admin'
import type { UserRole } from '@/services/auth'
import { formatDate } from '@/utils/format'

const STATUS_OPTIONS: UserStatus[] = ['active', 'suspended', 'deactivated']

export function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const [role, setRole] = useState<UserRole | 'all'>('all')
  const [search, setSearch] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)

  const fetcher = useCallback(
    () => getUsers({ role: role === 'all' ? undefined : role, search: search || undefined, limit: 50 }),
    [role, search],
  )
  const { data, error, loading, retry } = useFetch(fetcher)

  const onStatusChange = async (id: number, status: UserStatus) => {
    setBusyId(id)
    try {
      await updateUserStatus(id, status)
      toast.success('User status updated')
      retry()
    } catch (err) {
      toast.error(toApiError(err).message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Users</h1>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={role} onChange={(e) => setRole(e.target.value as UserRole | 'all')} className="w-40">
          <option value="all">All roles</option>
          <option value="donor">Donor</option>
          <option value="admin">Admin</option>
        </Select>
      </div>

      {loading && <Skeleton className="mt-6 h-96 w-full" />}

      {!loading && error && (
        <div className="mt-6 rounded-lg border border-border bg-card p-10 text-center">
          <p className="text-muted-foreground">Could not load users.</p>
          <Button variant="secondary" className="mt-4" onClick={retry}>
            Try again
          </Button>
        </div>
      )}

      {!loading && !error && data && (
        <div className="mt-6">
          {data.items.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No users found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.fullName}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell className="capitalize">{u.role}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(u.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Select
                        className="w-36"
                        value={u.status}
                        disabled={busyId === u.id || u.id === currentUser?.id}
                        onChange={(e) => void onStatusChange(u.id, e.target.value as UserStatus)}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s[0].toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </Select>
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
