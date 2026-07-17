import { api } from '@/services/api'

export interface ContactMessage {
  name: string
  email: string
  subject: string
  message: string
}

/** Sends a contact message. Contract: api/contact (POST /api/contact). */
export async function sendContactMessage(payload: ContactMessage): Promise<void> {
  await api.post('/contact', payload)
}
