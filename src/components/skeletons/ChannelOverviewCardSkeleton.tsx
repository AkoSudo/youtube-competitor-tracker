/**
 * Skeleton loader for ChannelOverviewCard.
 * Matches exact dimensions: 64x64 avatar, card padding, metric lines.
 * Uses motion-safe:animate-pulse for accessibility (respects prefers-reduced-motion).
 */
export default function ChannelOverviewCardSkeleton() {
  return (
    <div className="bg-[#272727] rounded-xl p-4">
      <div className="flex items-start gap-4">
        {/* Avatar placeholder - matches 64x64 rounded-full */}
        <div className="flex-shrink-0">
          <div className="w-[64px] h-[64px] rounded-full bg-[#3f3f3f] motion-safe:animate-pulse" />
        </div>

        {/* Info placeholders */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Channel name line - h-5 matches font-semibold */}
          <div className="h-5 rounded bg-[#3f3f3f] w-3/4 motion-safe:animate-pulse" />

          {/* Subscriber count line */}
          <div className="h-4 rounded bg-[#3f3f3f] w-1/2 motion-safe:animate-pulse" />

          {/* Video count line */}
          <div className="h-4 rounded bg-[#3f3f3f] w-1/2 motion-safe:animate-pulse" />

          {/* Latest upload line */}
          <div className="h-4 rounded bg-[#3f3f3f] w-1/2 motion-safe:animate-pulse" />
        </div>
      </div>
    </div>
  )
}
