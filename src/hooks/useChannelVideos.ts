import { useState, useEffect, useCallback } from 'react'
import { fetchChannelVideos, getCachedVideos } from '../lib/videos'
import type { Video } from '../lib/types'

interface UseChannelVideosResult {
  videos: Video[]
  isLoading: boolean
  error: string | null
  cached: boolean
  fetchedAt: string | null
  refresh: () => Promise<void>
}

/**
 * Hook for fetching and managing videos for a single channel.
 *
 * @param channelId - Internal UUID from channels table
 * @param youtubeChannelId - YouTube channel ID (UC...)
 */
export function useChannelVideos(
  channelId: string | null,
  youtubeChannelId: string | null
): UseChannelVideosResult {
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cached, setCached] = useState(false)
  const [fetchedAt, setFetchedAt] = useState<string | null>(null)

  // Load videos (with optional force refresh)
  const loadVideos = useCallback(
    async (forceRefresh = false) => {
      if (!channelId || !youtubeChannelId) return

      setIsLoading(true)
      setError(null)

      // Show cached data immediately while fetching fresh
      if (!forceRefresh) {
        const cachedVideos = await getCachedVideos(channelId)
        if (cachedVideos.length > 0) {
          setVideos(cachedVideos)
        }
      }

      // Fetch from Edge Function
      const result = await fetchChannelVideos(channelId, youtubeChannelId, forceRefresh)

      if (result.error) {
        setError(result.error)
      } else {
        setVideos(result.videos)
        setCached(result.cached)
        setFetchedAt(result.fetchedAt)
      }

      setIsLoading(false)
    },
    [channelId, youtubeChannelId]
  )

  // Initial fetch on mount or when channel changes
  useEffect(() => {
    if (channelId && youtubeChannelId) {
      loadVideos(false)
    }
  }, [channelId, youtubeChannelId, loadVideos])

  // Manual refresh (forces fresh fetch from YouTube API)
  const refresh = useCallback(async () => {
    await loadVideos(true)
  }, [loadVideos])

  return {
    videos,
    isLoading,
    error,
    cached,
    fetchedAt,
    refresh,
  }
}
