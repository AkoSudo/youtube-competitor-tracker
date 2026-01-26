import { useNavigate } from 'react-router'
import { useChannels } from '../hooks/useChannels'
import { EmptyState } from '../components/EmptyState'
import { AnalyticsPageSkeleton } from '../components/skeletons/AnalyticsPageSkeleton'

/**
 * Bar chart icon for empty analytics state.
 */
function BarChartIcon() {
  return (
    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  )
}

/**
 * Analytics page showing channel performance metrics and trends.
 * Entry point for all v1.1 analytics features.
 * Displays loading skeleton, empty state, or analytics content based on data availability.
 */
export function AnalyticsPage() {
  const { channels, isLoading, error } = useChannels()
  const navigate = useNavigate()

  // LOADING STATE - Show skeleton while fetching channels
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        {/* Header skeleton */}
        <div className="mb-6">
          <div className="h-8 w-32 bg-[#272727] rounded motion-safe:animate-pulse" />
        </div>
        <AnalyticsPageSkeleton />
      </div>
    )
  }

  // ERROR STATE - Show error message with refresh option
  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Analytics</h1>
        <div className="p-4 bg-red-900/20 border border-red-600 rounded-lg text-red-400">
          <p>Error loading channels: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Refresh page
          </button>
        </div>
      </div>
    )
  }

  // EMPTY STATE - No channels tracked yet
  if (channels.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Analytics</h1>
        <EmptyState
          icon={<BarChartIcon />}
          title="No channels to analyze"
          description="Add some YouTube channels to start seeing analytics."
          action={{
            label: "Add a channel",
            onClick: () => navigate('/')
          }}
        />
      </div>
    )
  }

  // CONTENT STATE - Show placeholder for future analytics
  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      <div className="bg-[#272727] rounded-xl p-6 text-center">
        <p className="text-[#aaaaaa] text-lg mb-2">
          Analytics dashboard coming soon.
        </p>
        <p className="text-[#aaaaaa] text-sm">
          Tracking {channels.length} channel{channels.length === 1 ? '' : 's'}
        </p>
      </div>
    </div>
  )
}
