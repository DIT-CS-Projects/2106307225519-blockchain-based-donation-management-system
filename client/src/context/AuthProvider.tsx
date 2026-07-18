import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as authService from '@/services/auth'
import type { AuthUser, LoginPayload, RegisterPayload } from '@/services/auth'
import { setAuthToken, setUnauthenticatedHandler } from '@/services/api'
import { AuthContext, type AuthStatus } from './auth-context'

// Single-flight guard: refresh-token rotation means two concurrent refreshes
// (e.g. React StrictMode's double-invoked mount effect) would revoke each
// other. Share one in-flight bootstrap call instead.
let inflightBootstrap: Promise<authService.AuthSession> | null = null

function bootstrapRefresh(): Promise<authService.AuthSession> {
  if (!inflightBootstrap) {
    const pending = authService.refresh()
    inflightBootstrap = pending
    // Reset the guard once settled. This side chain swallows both outcomes so
    // it never becomes an unhandled rejection; callers attach their own
    // then/catch to the returned promise.
    pending.then(
      () => undefined,
      () => undefined,
    ).finally(() => {
      if (inflightBootstrap === pending) inflightBootstrap = null
    })
  }
  return inflightBootstrap
}

/**
 * Owns the authenticated user and access token. On mount it tries to rotate the
 * httpOnly refresh cookie into a fresh session, so a reload keeps the user
 * signed in without persisting the refresh token in JavaScript.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  const clearSession = useCallback(() => {
    setAuthToken(null)
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  const startSession = useCallback((session: authService.AuthSession) => {
    setAuthToken(session.token)
    setUser(session.user)
    setStatus('authenticated')
    return session.user
  }, [])

  useEffect(() => {
    let active = true
    bootstrapRefresh()
      .then((session) => {
        if (active) startSession(session)
      })
      .catch(() => {
        if (active) clearSession()
      })
    return () => {
      active = false
    }
  }, [startSession, clearSession])

  // Forced logout when the interceptor cannot refresh a live session.
  useEffect(() => {
    setUnauthenticatedHandler(() => clearSession())
    return () => setUnauthenticatedHandler(null)
  }, [clearSession])

  const login = useCallback(
    (payload: LoginPayload) => authService.login(payload).then(startSession),
    [startSession],
  )

  const register = useCallback(
    (payload: RegisterPayload) => authService.register(payload).then(startSession),
    [startSession],
  )

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      clearSession()
    }
  }, [clearSession])

  const logoutAll = useCallback(async () => {
    try {
      await authService.logoutAll()
    } finally {
      clearSession()
    }
  }, [clearSession])

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated',
      login,
      register,
      logout,
      logoutAll,
      updateUser: setUser,
    }),
    [user, status, login, register, logout, logoutAll],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
