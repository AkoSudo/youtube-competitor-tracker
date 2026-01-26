import type { Channel } from '../lib/types'
import { formatViewCount, formatRelativeDate } from '../lib/formatters'

interface ChannelOverviewCardProps {
  channel: Channel
  videoCount: number
  latestUploadDate: string | null  // ISO string or null if no videos
}

/**
 * Displays a channel with aggregated metrics in a compact card.
 * Shows subscriber count, total video count, and latest upload date.
 * Display-only (not clickable) - used in analytics overview grid.
 */
export function ChannelOverviewCard({ channel, videoCount, latestUploadDate }: ChannelOverviewCardProps) {
  return (
    <div className="bg-[#272727] rounded-xl p-4">
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        <div className="flex-shrink-0">
          {channel.thumbnail_url ? (
            <img
              src={channel.thumbnail_url}
              alt={`${channel.name} thumbnail`}
              className="w-[64px] h-[64px] rounded-full object-cover"
            />
          ) : (
            <div className="w-[64px] h-[64px] rounded-full bg-[#3f3f3f] flex items-center justify-center">
              <span className="text-xl text-[#aaaaaa]">
                {channel.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate" title={channel.name}>
            {channel.name}
          </h3>

          <p className="text-[#aaaaaa] text-sm mt-2">
            {formatViewCount(channel.subscriber_count ?? 0)} subscribers
          </p>

          <p className="text-[#aaaaaa] text-sm mt-1">
            {videoCount} {videoCount === 1 ? 'video' : 'videos'}
          </p>

          <p className="text-[#aaaaaa] text-sm mt-1">
            {latestUploadDate ? formatRelativeDate(latestUploadDate) : 'No uploads yet'}
          </p>
        </div>
      </div>
    </div>
  )
}
