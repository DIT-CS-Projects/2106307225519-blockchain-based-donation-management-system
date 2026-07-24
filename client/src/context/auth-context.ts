import { createContext } from 'react'
import type { AuthUser, LoginPayload, RegisterPayload } from '@/services/auth'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export interface AuthContextValue {
  user: AuthUser | null
  status: AuthStatus
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<AuthUser>
  register: (payload: RegisterPayload) => Promise<AuthUser>
  logout: () => Promise<void>
  logoutAll: () => Promise<void>
  /** Replace the cached user after a profile update. */
  updateUser: (user: AuthUser) => void
  /** Rotate the session to pick up a server-side role change (e.g. fundraiser approval). */
  refreshSession: () => Promise<AuthUser>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
