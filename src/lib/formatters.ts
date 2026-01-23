import { formatDistanceToNow } from 'date-fns'

/**
 * Format large numbers with K/M/B suffixes.
 * Uses native Intl.NumberFormat for locale-aware formatting.
 * Examples: 1234 -> "1.2K", 1500000 -> "1.5M"
 */
export function formatViewCount(count: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(count)
}

/**
 * Format duration in seconds to MM:SS or HH:MM:SS format.
 * Examples: 185 -> "3:05", 3661 -> "1:01:01"
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format date as relative time ("2 days ago", "1 month ago").
 * Uses date-fns formatDistanceToNow for human-readable output.
 */
export function formatRelativeDate(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true })
}
