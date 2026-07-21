export interface SendEmailInput {
  to: string
  subject: string
  text: string
}

/**
 * The backend sends email through this abstraction so business logic never
 * depends on a specific provider (same pattern as the payment provider
 * abstraction, docs/PAYMENT_ARCHITECTURE.md). A real Nodemailer/SMTP adapter
 * drops in behind this interface once credentials exist (Decision 017).
 */
export interface EmailProvider {
  readonly name: string
  send(input: SendEmailInput): Promise<void>
}
