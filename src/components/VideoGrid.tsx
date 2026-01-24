import type { Video } from '../lib/types'
import { VideoCard } from './VideoCard'
import { EmptyState } from './EmptyState'

/**
 * Play icon for empty state.
 */
function PlayIcon() {
  return (
    <svg
      className="w-full h-full"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

interface VideoGridProps {
  videos: Video[]
  onSaveIdea?: (video: Video) => void
  emptyMessage?: string
}

/**
 * Responsive grid layout for displaying videos.
 * Uses CSS Grid with auto-fit to adapt to screen size.
 * REQ-VID-003: Display top 20 videos sorted by newest
 */
export function VideoGrid({ videos, onSaveIdea, emptyMessage }: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <EmptyState
        icon={<PlayIcon />}
        title="No videos found"
        description={emptyMessage || 'No videos to display.'}
      />
    )
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} onSaveIdea={onSaveIdea} />
      ))}
    </div>
  )
}
