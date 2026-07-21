import { env } from '../../config/env'
import { logger } from '../../utils/logger'
import { ConsoleEmailProvider } from './console.provider'
import { SmtpEmailProvider } from './smtp.provider'
import type { EmailProvider } from './provider'

export type { EmailProvider, SendEmailInput } from './provider'

let provider: EmailProvider | null = null

export function getEmailProvider(): EmailProvider {
  if (provider) return provider

  if (env.EMAIL_PROVIDER === 'smtp') {
    if (!env.SMTP_HOST) {
      logger.warn('EMAIL_PROVIDER=smtp but SMTP_HOST is not set; falling back to the console provider.')
      provider = new ConsoleEmailProvider()
    } else {
      provider = new SmtpEmailProvider()
    }
  } else {
    provider = new ConsoleEmailProvider()
  }

  return provider
}
