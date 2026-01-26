import type { Channel, Video } from '../lib/types'
import { ChannelOverviewCard } from './ChannelOverviewCard'
import ChannelOverviewCardSkeleton from './skeletons/ChannelOverviewCardSkeleton'

interface ChannelOverviewGridProps {
  channels: Channel[]
  videosByChannel: Map<string, Video[]>
  isLoading: boolean
}

/**
 * Responsive grid container for channel overview cards.
 * Shows loading skeletons or real channel cards with aggregated metrics.
 * Grid adapts: 1 col mobile → 2 tablet → 3+ desktop.
 */
export function ChannelOverviewGrid({ channels, videosByChannel, isLoading }: ChannelOverviewGridProps) {
  // Show loading skeletons
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <ChannelOverviewCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  // Show channel cards
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {channels.map((channel) => {
        const videos = videosByChannel.get(channel.id) || []
        const videoCount = videos.length
        const latestUploadDate = videos.length > 0 ? videos[0].published_at : null

        return (
          <ChannelOverviewCard
            key={channel.id}
            channel={channel}
            videoCount={videoCount}
            latestUploadDate={latestUploadDate}
          />
        )
      })}
    </div>
  )
}
