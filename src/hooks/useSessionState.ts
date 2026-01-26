import { useState, useEffect, type Dispatch, type SetStateAction } from 'react'

/**
 * Custom hook that syncs React state to sessionStorage.
 * Provides persistence across page refreshes within the same browser session.
 *
 * Features:
 * - SSR-safe (checks for window before accessing sessionStorage)
 * - Private browsing safe (catches storage errors)
 * - Same API as useState: [value, setValue]
 *
 * @param key - The sessionStorage key to use
 * @param defaultValue - Initial value if no stored value exists
 * @returns Tuple of [state, setState] with same signature as useState
 */
export function useSessionState<T>(
  key: string,
  defaultValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    // SSR safety check
    if (typeof window === 'undefined') return defaultValue

    try {
      const stored = sessionStorage.getItem(key)
      return stored !== null ? (JSON.parse(stored) as T) : defaultValue
    } catch {
      // Handle private browsing mode or storage errors
      return defaultValue
    }
  })

  // Sync state to sessionStorage whenever it changes
  useEffect(() => {
    // SSR safety check
    if (typeof window === 'undefined') return

    try {
      sessionStorage.setItem(key, JSON.stringify(state))
    } catch {
      // Ignore storage errors (quota exceeded, private browsing, etc.)
    }
  }, [key, state])

  return [state, setState]
}
