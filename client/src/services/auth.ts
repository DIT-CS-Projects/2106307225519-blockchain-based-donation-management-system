import { api } from '@/services/api'

export type UserRole = 'donor' | 'fundraiser' | 'admin'

export interface AuthUser {
  id: number
  fullName: string
  email: string
  username: string | null
  phone: string
  role: UserRole
  profilePhotoUrl: string | null
  createdAt: string
}

export interface AuthSession {
  user: AuthUser
  token: string
}

export interface RegisterPayload {
  fullName: string
  email: string
  username: string
  phone: string
  password: string
  // Direct fundraiser registration (Decision 021).
  accountType?: 'donor' | 'fundraiser'
  displayName?: string
  causeDescription?: string
  identityReference?: string
}

export interface LoginPayload {
  // Email or username.
  identifier: string
  password: string
  rememberMe?: boolean
}

export interface UpdateProfilePayload {
  fullName?: string
  phone?: string
  profilePhotoUrl?: string | null
}

export interface ChangePasswordPayload {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

// Contract: api/authentication.md (base path /api/auth).

export async function register(payload: RegisterPayload): Promise<AuthSession> {
  const { data } = await api.post<AuthSession>('/auth/register', payload)
  return data
}

export async function login(payload: LoginPayload): Promise<AuthSession> {
  const { data } = await api.post<AuthSession>('/auth/login', payload)
  return data
}

export async function refresh(): Promise<AuthSession> {
  const { data } = await api.post<AuthSession>('/auth/refresh')
  return data
}

export async function getMe(): Promise<AuthUser> {
  const { data } = await api.get<{ user: AuthUser }>('/auth/me')
  return data.user
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
  const { data } = await api.put<{ user: AuthUser }>('/auth/profile', payload)
  return data.user
}

export async function changePassword(payload: ChangePasswordPayload): Promise<string> {
  const { data } = await api.put<{ message: string }>('/auth/change-password', payload)
  return data.message
}

export async function forgotPassword(email: string): Promise<string> {
  const { data } = await api.post<{ message: string }>('/auth/forgot-password', { email })
  return data.message
}

export async function resetPassword(token: string, newPassword: string): Promise<string> {
  const { data } = await api.post<{ message: string }>('/auth/reset-password', {
    token,
    newPassword,
  })
  return data.message
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}

export async function logoutAll(): Promise<void> {
  await api.post('/auth/logout-all')
}

// A fundraiser's own approval status, for the dashboard (Decision 024). Donors
// and fundraisers are separate actors: there is no donor "apply" path.

export type FundraiserApplicationStatus = 'pending' | 'approved' | 'rejected'

export interface FundraiserApplication {
  id: number
  displayName: string
  causeDescription: string
  identityReference: string
  contactPhone: string
  status: FundraiserApplicationStatus
  decisionReason: string | null
  createdAt: string
  reviewedAt: string | null
}

export async function getFundraiserApplication(): Promise<FundraiserApplication | null> {
  const { data } = await api.get<{ application: FundraiserApplication | null }>(
    '/auth/fundraiser-application',
  )
  return data.application
}
