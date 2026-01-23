import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { fetchChannels, addChannel, deleteChannel } from '../lib/channels'
import type { Channel, ChannelInsert } from '../lib/types'

interface UseChannelsResult {
  channels: Channel[]
  isLoading: boolean
  error: string | null
  addChannel: (channel: ChannelInsert) => Promise<{ success: boolean; error?: string }>
  deleteChannel: (id: string) => Promise<{ success: boolean; error?: string }>
  refresh: () => Promise<void>
}

/**
 * Hook for managing channels with real-time updates.
 * Subscribes to Supabase real-time changes on the channels table.
 */
export function useChannels(): UseChannelsResult {
  const [channels, setChannels] = useState<Channel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initial fetch
  const loadChannels = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const result = await fetchChannels()

    if (result.error) {
      setError(result.error)
    } else {
      setChannels(result.data || [])
    }

    setIsLoading(false)
  }, [])

  // Set up real-time subscription
  useEffect(() => {
    // Load initial data
    loadChannels()

    // Subscribe to real-time changes
    // Use unique channel name to avoid "already subscribed" errors
    const channelName = `channels-realtime-${Date.now()}`

    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'channels',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // Add new channel to the beginning (newest first)
            const newChannel = payload.new as Channel
            setChannels((prev) => [newChannel, ...prev])
          } else if (payload.eventType === 'DELETE') {
            // Remove deleted channel
            const deletedId = payload.old.id
            setChannels((prev) => prev.filter((c) => c.id !== deletedId))
          } else if (payload.eventType === 'UPDATE') {
            // Update existing channel
            const updatedChannel = payload.new as Channel
            setChannels((prev) =>
              prev.map((c) => (c.id === updatedChannel.id ? updatedChannel : c))
            )
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Real-time subscription active for channels')
        }
      })

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(subscription)
    }
  }, [loadChannels])

  // Add channel action
  const handleAddChannel = useCallback(
    async (channel: ChannelInsert): Promise<{ success: boolean; error?: string }> => {
      const result = await addChannel(channel)

      if (result.error) {
        return { success: false, error: result.error }
      }

      // Note: Real-time will handle adding to state
      return { success: true }
    },
    []
  )

  // Delete channel action
  const handleDeleteChannel = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      const result = await deleteChannel(id)

      if (result.error) {
        return { success: false, error: result.error }
      }

      // Note: Real-time will handle removing from state
      return { success: true }
    },
    []
  )

  return {
    channels,
    isLoading,
    error,
    addChannel: handleAddChannel,
    deleteChannel: handleDeleteChannel,
    refresh: loadChannels,
  }
}
