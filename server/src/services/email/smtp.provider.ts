import nodemailer, { type Transporter } from 'nodemailer'
import { env } from '../../config/env'
import type { EmailProvider, SendEmailInput } from './provider'

/** Real SMTP delivery via Nodemailer, selected once SMTP_* env vars exist. */
export class SmtpEmailProvider implements EmailProvider {
  readonly name = 'smtp'
  private transporter: Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    })
  }

  async send(input: SendEmailInput): Promise<void> {
    await this.transporter.sendMail({
      from: env.SMTP_FROM,
      to: input.to,
      subject: input.subject,
      text: input.text,
    })
  }
}
