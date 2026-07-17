import axios, { AxiosError } from 'axios'
import { API_BASE_URL } from '@/constants/config'
import { safeStorage } from '@/utils/safeStorage'

export const TOKEN_STORAGE_KEY = 'changia_token'

/** Shared Axios instance. All backend calls go through this service layer. */
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach the access token to every request when present.
api.interceptors.request.use((config) => {
  const token = safeStorage.get(TOKEN_STORAGE_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

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
