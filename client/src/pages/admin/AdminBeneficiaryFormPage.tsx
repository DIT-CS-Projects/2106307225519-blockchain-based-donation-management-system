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
import { getCampaignsAdmin } from '@/services/adminCampaigns'
import {
  createBeneficiary,
  getBeneficiaryAdmin,
  updateBeneficiary,
  uploadBeneficiaryImage,
} from '@/services/beneficiaries'
import { ROUTES } from '@/constants/routes'
import { beneficiaryFormSchema, type BeneficiaryFormValues } from '@/lib/adminSchemas'

export function AdminBeneficiaryFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const { data: campaigns } = useFetch(useCallback(() => getCampaignsAdmin({ limit: 50 }), []))
  const existingFetcher = useCallback(
    () => (id ? getBeneficiaryAdmin(Number(id)) : Promise.resolve(null)),
    [id],
  )
  const { data: existing, loading } = useFetch(existingFetcher)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BeneficiaryFormValues>({ resolver: zodResolver(beneficiaryFormSchema) })

  useEffect(() => {
    if (existing) {
      reset({
        campaignId: String(existing.campaignId),
        name: existing.name,
        description: existing.description,
        category: existing.category ?? undefined,
        location: existing.location ?? undefined,
        mobileNumber: existing.mobileNumber ?? undefined,
        contactInfo: existing.contactInfo ?? undefined,
      })
    }
  }, [existing, reset])

  const imageUrl = uploadedImageUrl ?? existing?.imageUrl ?? null

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      setUploadedImageUrl(await uploadBeneficiaryImage(file))
    } catch (err) {
      toast.error(toApiError(err).message)
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (values: BeneficiaryFormValues) => {
    setFormError(null)
    try {
      if (isEdit) {
        await updateBeneficiary(Number(id), {
          name: values.name,
          description: values.description,
          category: values.category,
          location: values.location,
          mobileNumber: values.mobileNumber,
          contactInfo: values.contactInfo,
          imageUrl,
        })
        toast.success('Beneficiary updated')
      } else {
        await createBeneficiary({ ...values, campaignId: Number(values.campaignId), imageUrl })
        toast.success('Beneficiary created')
      }
      navigate(ROUTES.adminBeneficiaries)
    } catch (err) {
      setFormError(toApiError(err).message)
    }
  }

  if (isEdit && loading) return <LoadingScreen label="Loading beneficiary" />

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">
        {isEdit ? 'Edit beneficiary' : 'New beneficiary'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-5">
        <FormField id="campaignId" label="Campaign" error={errors.campaignId?.message}>
          <Select id="campaignId" disabled={isEdit} {...register('campaignId')}>
            <option value="">Select a campaign</option>
            {campaigns?.items.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField id="name" label="Name" error={errors.name?.message}>
          <Input id="name" {...register('name')} />
        </FormField>

        <FormField id="description" label="Description" error={errors.description?.message}>
          <Textarea id="description" rows={4} {...register('description')} />
        </FormField>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="category" label="Category (optional)" error={errors.category?.message}>
            <Input id="category" {...register('category')} />
          </FormField>
          <FormField id="location" label="Location (optional)" error={errors.location?.message}>
            <Input id="location" {...register('location')} />
          </FormField>
        </div>

        <FormField
          id="mobileNumber"
          label="Mobile-money number"
          hint="Number that receives the payout, for example 0712345678 or 255712345678. Required before this beneficiary can be paid; leave blank to remove it."
          error={errors.mobileNumber?.message}
        >
          <Input
            id="mobileNumber"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0712345678"
            {...register('mobileNumber')}
          />
        </FormField>

        <FormField id="contactInfo" label="Contact info (optional, admin-only)" error={errors.contactInfo?.message}>
          <Textarea id="contactInfo" rows={2} {...register('contactInfo')} />
        </FormField>

        <FormField id="image" label="Photo">
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
              'Save beneficiary'
            )}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.adminBeneficiaries)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
