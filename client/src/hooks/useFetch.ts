import { useCallback, useEffect, useState } from 'react'
import { toApiError, type ApiErrorShape } from '@/services/api'

export interface FetchState<T> {
  data: T | null
  error: ApiErrorShape | null
  loading: boolean
  retry: () => void
}

/**
 * Minimal data-fetching hook for read-only page data.
 * `fetcher` must be referentially stable (a module-level service function
 * or a useCallback-wrapped closure), otherwise the effect re-runs each render.
 */
export function useFetch<T>(fetcher: () => Promise<T>): FetchState<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<ApiErrorShape | null>(null)
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false

    fetcher()
      .then((result) => {
        if (cancelled) return
        setData(result)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(toApiError(err))
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [fetcher, attempt])

  const retry = useCallback(() => {
    setLoading(true)
    setError(null)
    setAttempt((current) => current + 1)
  }, [])

  return { data, error, loading, retry }
}
