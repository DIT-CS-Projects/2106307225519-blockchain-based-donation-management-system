import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
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

  // Every explicit session change bumps this. The mount-time bootstrap captures
  // the value at start and only applies its result if nothing has changed since;
  // otherwise a slow refresh that settles after an interactive login would
  // clobber the fresh session (on success) or wipe it (on failure), landing the
  // user back on a public page. This is the intermittent "logged in, then bounced
  // home" race.
  const sessionEpoch = useRef(0)

  const clearSession = useCallback(() => {
    sessionEpoch.current += 1
    setAuthToken(null)
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  const startSession = useCallback((session: authService.AuthSession) => {
    sessionEpoch.current += 1
    setAuthToken(session.token)
    setUser(session.user)
    setStatus('authenticated')
    return session.user
  }, [])

  useEffect(() => {
    let active = true
    const epoch = sessionEpoch.current
    const isStale = () => !active || sessionEpoch.current !== epoch
    bootstrapRefresh()
      .then((session) => {
        if (!isStale()) startSession(session)
      })
      .catch(() => {
        if (!isStale()) clearSession()
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

  const refreshSession = useCallback(
    () => authService.refresh().then(startSession),
    [startSession],
  )

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
      refreshSession,
    }),
    [user, status, login, register, logout, logoutAll, refreshSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
