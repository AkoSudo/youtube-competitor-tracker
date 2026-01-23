/**
 * Channel record from the channels table.
 * Represents a tracked YouTube channel.
 */
export interface Channel {
  id: string                    // UUID primary key
  youtube_id: string            // YouTube channel ID (UC...)
  name: string                  // Channel display name
  thumbnail_url: string | null  // Channel avatar URL (88x88)
  subscriber_count: number | null // Subscriber count (can be hidden)
  added_by: string | null       // User who added (null for now, auth in v2)
  created_at: string            // ISO timestamp
}

/**
 * Data required to insert a new channel.
 * Omits auto-generated fields (id, created_at).
 */
export interface ChannelInsert {
  youtube_id: string
  name: string
  thumbnail_url?: string | null
  subscriber_count?: number | null
  added_by?: string | null
}

/**
 * Video record from the videos table.
 * Represents a YouTube video from a tracked channel.
 */
export interface Video {
  id: string                    // UUID primary key
  channel_id: string            // FK to channels.id
  youtube_id: string            // YouTube video ID
  title: string                 // Video title
  thumbnail_url: string         // Medium thumbnail (320x180)
  duration_seconds: number      // Duration in seconds (>= 180 for long-form)
  view_count: number            // View count
  published_at: string          // ISO timestamp
  fetched_at: string            // When we last fetched from YouTube API
  created_at: string            // When we first stored this video
}

/**
 * Data required to insert/upsert a video.
 * Omits auto-generated fields (id, created_at).
 */
export interface VideoInsert {
  channel_id: string
  youtube_id: string
  title: string
  thumbnail_url: string
  duration_seconds: number
  view_count: number
  published_at: string
  fetched_at: string
}

/**
 * Database operation result type.
 */
export interface DbResult<T> {
  data: T | null
  error: string | null
}

/**
 * Idea record from the ideas table.
 * Represents a saved video idea with user attribution.
 */
export interface Idea {
  id: string                    // UUID primary key
  video_id: string              // FK to videos.id
  note: string                  // User's note (min 10 chars)
  added_by: string              // User who saved the idea
  created_at: string            // ISO timestamp
}

/**
 * Data required to insert a new idea.
 * Omits auto-generated fields (id, created_at).
 */
export interface IdeaInsert {
  video_id: string
  note: string
  added_by: string
}

/**
 * Idea with joined video and channel data for display.
 * Used when showing ideas with their source video context.
 */
export interface IdeaWithVideo extends Idea {
  video: {
    id: string
    youtube_id: string
    title: string
    thumbnail_url: string
    channel: {
      id: string
      name: string
    }
  }
}
