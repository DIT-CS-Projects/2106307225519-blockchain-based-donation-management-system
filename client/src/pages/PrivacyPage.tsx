import { PagePlaceholder } from '@/components/shared/PagePlaceholder'
import { APP_NAME } from '@/constants/config'

export function PrivacyPage() {
  return (
    <PagePlaceholder
      eyebrow="Legal"
      title="Privacy policy"
      description={`How ${APP_NAME} handles donor and beneficiary data. The full policy is published before launch.`}
    />
  )
}
