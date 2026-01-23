import { supabase } from './supabase'
import type { Channel, ChannelInsert, DbResult } from './types'

/**
 * Fetch all channels ordered by creation date (newest first).
 */
export async function fetchChannels(): Promise<DbResult<Channel[]>> {
  const { data, error } = await supabase
    .from('channels')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching channels:', error)
    return { data: null, error: error.message }
  }

  return { data: data as Channel[], error: null }
}

/**
 * Add a new channel to the database.
 * Returns error if youtube_id already exists (UNIQUE constraint).
 */
export async function addChannel(channel: ChannelInsert): Promise<DbResult<Channel>> {
  const { data, error } = await supabase
    .from('channels')
    .insert(channel)
    .select()
    .single()

  if (error) {
    console.error('Error adding channel:', error)

    // Handle duplicate youtube_id (UNIQUE constraint violation)
    if (error.code === '23505') {
      return { data: null, error: 'This channel is already being tracked.' }
    }

    return { data: null, error: error.message }
  }

  return { data: data as Channel, error: null }
}

/**
 * Delete a channel by ID.
 * Related videos and ideas will be cascade deleted by database FK constraints.
 */
export async function deleteChannel(id: string): Promise<DbResult<null>> {
  const { error } = await supabase
    .from('channels')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting channel:', error)
    return { data: null, error: error.message }
  }

  return { data: null, error: null }
}

/**
 * Check if a channel with the given youtube_id exists.
 */
export async function channelExists(youtubeId: string): Promise<boolean> {
  const { data } = await supabase
    .from('channels')
    .select('id')
    .eq('youtube_id', youtubeId)
    .single()

  return data !== null
}
