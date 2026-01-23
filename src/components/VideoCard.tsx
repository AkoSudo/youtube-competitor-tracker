import type { Video } from '../lib/types'
import { formatViewCount, formatDuration, formatRelativeDate } from '../lib/formatters'

interface VideoCardProps {
  video: Video
  onSaveIdea?: (video: Video) => void
}

/**
 * Displays a single video with thumbnail, duration badge, title, views, and date.
 * REQ-VID-004: Show thumbnail (16:9), duration badge, title (max 2 lines), view count, relative date
 * REQ-VID-005: Click thumbnail opens YouTube in new tab
 * REQ-VID-008: "Save Idea" button on each video card
 */
export function VideoCard({ video, onSaveIdea }: VideoCardProps) {
  const handleSaveIdea = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent link navigation
    e.stopPropagation()
    onSaveIdea?.(video)
  }

  return (
    <div className="group">
      {/* Thumbnail with duration badge */}
      <a
        href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative rounded-xl overflow-hidden aspect-video bg-[#272727]"
      >
        <img
          src={video.thumbnail_url}
          alt={video.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-semibold px-1.5 py-0.5 rounded">
          {formatDuration(video.duration_seconds)}
        </div>
      </a>

      {/* Video info */}
      <div className="mt-3">
        <a
          href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <h3
            className="font-medium text-[#f1f1f1] line-clamp-2 leading-snug group-hover:text-white transition-colors"
            title={video.title}
          >
            {video.title}
          </h3>
        </a>

        <div className="flex items-center gap-2 mt-2 text-sm text-[#aaaaaa]">
          <span>{formatViewCount(video.view_count)} views</span>
          <span>•</span>
          <span>{formatRelativeDate(video.published_at)}</span>
        </div>

        {/* Save Idea button */}
        {onSaveIdea && (
          <button
            onClick={handleSaveIdea}
            className="mt-3 w-full px-3 py-2 rounded-lg bg-[#272727] hover:bg-[#3f3f3f] text-sm font-medium transition-colors"
          >
            Save Idea
          </button>
        )}
      </div>
    </div>
  )
}
