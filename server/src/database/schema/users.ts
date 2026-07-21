import {
  bigint,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core'

// Roles: docs/BUSINESS_RULES.md (User Roles). Public registration only ever
// creates a donor; admins are provisioned out-of-band (env-based seed script).
export const userRole = pgEnum('user_role', ['donor', 'admin'])

// Account status (api/admin.md: PATCH /users/:id/status). Suspended and
// deactivated accounts are blocked from logging in.
export const userStatus = pgEnum('user_status', ['active', 'suspended', 'deactivated'])

export const users = pgTable(
  'users',
  {
    id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
    fullName: varchar('full_name', { length: 120 }).notNull(),
    email: varchar('email', { length: 200 }).notNull(),
    phone: varchar('phone', { length: 30 }).notNull(),
    passwordHash: text('password_hash').notNull(),
    role: userRole('role').notNull().default('donor'),
    status: userStatus('status').notNull().default('active'),
    profilePhotoUrl: text('profile_photo_url'),
    // Account lockout after repeated failed logins (docs/SECURITY.md).
    failedLoginAttempts: integer('failed_login_attempts').notNull().default(0),
    lockedUntil: timestamp('locked_until', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    // Soft delete: users are never hard-deleted (database/DATABASE_SCHEMA.md).
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('users_email_unique').on(table.email),
    uniqueIndex('users_phone_unique').on(table.phone),
    index('users_role_idx').on(table.role),
  ],
)

export type UserRow = typeof users.$inferSelect
export type NewUserRow = typeof users.$inferInsert
