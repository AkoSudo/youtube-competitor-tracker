import { useState, useEffect } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Custom hook that detects user's motion preference.
 * Returns true if user prefers reduced motion, false otherwise.
 *
 * Features:
 * - SSR-safe (defaults to true for server rendering)
 * - Updates when user toggles system preference
 * - Cleans up event listener on unmount
 *
 * @returns boolean - true if user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  // Default to true (animations disabled) for SSR safety
  // This prevents hydration mismatch when user has reduced motion enabled
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(true)

  useEffect(() => {
    // Get media query and set initial state
    const mediaQuery = window.matchMedia(QUERY)
    setPrefersReducedMotion(mediaQuery.matches)

    // Listen for changes when user toggles system preference
    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', listener)

    // Cleanup listener on unmount
    return () => mediaQuery.removeEventListener('change', listener)
  }, [])

  return prefersReducedMotion
}
