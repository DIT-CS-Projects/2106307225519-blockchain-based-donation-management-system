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
  // Blockchain (Decision 010). 'local' targets a Hardhat node for development;
  // 'sepolia' is the flip-the-switch upgrade for demonstration.
  BLOCKCHAIN_NETWORK: z.enum(['local', 'sepolia']).default('local'),
  BLOCKCHAIN_RPC_URL: z.string().url().default('http://127.0.0.1:8545'),
  // Backend wallet that signs proof-recording transactions (never exposed to donors).
  BACKEND_WALLET_PRIVATE_KEY: z.string().min(1).optional(),
  CONTRACT_ADDRESS: z.string().min(1).optional(),
  // Email (Decision 017). 'console' logs instead of sending, no credentials
  // needed; 'smtp' selects the real Nodemailer adapter.
  EMAIL_PROVIDER: z.enum(['console', 'smtp']).default('console'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('ChangiaTanzania <no-reply@changia.org>'),
  // Disbursement payout gateway. 'mock' completes instantly, no credentials
  // needed; 'azampay' selects the real adapter once onboarded.
  DISBURSEMENT_PROVIDER: z.enum(['mock', 'azampay']).default('mock'),
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
