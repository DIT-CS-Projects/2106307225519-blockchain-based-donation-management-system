import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/shared/FormField'
import { useFetch } from '@/hooks/useFetch'
import { toApiError } from '@/services/api'
import { broadcastNotification } from '@/services/admin'
import { getNotifications } from '@/services/notifications'
import { formatDate } from '@/utils/format'
import { broadcastFormSchema, type BroadcastFormValues } from '@/lib/adminSchemas'

export function AdminNotificationsPage() {
  const { data, retry } = useFetch(getNotifications)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BroadcastFormValues>({
    resolver: zodResolver(broadcastFormSchema),
    defaultValues: { audience: 'everyone' },
  })

  const onSubmit = async (values: BroadcastFormValues) => {
    try {
      await broadcastNotification(values)
      toast.success('Announcement sent')
      reset({ title: '', message: '', audience: values.audience })
      retry()
    } catch (err) {
      toast.error(toApiError(err).message)
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Notifications</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Send an announcement</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 grid gap-4">
            <FormField id="title" label="Title" error={errors.title?.message}>
              <Input id="title" {...register('title')} />
            </FormField>
            <FormField id="message" label="Message" error={errors.message?.message}>
              <Textarea id="message" rows={4} {...register('message')} />
            </FormField>
            <FormField id="audience" label="Audience" error={errors.audience?.message}>
              <Select id="audience" {...register('audience')}>
                <option value="everyone">Everyone</option>
                <option value="donors">Donors</option>
                <option value="admins">Administrators</option>
              </Select>
            </FormField>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Sending…
                </>
              ) : (
                'Send announcement'
              )}
            </Button>
          </form>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold">Your recent notifications</h2>
          {!data || data.items.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No notifications yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {data.items.map((n) => (
                <li key={n.id} className="rounded-lg border border-border bg-card p-4">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDate(n.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
