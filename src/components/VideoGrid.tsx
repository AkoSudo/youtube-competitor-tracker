import type { Video } from '../lib/types'
import { VideoCard } from './VideoCard'

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
      <div className="text-center py-12">
        <p className="text-[#aaaaaa]">
          {emptyMessage || 'No videos found.'}
        </p>
      </div>
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
