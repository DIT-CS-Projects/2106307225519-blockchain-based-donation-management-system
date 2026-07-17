import type { UserRow } from '../database/schema'

/** Public shape of a user. Never includes the password hash or lockout state. */
export interface UserDto {
  id: number
  fullName: string
  email: string
  phone: string
  role: UserRow['role']
  profilePhotoUrl: string | null
  createdAt: string
}

export function toUserDto(row: UserRow): UserDto {
  return {
    id: row.id,
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
    role: row.role,
    profilePhotoUrl: row.profilePhotoUrl,
    createdAt: row.createdAt.toISOString(),
  }
}
