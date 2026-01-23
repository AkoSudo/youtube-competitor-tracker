import { supabase } from './supabase'
import type { Video } from './types'

interface FetchVideosResult {
  videos: Video[]
  cached: boolean
  fetchedAt: string
  error: string | null
}

/**
 * Fetch videos for a channel via Edge Function.
 * Handles caching automatically (24hr TTL).
 *
 * @param channelId - Internal UUID from channels table
 * @param youtubeChannelId - YouTube channel ID (UC...)
 * @param forceRefresh - Skip cache and fetch fresh data
 */
export async function fetchChannelVideos(
  channelId: string,
  youtubeChannelId: string,
  forceRefresh = false
): Promise<FetchVideosResult> {
  try {
    const { data, error } = await supabase.functions.invoke('fetch-channel-videos', {
      body: { channelId, youtubeChannelId, forceRefresh },
    })

    if (error) {
      return {
        videos: [],
        cached: false,
        fetchedAt: '',
        error: error.message || 'Failed to fetch videos',
      }
    }

    if (data.error) {
      return {
        videos: [],
        cached: false,
        fetchedAt: '',
        error: data.error,
      }
    }

    return {
      videos: data.videos || [],
      cached: data.cached || false,
      fetchedAt: data.fetchedAt || new Date().toISOString(),
      error: null,
    }
  } catch (err) {
    return {
      videos: [],
      cached: false,
      fetchedAt: '',
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Get cached videos from database directly (for initial render before Edge Function responds).
 * This allows showing stale data while fresh data is being fetched.
 */
export async function getCachedVideos(channelId: string): Promise<Video[]> {
  const { data } = await supabase
    .from('videos')
    .select('*')
    .eq('channel_id', channelId)
    .gte('duration_seconds', 180)
    .order('published_at', { ascending: false })
    .limit(20)

  return data || []
}
