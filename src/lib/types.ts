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
 * Database operation result type.
 */
export interface DbResult<T> {
  data: T | null
  error: string | null
}
