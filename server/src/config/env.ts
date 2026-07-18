import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().url().optional(),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  JWT_ACCESS_SECRET: z.string().min(1).default('dev-access-secret-change-me'),
  JWT_REFRESH_SECRET: z.string().min(1).default('dev-refresh-secret-change-me'),
  // Initial administrator, consumed only by the admin seed script (db:seed:admin).
  ADMIN_NAME: z.string().min(1).optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PHONE: z.string().min(7).optional(),
  ADMIN_PASSWORD: z.string().min(1).optional(),
  // Payment gateway (Decision 009). 'mock' drives a self-contained local
  // checkout; 'azampay' selects the real adapter once credentials exist.
  PAYMENT_PROVIDER: z.enum(['mock', 'azampay']).default('mock'),
  // How long a checkout session stays payable before it expires.
  PAYMENT_SESSION_TTL_MINUTES: z.coerce.number().int().positive().default(30),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment configuration:')
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
  }
  process.exit(1)
}

export const env = parsed.data
