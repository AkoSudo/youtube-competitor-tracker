/**
 * Skeleton loader for ChannelCard.
 * Matches exact dimensions: 88x88 avatar, card padding, text lines.
 * Uses motion-safe:animate-pulse for accessibility (respects prefers-reduced-motion).
 */
export function ChannelCardSkeleton() {
  return (
    <div className="bg-[#272727] rounded-xl p-4">
      <div className="flex items-start gap-4">
        {/* Avatar placeholder - matches 88x88 rounded-full */}
        <div className="flex-shrink-0">
          <div className="w-[88px] h-[88px] rounded-full bg-[#3f3f3f] motion-safe:animate-pulse" />
        </div>

        {/* Info placeholders */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Name line - h-5 matches font-semibold text-lg */}
          <div className="h-5 rounded bg-[#3f3f3f] w-3/4 motion-safe:animate-pulse" />

          {/* Subscriber line - h-4 matches text-sm */}
          <div className="h-4 rounded bg-[#3f3f3f] w-1/2 motion-safe:animate-pulse" />

          {/* Added date line - h-3 matches text-xs */}
          <div className="h-3 rounded bg-[#3f3f3f] w-2/3 motion-safe:animate-pulse" />
        </div>
      </div>
    </div>
  )
}
