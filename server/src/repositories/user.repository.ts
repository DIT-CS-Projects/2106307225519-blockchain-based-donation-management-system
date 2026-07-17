import { and, eq, isNull, sql } from 'drizzle-orm'
import { requireDb } from '../config/database'
import { users, type NewUserRow, type UserRow } from '../database/schema'

/** Find an active (not soft-deleted) user by email. */
export async function findUserByEmail(email: string): Promise<UserRow | undefined> {
  const client = requireDb()
  const [row] = await client
    .select()
    .from(users)
    .where(and(eq(users.email, email), isNull(users.deletedAt)))
    .limit(1)
  return row
}

/** Find an active user by id. */
export async function findUserById(id: number): Promise<UserRow | undefined> {
  const client = requireDb()
  const [row] = await client
    .select()
    .from(users)
    .where(and(eq(users.id, id), isNull(users.deletedAt)))
    .limit(1)
  return row
}

/** Whether any user (including soft-deleted) already uses this email. */
export async function emailExists(email: string): Promise<boolean> {
  const client = requireDb()
  const [row] = await client
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
  return Boolean(row)
}

/** Whether any user (including soft-deleted) already uses this phone. */
export async function phoneExists(phone: string): Promise<boolean> {
  const client = requireDb()
  const [row] = await client
    .select({ id: users.id })
    .from(users)
    .where(eq(users.phone, phone))
    .limit(1)
  return Boolean(row)
}

export async function insertUser(data: NewUserRow): Promise<UserRow> {
  const client = requireDb()
  const [row] = await client.insert(users).values(data).returning()
  return row
}

export interface ProfileUpdate {
  fullName?: string
  phone?: string
  profilePhotoUrl?: string | null
}

export async function updateUserProfile(id: number, data: ProfileUpdate): Promise<UserRow> {
  const client = requireDb()
  const [row] = await client
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning()
  return row
}

export async function updateUserPassword(id: number, passwordHash: string): Promise<void> {
  const client = requireDb()
  await client
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, id))
}

/** Persist the outcome of a login attempt (lockout bookkeeping). */
export async function updateLoginState(
  id: number,
  failedLoginAttempts: number,
  lockedUntil: Date | null,
): Promise<void> {
  const client = requireDb()
  await client
    .update(users)
    .set({ failedLoginAttempts, lockedUntil, updatedAt: new Date() })
    .where(eq(users.id, id))
}

/** Upsert the initial administrator by email. Used only by the seed script. */
export async function upsertAdmin(data: {
  fullName: string
  email: string
  phone: string
  passwordHash: string
}): Promise<UserRow> {
  const client = requireDb()
  const [row] = await client
    .insert(users)
    .values({ ...data, role: 'admin' })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        fullName: data.fullName,
        phone: data.phone,
        passwordHash: data.passwordHash,
        role: 'admin',
        deletedAt: null,
        updatedAt: sql`now()`,
      },
    })
    .returning()
  return row
}
