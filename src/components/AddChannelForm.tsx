import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { parseYouTubeChannelUrl } from '../lib/youtube'
import type { ChannelInsert } from '../lib/types'

interface AddChannelFormProps {
  onAdd: (channel: ChannelInsert) => Promise<{ success: boolean; error?: string }>
  disabled?: boolean
}

/**
 * Form for adding a YouTube channel by URL.
 * Validates URL format and calls onAdd with parsed channel data.
 * REQ-CH-001: Supports /channel/, /@handle, /c/, and raw channel ID formats.
 */
export function AddChannelForm({ onAdd, disabled = false }: AddChannelFormProps) {
  const [url, setUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!url.trim()) {
      toast.error('Please enter a YouTube channel URL')
      return
    }

    // Parse the URL to extract channel info
    const parsed = parseYouTubeChannelUrl(url)

    if (!parsed) {
      toast.error('Invalid YouTube channel URL. Please use a valid channel, handle, or custom URL.')
      return
    }

    setIsSubmitting(true)

    try {
      // For now, we'll use the parsed value as both youtube_id and name
      // In Phase 2, we'll fetch actual channel details from YouTube API
      const channelData: ChannelInsert = {
        youtube_id: parsed.type === 'id' ? parsed.value : parsed.value, // Will be resolved in Phase 2
        name: parsed.type === 'id' ? `Channel ${parsed.value.slice(0, 8)}...` : `@${parsed.value}`,
        thumbnail_url: null, // Will be fetched in Phase 2
        subscriber_count: null, // Will be fetched in Phase 2
      }

      // If it's a direct channel ID, use it
      // If it's a handle/custom, we need to note this for Phase 2 resolution
      // For Phase 1, we'll accept the limitation and store the identifier

      const result = await onAdd(channelData)

      if (result.success) {
        toast.success(`Channel added: ${channelData.name}`)
        setUrl('')
      } else {
        toast.error(result.error || 'Failed to add channel')
      }
    } catch (error) {
      console.error('Error adding channel:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste YouTube channel URL (e.g., youtube.com/@MrBeast)"
          disabled={disabled || isSubmitting}
          className="w-full px-4 py-2 bg-[#272727] border border-[#3f3f3f] rounded-lg text-[#f1f1f1] placeholder-[#aaaaaa] focus:outline-none focus:border-[#aaaaaa] disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {url && (
          <button
            type="button"
            onClick={() => setUrl('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaaaaa] hover:text-[#f1f1f1]"
            aria-label="Clear input"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={disabled || isSubmitting || !url.trim()}
        className="px-6 py-2 bg-red-600 hover:bg-red-500 disabled:bg-red-900 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
      >
        {isSubmitting ? (
          <>
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Adding...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Channel
          </>
        )}
      </button>
    </form>
  )
}
