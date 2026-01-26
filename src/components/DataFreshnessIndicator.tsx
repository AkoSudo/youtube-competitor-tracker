import { formatDistanceToNow } from 'date-fns'

interface DataFreshnessIndicatorProps {
  lastFetchedAt: Date | string
  className?: string
}

/**
 * Component that displays when data was last fetched.
 * Shows relative time (e.g., "Updated 5 minutes ago") with a clock icon.
 *
 * Features:
 * - Accepts Date or string format for flexibility
 * - Uses date-fns for relative time formatting
 * - Matches existing design system (muted text, small size)
 *
 * @param lastFetchedAt - Timestamp when data was fetched (Date or ISO string)
 * @param className - Optional CSS classes for positioning
 */
export function DataFreshnessIndicator({
  lastFetchedAt,
  className = '',
}: DataFreshnessIndicatorProps) {
  // Convert string to Date if needed
  const timestamp =
    typeof lastFetchedAt === 'string' ? new Date(lastFetchedAt) : lastFetchedAt

  // Format relative time: "5 minutes ago"
  const relativeTime = formatDistanceToNow(timestamp, { addSuffix: true })

  return (
    <div
      className={`flex items-center gap-2 text-xs text-[#aaaaaa] ${className}`}
    >
      {/* Clock icon */}
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>Updated {relativeTime}</span>
    </div>
  )
}
