import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { parse, toSeconds } from 'https://esm.sh/iso8601-duration@2'

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const SHORTS_THRESHOLD = 180 // Shorts are < 180 seconds (3 minutes)
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

interface VideoInsert {
  channel_id: string
  youtube_id: string
  title: string
  thumbnail_url: string
  duration_seconds: number
  view_count: number
  published_at: string
  fetched_at: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { channelId, youtubeChannelId, forceRefresh } = await req.json()

    if (!channelId || !youtubeChannelId) {
      return new Response(
        JSON.stringify({ error: 'channelId and youtubeChannelId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Check cache freshness (unless forceRefresh is true)
    if (!forceRefresh) {
      const { data: cached } = await supabase
        .from('videos')
        .select('fetched_at')
        .eq('channel_id', channelId)
        .order('fetched_at', { ascending: false })
        .limit(1)

      const cacheAge = cached?.[0]
        ? Date.now() - new Date(cached[0].fetched_at).getTime()
        : Infinity

      if (cacheAge < CACHE_TTL_MS) {
        // Return cached videos
        const { data: cachedVideos } = await supabase
          .from('videos')
          .select('*')
          .eq('channel_id', channelId)
          .gte('duration_seconds', SHORTS_THRESHOLD)
          .order('published_at', { ascending: false })
          .limit(20)

        return new Response(
          JSON.stringify({ videos: cachedVideos, cached: true, fetchedAt: cached[0].fetched_at }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Step 1: Get uploads playlist ID and channel name
    // Handle both channel IDs (UC...) and handles (@username stored as just username)
    const isChannelId = youtubeChannelId.startsWith('UC') && youtubeChannelId.length === 24

    let channelApiUrl: string
    if (isChannelId) {
      channelApiUrl = `https://www.googleapis.com/youtube/v3/channels?` +
        `part=snippet,contentDetails&id=${youtubeChannelId}&key=${YOUTUBE_API_KEY}`
    } else {
      // Try as handle first (most common case for non-UC IDs)
      channelApiUrl = `https://www.googleapis.com/youtube/v3/channels?` +
        `part=snippet,contentDetails&forHandle=${youtubeChannelId}&key=${YOUTUBE_API_KEY}`
    }

    let channelRes = await fetch(channelApiUrl)

    if (!channelRes.ok) {
      const error = await channelRes.json()
      throw new Error(`YouTube API error: ${error.error?.message || channelRes.statusText}`)
    }

    let channelData = await channelRes.json()

    // If handle lookup returned nothing, try as custom URL via search
    if (!channelData.items?.length && !isChannelId) {
      const searchRes = await fetch(
        `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&type=channel&q=${encodeURIComponent(youtubeChannelId)}&maxResults=1&key=${YOUTUBE_API_KEY}`
      )

      if (searchRes.ok) {
        const searchData = await searchRes.json()
        if (searchData.items?.length) {
          const foundChannelId = searchData.items[0].snippet.channelId
          // Now fetch full channel details with the found ID
          channelRes = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?` +
            `part=snippet,contentDetails&id=${foundChannelId}&key=${YOUTUBE_API_KEY}`
          )
          if (channelRes.ok) {
            channelData = await channelRes.json()
          }
        }
      }
    }

    if (!channelData.items?.length) {
      throw new Error('Channel not found on YouTube')
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads
    const channelName = channelData.items[0].snippet.title
    const channelThumbnail = channelData.items[0].snippet.thumbnails?.default?.url || null

    // Update channel name and thumbnail in database
    await supabase
      .from('channels')
      .update({
        name: channelName,
        thumbnail_url: channelThumbnail
      })
      .eq('id', channelId)

    // Step 2: Get video IDs from uploads playlist (max 50)
    const playlistRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?` +
      `part=contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50&key=${YOUTUBE_API_KEY}`
    )

    if (!playlistRes.ok) {
      const error = await playlistRes.json()
      throw new Error(`YouTube API error: ${error.error?.message || playlistRes.statusText}`)
    }

    const playlistData = await playlistRes.json()

    if (!playlistData.items?.length) {
      return new Response(
        JSON.stringify({ videos: [], cached: false, fetchedAt: new Date().toISOString() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const videoIds = playlistData.items
      .map((item: any) => item.contentDetails.videoId)
      .join(',')

    // Step 3: Get video details with duration
    const videosRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?` +
      `part=snippet,contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    )

    if (!videosRes.ok) {
      const error = await videosRes.json()
      throw new Error(`YouTube API error: ${error.error?.message || videosRes.statusText}`)
    }

    const videosData = await videosRes.json()
    const now = new Date().toISOString()

    // Parse, filter Shorts, and transform videos
    const videos: VideoInsert[] = videosData.items
      .map((item: any) => {
        const durationSeconds = toSeconds(parse(item.contentDetails.duration))
        return {
          channel_id: channelId,
          youtube_id: item.id,
          title: item.snippet.title,
          thumbnail_url: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
          duration_seconds: durationSeconds,
          view_count: parseInt(item.statistics.viewCount || '0', 10),
          published_at: item.snippet.publishedAt,
          fetched_at: now,
        }
      })
      .filter((v: VideoInsert) => v.duration_seconds >= SHORTS_THRESHOLD)

    // Upsert videos to database (handles duplicates via youtube_id)
    if (videos.length > 0) {
      const { error: upsertError } = await supabase
        .from('videos')
        .upsert(videos, { onConflict: 'youtube_id' })

      if (upsertError) {
        console.error('Upsert error:', upsertError)
        // Continue - we can still return the videos
      }
    }

    // Return top 20 newest
    const topVideos = videos
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, 20)

    return new Response(
      JSON.stringify({ videos: topVideos, cached: false, fetchedAt: now }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
