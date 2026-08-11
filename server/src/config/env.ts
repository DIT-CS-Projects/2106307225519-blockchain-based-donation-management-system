import 'dotenv/config'
import { z } from 'zod'

// Well-known placeholders. Safe locally, never acceptable in production: they
// live in a public repository, so a token signed with one is forgeable by anyone.
const DEV_ACCESS_SECRET = 'dev-access-secret-change-me'
const DEV_REFRESH_SECRET = 'dev-refresh-secret-change-me'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().url().optional(),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  // Development-only fallbacks so a fresh clone boots without setup. Production
  // must override both: the refinement below refuses to start otherwise, so a
  // missing variable can never silently sign tokens with a public secret.
  JWT_ACCESS_SECRET: z.string().min(1).default(DEV_ACCESS_SECRET),
  JWT_REFRESH_SECRET: z.string().min(1).default(DEV_REFRESH_SECRET),
  // Initial administrator, consumed only by the admin seed script (db:seed:admin).
  ADMIN_NAME: z.string().min(1).optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PHONE: z.string().min(7).optional(),
  ADMIN_PASSWORD: z.string().min(1).optional(),
  // Payment gateway. 'mock' drives a self-contained local checkout; 'azampay'
  // (Decision 009) and 'clickpesa' select real adapters once credentials exist.
  // ClickPesa collects real money before KYC, capped by its pre-KYC limits, so
  // it is the gateway that can demonstrate an actual payment today.
  PAYMENT_PROVIDER: z.enum(['mock', 'azampay', 'clickpesa']).default('mock'),
  // How long a checkout session stays payable before it expires.
  PAYMENT_SESSION_TTL_MINUTES: z.coerce.number().int().positive().default(30),
  // AzamPay sandbox/production credentials (docs/PAYMENT_ARCHITECTURE.md). All
  // optional so the app boots on the mock; the adapter falls back to mock unless
  // every value below is present. Auth token comes from the authenticator host;
  // checkout calls hit the checkout host with that token plus the API key.
  AZAMPAY_APP_NAME: z.string().min(1).optional(),
  AZAMPAY_CLIENT_ID: z.string().min(1).optional(),
  AZAMPAY_CLIENT_SECRET: z.string().min(1).optional(),
  AZAMPAY_API_KEY: z.string().min(1).optional(),
  AZAMPAY_AUTH_BASE_URL: z
    .string()
    .url()
    .default('https://authenticator-sandbox.azampay.co.tz'),
  AZAMPAY_CHECKOUT_BASE_URL: z.string().url().default('https://sandbox.azampay.co.tz'),
  // Unguessable secret embedded in the registered callback URL (?key=...). The
  // adapter rejects any callback that does not present it (docs/SECURITY.md).
  AZAMPAY_CALLBACK_SECRET: z.string().min(1).optional(),
  // ClickPesa credentials (docs/PAYMENT_ARCHITECTURE.md). Optional so the app
  // boots on the mock; the adapter falls back unless client id, api key and the
  // webhook secret are all present. One base URL serves live and pre-KYC alike:
  // the account's KYC state, not the host, decides the transaction ceiling.
  CLICKPESA_CLIENT_ID: z.string().min(1).optional(),
  CLICKPESA_API_KEY: z.string().min(1).optional(),
  CLICKPESA_BASE_URL: z.string().url().default('https://api.clickpesa.com'),
  // Optional HMAC-SHA256 key. Sent as a request checksum when configured, and
  // used to verify a checksum on an incoming webhook.
  CLICKPESA_CHECKSUM_KEY: z.string().min(1).optional(),
  // Unguessable secret on the registered webhook URL (?key=...). ClickPesa sends
  // no signature header, so this is what proves a webhook is genuinely ours.
  CLICKPESA_WEBHOOK_SECRET: z.string().min(1).optional(),
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

/**
 * Production must never run on the development placeholders. Failing at boot is
 * deliberate: a server that starts with a public signing secret would accept
 * forged administrator tokens, which is worse than not starting at all.
 */
const productionSecretsSchema = envSchema.superRefine((value, ctx) => {
  if (value.NODE_ENV !== 'production') return

  if (value.JWT_ACCESS_SECRET === DEV_ACCESS_SECRET) {
    ctx.addIssue({
      code: 'custom',
      path: ['JWT_ACCESS_SECRET'],
      message: 'must be set to a private value in production (the development default is public)',
    })
  }
  if (value.JWT_REFRESH_SECRET === DEV_REFRESH_SECRET) {
    ctx.addIssue({
      code: 'custom',
      path: ['JWT_REFRESH_SECRET'],
      message: 'must be set to a private value in production (the development default is public)',
    })
  }
})

const parsed = productionSecretsSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment configuration:')
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
  }
  process.exit(1)
}

export const env = parsed.data
