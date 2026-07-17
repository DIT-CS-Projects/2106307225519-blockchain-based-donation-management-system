import { pool } from '../config/database'
import { env } from '../config/env'
import { upsertAdmin } from '../repositories/user.repository'
import { hashPassword, passwordSchema } from '../utils/password'
import { logger } from '../utils/logger'

/**
 * Provision the initial administrator from environment variables.
 * Public registration only ever creates donors, so admins are seeded here
 * (docs/BUSINESS_RULES.md). Re-running updates the existing admin by email.
 *
 * Required env: ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD.
 */
async function seedAdmin(): Promise<void> {
  if (!pool) {
    throw new Error('DATABASE_URL is not set. Configure server/.env first.')
  }

  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = env
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error(
      'Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in server/.env before seeding an admin.',
    )
  }

  const password = passwordSchema.safeParse(ADMIN_PASSWORD)
  if (!password.success) {
    throw new Error(`ADMIN_PASSWORD is too weak: ${password.error.issues[0]?.message}`)
  }

  const admin = await upsertAdmin({
    fullName: ADMIN_NAME,
    email: ADMIN_EMAIL.toLowerCase(),
    phone: env.ADMIN_PHONE ?? '+000000000000',
    passwordHash: await hashPassword(ADMIN_PASSWORD),
  })

  logger.info(`Seeded administrator: ${admin.email} (user ${admin.id})`)
  await pool.end()
}

seedAdmin().catch((error) => {
  logger.error(error)
  process.exitCode = 1
})
