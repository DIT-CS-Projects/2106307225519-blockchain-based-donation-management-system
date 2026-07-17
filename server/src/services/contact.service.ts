import { z } from 'zod'
import { logger } from '../utils/logger'

export const contactMessageSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  subject: z.string().trim().min(1).max(150),
  message: z.string().trim().min(10).max(2000),
})

export type ContactMessage = z.infer<typeof contactMessageSchema>

/**
 * Receives a contact message. Delivery over email (SMTP) lands in Stage 3;
 * for now the message is logged server-side and acknowledged, so the form is
 * a real, working control rather than a decorative one.
 */
export async function submitContactMessage(message: ContactMessage): Promise<void> {
  logger.info(
    `Contact message from ${message.name} <${message.email}>: ${message.subject}`,
  )
}
