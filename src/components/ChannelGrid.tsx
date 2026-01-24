import type { Channel } from '../lib/types'
import { ChannelCard } from './ChannelCard'
import { EmptyState } from './EmptyState'

/**
 * Video camera icon for empty state.
 */
function VideoIcon() {
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
        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  )
}

interface ChannelGridProps {
  channels: Channel[]
  onDeleteChannel: (id: string) => void
}

/**
 * Responsive grid for displaying channel cards.
 * REQ-CH-002: 1 col mobile, 2 tablet, 3-4 desktop
 */
export function ChannelGrid({ channels, onDeleteChannel }: ChannelGridProps) {
  if (channels.length === 0) {
    return (
      <EmptyState
        icon={<VideoIcon />}
        title="No channels yet"
        description="Add a YouTube channel URL to start tracking competitors."
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {channels.map((channel) => (
        <ChannelCard
          key={channel.id}
          channel={channel}
          onDelete={onDeleteChannel}
        />
      ))}
    </div>
  )
}
