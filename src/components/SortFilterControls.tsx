/**
 * Sort and filter controls for video analytics.
 * Provides sort field/direction selection and time period filtering.
 */

// Type definitions for sort and filter options
export type SortField = 'published_at' | 'view_count'
export type SortDirection = 'asc' | 'desc'
export type TimePeriod = '7d' | '30d' | '90d' | 'all'

interface SortFilterControlsProps {
  sortField: SortField
  sortDirection: SortDirection
  timePeriod: TimePeriod
  videoCount: number
  onSortFieldChange: (field: SortField) => void
  onSortDirectionChange: (dir: SortDirection) => void
  onTimePeriodChange: (period: TimePeriod) => void
}

/**
 * Arrow up icon for ascending sort direction.
 */
function ArrowUpIcon() {
  return (
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
        d="M5 15l7-7 7 7"
      />
    </svg>
  )
}

/**
 * Arrow down icon for descending sort direction.
 */
function ArrowDownIcon() {
  return (
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
        d="M19 9l-7 7-7-7"
      />
    </svg>
  )
}

/**
 * Time period options configuration.
 */
const TIME_PERIODS: { value: TimePeriod; label: string }[] = [
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
  { value: 'all', label: 'All time' },
]

/**
 * Sort and filter controls component.
 * Renders sort dropdown, direction toggle, time period buttons, and video count.
 *
 * Requirements covered:
 * - SORT-01: Date option in dropdown
 * - SORT-02: Views option in dropdown
 * - SORT-03: Direction toggle button
 * - SORT-05: Current sort visually indicated
 * - TIME-01: Four time period options
 * - TIME-04: Active period highlighted
 */
export function SortFilterControls({
  sortField,
  sortDirection,
  timePeriod,
  videoCount,
  onSortFieldChange,
  onSortDirectionChange,
  onTimePeriodChange,
}: SortFilterControlsProps) {
  const toggleDirection = () => {
    onSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc')
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      {/* Left side: Sort controls */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#aaaaaa]">Sort by</span>

        {/* Sort field dropdown */}
        <select
          value={sortField}
          onChange={(e) => onSortFieldChange(e.target.value as SortField)}
          className="px-3 py-1.5 bg-[#272727] border border-[#3f3f3f] rounded-lg text-[#f1f1f1] text-sm focus:outline-none focus:border-[#4f4f4f] cursor-pointer"
        >
          <option value="published_at">Date</option>
          <option value="view_count">Views</option>
        </select>

        {/* Direction toggle button */}
        <button
          onClick={toggleDirection}
          className="p-1.5 bg-[#272727] border border-[#3f3f3f] rounded-lg hover:bg-[#3f3f3f] text-[#f1f1f1] transition-colors"
          title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
        >
          {sortDirection === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />}
        </button>
      </div>

      {/* Right side: Time period buttons and video count */}
      <div className="flex items-center gap-4">
        {/* Time period button group */}
        <div className="flex border border-[#3f3f3f] rounded-lg overflow-hidden">
          {TIME_PERIODS.map((period) => (
            <button
              key={period.value}
              onClick={() => onTimePeriodChange(period.value)}
              className={`px-3 py-1.5 text-sm transition-colors ${
                timePeriod === period.value
                  ? 'bg-[#3f3f3f] text-white'
                  : 'bg-[#272727] text-[#aaaaaa] hover:bg-[#3f3f3f] hover:text-white'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        {/* Video count badge */}
        <span className="text-sm text-[#aaaaaa]">
          {videoCount} {videoCount === 1 ? 'video' : 'videos'}
        </span>
      </div>
    </div>
  )
}
