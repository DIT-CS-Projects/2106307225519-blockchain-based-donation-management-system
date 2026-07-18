import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '@/constants/config'
import { safeStorage } from '@/utils/safeStorage'

export const TOKEN_STORAGE_KEY = 'changia_token'

/** Shared Axios instance. All backend calls go through this service layer. */
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  // Send the httpOnly refresh cookie on auth calls.
  withCredentials: true,
})

/** Persist or clear the access token that the request interceptor attaches. */
export function setAuthToken(token: string | null): void {
  if (token) {
    safeStorage.set(TOKEN_STORAGE_KEY, token)
  } else {
    safeStorage.remove(TOKEN_STORAGE_KEY)
  }
}

// Attach the access token to every request when present.
api.interceptors.request.use((config) => {
  const token = safeStorage.get(TOKEN_STORAGE_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Endpoints where a 401 is terminal and must not trigger a refresh-and-retry.
const REFRESH_SKIP_PATHS = [
  '/auth/refresh',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
]

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

let refreshPromise: Promise<string> | null = null
let onUnauthenticated: (() => void) | null = null

/** Register a callback invoked when a session cannot be refreshed (forced logout). */
export function setUnauthenticatedHandler(handler: (() => void) | null): void {
  onUnauthenticated = handler
}

/** Rotate the session using the refresh cookie. Bypasses interceptors to avoid loops. */
async function runRefresh(): Promise<string> {
  const response = await axios.post<{ token: string }>(
    `${API_BASE_URL}/auth/refresh`,
    null,
    { withCredentials: true },
  )
  const token = response.data.token
  setAuthToken(token)
  return token
}

// On a 401, transparently refresh the access token once and retry the request.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined
    const status = error.response?.status
    const url = original?.url ?? ''
    const skip = REFRESH_SKIP_PATHS.some((path) => url.includes(path))

    if (status === 401 && original && !original._retry && !skip) {
      original._retry = true
      try {
        refreshPromise ??= runRefresh().finally(() => {
          refreshPromise = null
        })
        const token = await refreshPromise
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      } catch {
        setAuthToken(null)
        onUnauthenticated?.()
      }
    }
    return Promise.reject(error)
  },
)

export interface ApiErrorShape {
  message: string
  status?: number
}

/** Normalize any Axios error into a friendly, user-safe shape. */
export function toApiError(error: unknown): ApiErrorShape {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    const message =
      (error.response?.data as { message?: string } | undefined)?.message ??
      'Something went wrong. Please try again.'
    return { message, status }
  }
  return { message: 'Something went wrong. Please try again.' }
}
