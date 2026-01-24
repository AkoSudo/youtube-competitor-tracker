import { toast } from 'sonner'
import { useChannels } from '../hooks/useChannels'
import { AddChannelForm } from '../components/AddChannelForm'
import { ChannelGrid } from '../components/ChannelGrid'
import { ChannelCardSkeleton } from '../components/skeletons/ChannelCardSkeleton'

/**
 * Main channels page with add form and channel grid.
 * Uses real-time sync for instant updates across tabs/users.
 */
export function ChannelsPage() {
  const { channels, isLoading, error, addChannel, deleteChannel } = useChannels()

  const handleDeleteChannel = async (id: string) => {
    const channel = channels.find(c => c.id === id)
    const result = await deleteChannel(id)

    if (result.success) {
      toast.success(`Deleted: ${channel?.name || 'Channel'}`)
    } else {
      toast.error(result.error || 'Failed to delete channel')
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header with Add Form */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Channels</h1>
        <AddChannelForm onAdd={addChannel} disabled={isLoading} />
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-600 rounded-lg text-red-400">
          <p>Error loading channels: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Refresh page
          </button>
        </div>
      )}

      {/* Loading State - Skeleton Grid */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ChannelCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Channel Grid */}
      {!isLoading && !error && (
        <ChannelGrid channels={channels} onDeleteChannel={handleDeleteChannel} />
      )}

      {/* Real-time indicator */}
      {!isLoading && !error && channels.length > 0 && (
        <div className="mt-6 text-center">
          <span className="inline-flex items-center gap-2 text-xs text-[#aaaaaa]">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Real-time sync active
          </span>
        </div>
      )}
    </div>
  )
}
