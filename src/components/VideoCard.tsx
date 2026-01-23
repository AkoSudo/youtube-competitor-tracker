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
        className="block relative aspect-video overflow-hidden rounded-xl bg-[#272727]"
      >
        <img
          src={video.thumbnail_url}
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
        />
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
          {formatDuration(video.duration_seconds)}
        </div>
      </a>

      {/* Video info */}
      <div className="mt-3 flex gap-3">
        <div className="flex-1 min-w-0">
          {/* Title - max 2 lines */}
          <a
            href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <h3
              className="text-sm font-medium leading-tight line-clamp-2 text-[#f1f1f1] hover:text-white"
              title={video.title}
            >
              {video.title}
            </h3>
          </a>

          {/* Views and date */}
          <p className="mt-1 text-xs text-[#aaaaaa]">
            {formatViewCount(video.view_count)} views • {formatRelativeDate(video.published_at)}
          </p>
        </div>

        {/* Save Idea button */}
        <button
          onClick={handleSaveIdea}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity h-fit p-2 rounded-lg hover:bg-[#3f3f3f] text-[#aaaaaa] hover:text-white"
          aria-label={`Save idea from "${video.title}"`}
          title="Save Idea"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
