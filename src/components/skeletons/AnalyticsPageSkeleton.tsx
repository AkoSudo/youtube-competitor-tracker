/**
 * Skeleton loader for Analytics page.
 * Displays placeholders for section header, metric cards grid, and chart area.
 * Uses motion-safe:animate-pulse for accessibility (respects prefers-reduced-motion).
 */
export function AnalyticsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Section header placeholder */}
      <div className="h-6 w-48 rounded bg-[#272727] motion-safe:animate-pulse" />

      {/* Grid of metric card placeholders - responsive 1/2/3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-[#272727] rounded-xl p-4 h-32 motion-safe:animate-pulse"
          >
            <div className="space-y-3">
              <div className="h-4 w-24 rounded bg-[#3f3f3f]" />
              <div className="h-8 w-32 rounded bg-[#3f3f3f]" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart area placeholder */}
      <div className="h-64 rounded-xl bg-[#272727] motion-safe:animate-pulse p-4">
        <div className="h-5 w-40 rounded bg-[#3f3f3f] mb-4" />
        <div className="h-48 rounded bg-[#3f3f3f]" />
      </div>
    </div>
  )
}
