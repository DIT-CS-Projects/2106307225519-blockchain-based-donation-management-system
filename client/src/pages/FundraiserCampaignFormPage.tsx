import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/shared/FormField'
import { LoadingScreen } from '@/components/shared/LoadingScreen'
import { useFetch } from '@/hooks/useFetch'
import { toApiError } from '@/services/api'
import {
  createCampaign,
  getManagedCampaign,
  updateCampaign,
  uploadCampaignImage,
} from '@/services/adminCampaigns'
import { CAMPAIGN_CATEGORIES } from '@/constants/config'
import { ROUTES, fundraiserCampaignManagePath } from '@/constants/routes'
import { campaignFormSchema, type CampaignFormValues } from '@/lib/adminSchemas'

function toDateInput(iso: string): string {
  return iso.slice(0, 10)
}

/** A fundraiser creates or edits one of their own campaigns (Decision 020). */
export function FundraiserCampaignFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const fetcher = useCallback(
    () => (id ? getManagedCampaign(Number(id)) : Promise.resolve(null)),
    [id],
  )
  const { data: existing, loading } = useFetch(fetcher)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CampaignFormValues>({ resolver: zodResolver(campaignFormSchema) })

  useEffect(() => {
    if (existing) {
      reset({
        title: existing.title,
        description: existing.description,
        category: existing.category,
        targetAmount: String(existing.targetAmount),
        startDate: toDateInput(existing.startDate),
        endDate: toDateInput(existing.endDate),
      })
    }
  }, [existing, reset])

  const imageUrl = uploadedImageUrl ?? existing?.imageUrl ?? null

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      setUploadedImageUrl(await uploadCampaignImage(file))
    } catch (err) {
      toast.error(toApiError(err).message)
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (values: CampaignFormValues) => {
    setFormError(null)
    try {
      const payload = {
        title: values.title,
        description: values.description,
        category: values.category,
        targetAmount: Number(values.targetAmount),
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
        imageUrl,
      }
      if (isEdit) {
        await updateCampaign(Number(id), payload)
        toast.success('Campaign updated')
        navigate(fundraiserCampaignManagePath(Number(id)))
      } else {
        const created = await createCampaign(payload)
        toast.success('Campaign created and submitted for review')
        navigate(fundraiserCampaignManagePath(created.id))
      }
    } catch (err) {
      setFormError(toApiError(err).message)
    }
  }

  if (isEdit && loading) return <LoadingScreen label="Loading campaign" />

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">
        {isEdit ? 'Edit campaign' : 'New campaign'}
      </h1>
      {!isEdit && (
        <p className="mt-2 text-sm text-muted-foreground">
          Your campaign is submitted for administrator review and goes live once approved.
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-5">
        <FormField id="title" label="Title" error={errors.title?.message}>
          <Input id="title" {...register('title')} />
        </FormField>

        <FormField id="description" label="Description" error={errors.description?.message}>
          <Textarea id="description" rows={5} {...register('description')} />
        </FormField>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="category" label="Category" error={errors.category?.message}>
            <Select id="category" {...register('category')}>
              {CAMPAIGN_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField id="targetAmount" label="Target amount (TZS)" error={errors.targetAmount?.message}>
            <Input id="targetAmount" type="number" inputMode="numeric" {...register('targetAmount')} />
          </FormField>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="startDate" label="Start date" error={errors.startDate?.message}>
            <Input id="startDate" type="date" {...register('startDate')} />
          </FormField>
          <FormField id="endDate" label="End date" error={errors.endDate?.message}>
            <Input id="endDate" type="date" {...register('endDate')} />
          </FormField>
        </div>

        <FormField id="image" label="Campaign image">
          <Input
            id="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => void onFileChange(e)}
          />
          {uploading && <p className="mt-2 text-sm text-muted-foreground">Uploading…</p>}
          {imageUrl && !uploading && (
            <img src={imageUrl} alt="" className="mt-3 h-32 w-full rounded-md object-cover" />
          )}
        </FormField>

        {formError && (
          <p role="alert" className="text-sm text-destructive">
            {formError}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting || uploading}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Saving…
              </>
            ) : (
              'Save campaign'
            )}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.fundraiser)}>
            Cancel
          </Button>
        </div>
      </form>
    </section>
  )
}
