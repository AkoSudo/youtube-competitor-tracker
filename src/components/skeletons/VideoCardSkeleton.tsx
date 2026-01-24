/**
 * Skeleton loader for VideoCard.
 * Matches exact dimensions: aspect-video thumbnail, 2-line title, meta line, save button.
 * Uses motion-safe:animate-pulse for accessibility (respects prefers-reduced-motion).
 */
export function VideoCardSkeleton() {
  return (
    <div>
      {/* Thumbnail placeholder - matches aspect-video rounded-xl */}
      <div className="aspect-video bg-[#272727] rounded-xl motion-safe:animate-pulse" />

      {/* Video info - matches mt-3 spacing */}
      <div className="mt-3 space-y-2">
        {/* Title line 1 - h-4 matches font-medium */}
        <div className="h-4 bg-[#272727] rounded w-full motion-safe:animate-pulse" />

        {/* Title line 2 - slightly shorter */}
        <div className="h-4 bg-[#272727] rounded w-4/5 motion-safe:animate-pulse" />

        {/* Meta line (views + date) - matches text-sm spacing */}
        <div className="h-3 bg-[#272727] rounded w-1/2 mt-2 motion-safe:animate-pulse" />

        {/* Save button placeholder - matches h-10 (py-2 + text) rounded-lg mt-3 */}
        <div className="h-10 bg-[#272727] rounded-lg mt-3 motion-safe:animate-pulse" />
      </div>
    </div>
  )
}
