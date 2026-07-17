import { PagePlaceholder } from '@/components/shared/PagePlaceholder'
import { APP_NAME } from '@/constants/config'

export function TermsPage() {
  return (
    <PagePlaceholder
      eyebrow="Legal"
      title="Terms of service"
      description={`The terms governing donations and campaigns on ${APP_NAME}. The full terms are published before launch.`}
    />
  )
}
