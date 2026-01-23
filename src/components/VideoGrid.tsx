import type { Video } from '../lib/types'
import { VideoCard } from './VideoCard'

interface VideoGridProps {
  videos: Video[]
  onSaveIdea?: (video: Video) => void
  emptyMessage?: string
}

/**
 * Displays videos in a responsive grid layout.
 * Uses CSS Grid auto-fit for automatic column adjustment.
 * REQ-VID-003: Display top 20 long-form videos
 */
export function VideoGrid({ videos, onSaveIdea, emptyMessage = 'No videos found' }: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#aaaaaa]">{emptyMessage}</p>
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
