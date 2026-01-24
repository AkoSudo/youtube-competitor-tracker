/**
 * Skeleton loader for IdeaCard.
 * Matches exact dimensions: bg-[#272727] rounded-xl p-4, flex gap-4, 120px thumbnail.
 * Uses motion-safe:animate-pulse for accessibility (respects prefers-reduced-motion).
 */
export function IdeaCardSkeleton() {
  return (
    <div className="bg-[#272727] rounded-xl p-4">
      <div className="flex gap-4">
        {/* Thumbnail placeholder - matches w-[120px] aspect-video */}
        <div className="flex-shrink-0">
          <div className="w-[120px] aspect-video bg-[#3f3f3f] rounded motion-safe:animate-pulse" />
        </div>

        {/* Content area */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Note lines - 2-3 lines of text */}
          <div className="space-y-2 mb-2">
            <div className="h-4 bg-[#3f3f3f] rounded w-full motion-safe:animate-pulse" />
            <div className="h-4 bg-[#3f3f3f] rounded w-5/6 motion-safe:animate-pulse" />
            <div className="h-4 bg-[#3f3f3f] rounded w-2/3 motion-safe:animate-pulse" />
          </div>

          {/* Video info lines */}
          <div className="space-y-1 text-sm">
            <div className="h-3 bg-[#3f3f3f] rounded w-3/4 motion-safe:animate-pulse" />
            <div className="h-3 bg-[#3f3f3f] rounded w-1/2 motion-safe:animate-pulse" />
          </div>

          {/* Footer line */}
          <div className="mt-auto pt-2">
            <div className="h-3 bg-[#3f3f3f] rounded w-2/5 motion-safe:animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
