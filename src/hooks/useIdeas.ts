import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { supabase } from '../lib/supabase'
import { fetchIdeas, addIdea, deleteIdea } from '../lib/ideas'
import type { IdeaWithVideo, IdeaInsert } from '../lib/types'

interface UseIdeasResult {
  ideas: IdeaWithVideo[]
  isLoading: boolean
  error: string | null
  addIdea: (idea: IdeaInsert) => Promise<{ success: boolean; error?: string }>
  deleteIdea: (id: string) => Promise<{ success: boolean; error?: string }>
  refresh: () => Promise<void>
}

/**
 * Hook for managing ideas with real-time updates.
 * Subscribes to Supabase real-time changes on the ideas table.
 * Shows toast notification when teammate adds an idea.
 */
export function useIdeas(): UseIdeasResult {
  const [ideas, setIdeas] = useState<IdeaWithVideo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initial fetch
  const loadIdeas = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const result = await fetchIdeas()

    if (result.error) {
      setError(result.error)
    } else {
      setIdeas(result.data || [])
    }

    setIsLoading(false)
  }, [])

  // Set up real-time subscription
  useEffect(() => {
    // Load initial data
    loadIdeas()

    // Subscribe to real-time changes
    // Use unique channel name to avoid "already subscribed" errors
    const channelName = `ideas-realtime-${Date.now()}`

    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ideas',
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // Refetch to get full joined data (payload.new only has raw idea)
            const result = await fetchIdeas()
            if (result.data) {
              setIdeas(result.data)

              // Show toast if teammate added (not own action)
              const newIdea = payload.new as { id: string; added_by: string }
              const currentUser = localStorage.getItem('youtubeTracker_userName')

              if (newIdea.added_by && newIdea.added_by !== currentUser) {
                toast.info(`New idea added by ${newIdea.added_by}`)
              }
            }
          } else if (payload.eventType === 'DELETE') {
            // Remove deleted idea from state
            const deletedId = payload.old.id
            setIdeas((prev) => prev.filter((i) => i.id !== deletedId))
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Real-time subscription active for ideas')
        }
      })

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(subscription)
    }
  }, [loadIdeas])

  // Add idea action
  const handleAddIdea = useCallback(
    async (idea: IdeaInsert): Promise<{ success: boolean; error?: string }> => {
      const result = await addIdea(idea)

      if (result.error) {
        return { success: false, error: result.error }
      }

      // Note: Real-time will handle adding to state
      return { success: true }
    },
    []
  )

  // Delete idea action
  const handleDeleteIdea = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      const result = await deleteIdea(id)

      if (result.error) {
        return { success: false, error: result.error }
      }

      // Note: Real-time will handle removing from state
      return { success: true }
    },
    []
  )

  return {
    ideas,
    isLoading,
    error,
    addIdea: handleAddIdea,
    deleteIdea: handleDeleteIdea,
    refresh: loadIdeas,
  }
}
