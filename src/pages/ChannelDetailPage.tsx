import { useParams, Link } from 'react-router'
import { useState, useEffect, useRef, useMemo } from 'react'
import { toast } from 'sonner'
import { supabase } from '../lib/supabase'
import { useChannelVideos } from '../hooks/useChannelVideos'
import { useIdeas } from '../hooks/useIdeas'
import { VideoGrid } from '../components/VideoGrid'
import { VideoCardSkeleton } from '../components/skeletons/VideoCardSkeleton'
import { SaveIdeaModal, type SaveIdeaModalRef } from '../components/SaveIdeaModal'
import { UploadFrequencyChart } from '../components/charts/UploadFrequencyChart'
import { formatRelativeDate } from '../lib/formatters'
import type { Channel, Video } from '../lib/types'

type TimePeriod = '7d' | '30d' | '90d' | 'all'

/**
 * Channel detail page showing channel info and videos.
 * REQ-VID-003: Display top 20 long-form videos sorted by newest
 * REQ-VID-006: Manual refresh with last updated timestamp
 */
export function ChannelDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [channel, setChannel] = useState<Channel | null>(null)
  const [channelLoading, setChannelLoading] = useState(true)
  const [topVideosPeriod, setTopVideosPeriod] = useState<TimePeriod>('30d')

  const { videos, isLoading, error, cached, fetchedAt, refresh } = useChannelVideos(
    id || null,
    channel?.youtube_id || null
  )

  const modalRef = useRef<SaveIdeaModalRef>(null)
  const { addIdea } = useIdeas()

  // Filter and sort top 5 videos based on time period
  const topVideos = useMemo(() => {
    const now = new Date()
    let cutoffDate: Date | null = null

    if (topVideosPeriod !== 'all') {
      const days = topVideosPeriod === '7d' ? 7 : topVideosPeriod === '30d' ? 30 : 90
      cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    }

    const filtered = cutoffDate
      ? videos.filter(v => new Date(v.published_at) >= cutoffDate!)
      : videos

    return [...filtered]
      .sort((a, b) => b.view_count - a.view_count)
      .slice(0, 5)
  }, [videos, topVideosPeriod])

  // Fetch channel details
  useEffect(() => {
    async function loadChannel() {
      if (!id) return

      setChannelLoading(true)
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        toast.error('Failed to load channel')
      } else {
        setChannel(data)
      }
      setChannelLoading(false)
    }

    loadChannel()
  }, [id])

  const handleRefresh = async () => {
    toast.promise(refresh(), {
      loading: 'Refreshing videos...',
      success: 'Videos refreshed!',
      error: 'Failed to refresh videos',
    })
  }

  const handleSaveIdea = (video: Video) => {
    modalRef.current?.open(video)
  }

  const handleSaveIdeaSubmit = async (videoId: string, note: string, addedBy: string) => {
    const result = await addIdea({ video_id: videoId, note, added_by: addedBy })
    if (result.success) {
      toast.success('Idea saved!')
    } else {
      toast.error(result.error || 'Failed to save idea')
    }
    return result
  }

  // Loading state for channel
  if (channelLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-[#272727] rounded w-48 mb-4"></div>
          <div className="h-4 bg-[#272727] rounded w-32"></div>
        </div>
      </div>
    )
  }

  // Channel not found
  if (!channel) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-[#f1f1f1] mb-4">Channel not found</h1>
          <Link
            to="/"
            className="text-red-500 hover:text-red-400 underline"
          >
            Back to Channels
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center text-[#aaaaaa] hover:text-white mb-6 transition-colors"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Channels
      </Link>

      {/* Channel header */}
      <div className="flex items-center gap-4 mb-8">
        {channel.thumbnail_url ? (
          <img
            src={channel.thumbnail_url}
            alt={channel.name}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-[#272727] flex items-center justify-center">
            <span className="text-xl text-[#aaaaaa]">
              {channel.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-[#f1f1f1]">{channel.name}</h1>
          {channel.subscriber_count !== null && (
            <p className="text-[#aaaaaa]">
              {new Intl.NumberFormat('en-US', {
                notation: 'compact',
                compactDisplay: 'short',
              }).format(channel.subscriber_count)}{' '}
              subscribers
            </p>
          )}
        </div>
      </div>

      {/* Upload Frequency Chart */}
      <div className="bg-[#1a1a1a] rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-[#f1f1f1] mb-4">Upload Frequency</h2>
        <UploadFrequencyChart videos={videos} />
      </div>

      {/* Top 5 Performing Videos */}
      <div className="bg-[#1a1a1a] rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#f1f1f1]">Top Performing Videos</h2>
          <div className="flex gap-1">
            {(['7d', '30d', '90d', 'all'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTopVideosPeriod(period)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  topVideosPeriod === period
                    ? 'bg-red-600 text-white'
                    : 'bg-[#272727] text-[#aaaaaa] hover:bg-[#3f3f3f] hover:text-white'
                }`}
              >
                {period === 'all' ? 'All Time' : period}
              </button>
            ))}
          </div>
        </div>
        {topVideos.length === 0 ? (
          <p className="text-[#aaaaaa] text-center py-8">
            No videos found in this time period
          </p>
        ) : (
          <div className="space-y-3">
            {topVideos.map((video, index) => (
              <a
                key={video.id}
                href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-3 rounded-lg bg-[#272727] hover:bg-[#3f3f3f] transition-colors"
              >
                <span className="text-lg font-bold text-[#aaaaaa] w-6 text-center">
                  {index + 1}
                </span>
                <img
                  src={video.thumbnail_url}
                  alt={video.title}
                  className="w-24 h-14 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[#f1f1f1] font-medium line-clamp-2">{video.title}</p>
                  <p className="text-sm text-[#aaaaaa]">
                    {new Intl.NumberFormat('en-US', {
                      notation: 'compact',
                      compactDisplay: 'short',
                    }).format(video.view_count)}{' '}
                    views
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Videos header with refresh */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[#f1f1f1]">Recent Videos</h2>
          {fetchedAt && (
            <p className="text-xs text-[#aaaaaa] mt-1">
              {cached ? 'From cache' : 'Fresh'} • Last updated {formatRelativeDate(fetchedAt)}
            </p>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#272727] hover:bg-[#3f3f3f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg
            className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {/* Videos grid */}
      {isLoading && videos.length === 0 ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <VideoGrid
          videos={videos}
          onSaveIdea={handleSaveIdea}
          emptyMessage="No videos found. Try refreshing or check if the channel has recent long-form content."
        />
      )}

      {/* Save Idea Modal */}
      <SaveIdeaModal
        ref={modalRef}
        onSave={handleSaveIdeaSubmit}
      />
    </div>
  )
}
