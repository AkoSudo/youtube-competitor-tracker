import { supabase } from './supabase'
import type { Idea, IdeaInsert, IdeaWithVideo, DbResult } from './types'

/**
 * Fetch all ideas with joined video and channel data.
 * Ordered by creation date (newest first per REQ-IDX-002).
 */
export async function fetchIdeas(): Promise<DbResult<IdeaWithVideo[]>> {
  const { data, error } = await supabase
    .from('ideas')
    .select(`
      *,
      video:videos (
        id,
        youtube_id,
        title,
        thumbnail_url,
        channel:channels (
          id,
          name
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching ideas:', error)
    return { data: null, error: error.message }
  }

  return { data: data as IdeaWithVideo[], error: null }
}

/**
 * Add a new idea to the database.
 * Returns error if note is too short (CHECK constraint: min 10 chars).
 */
export async function addIdea(idea: IdeaInsert): Promise<DbResult<Idea>> {
  const { data, error } = await supabase
    .from('ideas')
    .insert(idea)
    .select()
    .single()

  if (error) {
    console.error('Error adding idea:', error)

    // Handle note too short (CHECK constraint violation)
    if (error.code === '23514') {
      return { data: null, error: 'Note must be at least 10 characters.' }
    }

    return { data: null, error: error.message }
  }

  return { data: data as Idea, error: null }
}

/**
 * Delete an idea by ID.
 */
export async function deleteIdea(id: string): Promise<DbResult<null>> {
  const { error } = await supabase
    .from('ideas')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting idea:', error)
    return { data: null, error: error.message }
  }

  return { data: null, error: null }
}
