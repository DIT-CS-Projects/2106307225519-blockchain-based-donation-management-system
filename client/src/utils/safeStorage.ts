/**
 * localStorage wrapper that never throws.
 * Storage access can fail in private browsing, blocked-storage contexts,
 * or when the quota is exhausted. Callers get null or a silent no-op instead.
 */
export const safeStorage = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },

  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value)
    } catch {
      // storage unavailable: value simply isn't persisted
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch {
      // storage unavailable: nothing to remove
    }
  },
}
