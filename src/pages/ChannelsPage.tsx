import { toast } from 'sonner'
import { useChannels } from '../hooks/useChannels'
import { AddChannelForm } from '../components/AddChannelForm'
import { ChannelGrid } from '../components/ChannelGrid'

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

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <svg className="w-8 h-8 animate-spin text-red-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="ml-2 text-[#aaaaaa]">Loading channels...</span>
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
