import { logger } from '../../utils/logger'
import type { EmailProvider, SendEmailInput } from './provider'

/**
 * Local-development email provider: logs the message instead of sending it.
 * No SMTP credentials required. Swap EMAIL_PROVIDER=smtp once SMTP_* env
 * vars are configured to use the real Nodemailer adapter.
 */
export class ConsoleEmailProvider implements EmailProvider {
  readonly name = 'console'

  async send(input: SendEmailInput): Promise<void> {
    logger.info(`[email:mock] to=${input.to} subject="${input.subject}"`)
  }
}
