import { and, count, desc, eq, ilike, inArray, isNull, or, sql, type SQL } from 'drizzle-orm'
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

/** Find an active (not soft-deleted) user by username (stored lowercased). */
export async function findUserByUsername(username: string): Promise<UserRow | undefined> {
  const client = requireDb()
  const [row] = await client
    .select()
    .from(users)
    .where(and(eq(users.username, username), isNull(users.deletedAt)))
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

/** Whether any user (including soft-deleted) already uses this username. */
export async function usernameExists(username: string): Promise<boolean> {
  const client = requireDb()
  const [row] = await client
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
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

/** IDs of all active users holding a given role (e.g. broadcasting to admins). */
export async function findUserIdsByRole(role: UserRow['role']): Promise<number[]> {
  const client = requireDb()
  const rows = await client
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.role, role), isNull(users.deletedAt)))
  return rows.map((r) => r.id)
}

// --- Admin ---

export interface AdminUserFilters {
  role?: UserRow['role']
  search?: string
  page: number
  limit: number
}

export async function findUsersAdmin(
  filters: AdminUserFilters,
): Promise<{ rows: UserRow[]; total: number }> {
  const client = requireDb()
  const conditions: SQL[] = [isNull(users.deletedAt)]
  if (filters.role) conditions.push(eq(users.role, filters.role))
  if (filters.search) {
    const term = `%${filters.search}%`
    conditions.push(or(ilike(users.fullName, term), ilike(users.email, term))!)
  }
  const where = and(...conditions)

  const [rows, [{ total }]] = await Promise.all([
    client
      .select()
      .from(users)
      .where(where)
      .orderBy(desc(users.createdAt))
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit),
    client.select({ total: count() }).from(users).where(where),
  ])
  return { rows, total }
}

/** Map of user id to display name for a set of ids (owner-name resolution). */
export async function findUserNamesByIds(ids: number[]): Promise<Map<number, string>> {
  if (ids.length === 0) return new Map()
  const client = requireDb()
  const rows = await client
    .select({ id: users.id, fullName: users.fullName })
    .from(users)
    .where(inArray(users.id, ids))
  return new Map(rows.map((r) => [r.id, r.fullName]))
}

/** Registered (non-deleted) users, for the admin dashboard stat. */
export async function countUsers(): Promise<number> {
  const client = requireDb()
  const [row] = await client.select({ total: count() }).from(users).where(isNull(users.deletedAt))
  return row?.total ?? 0
}

export async function setUserStatus(id: number, status: UserRow['status']): Promise<UserRow | undefined> {
  const client = requireDb()
  const [row] = await client
    .update(users)
    .set({ status, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning()
  return row
}

/** Change a user's role (fundraiser approval, admin promotion — Decision 020). */
export async function setUserRole(id: number, role: UserRow['role']): Promise<UserRow | undefined> {
  const client = requireDb()
  const [row] = await client
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning()
  return row
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
