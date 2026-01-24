import { useState, useMemo, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { useIdeas } from '../hooks/useIdeas'
import { IdeaCard } from '../components/IdeaCard'
import { IdeaCardSkeleton } from '../components/skeletons/IdeaCardSkeleton'
import { EmptyState } from '../components/EmptyState'
import { ConfirmDialog, type ConfirmDialogRef } from '../components/ConfirmDialog'

/**
 * Lightbulb icon for empty ideas state.
 */
function LightbulbIcon() {
  return (
    <svg
      className="w-full h-full"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  )
}

/**
 * Search icon for filtered empty state.
 */
function SearchIcon() {
  return (
    <svg
      className="w-full h-full"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  )
}

/**
 * Custom hook to debounce a value.
 * Used for search input to avoid filtering on every keystroke.
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

/**
 * Ideas page with filtering and list display.
 * REQ-IDX-002: Shows all ideas in chronological order.
 * REQ-IDX-006: Search by note or video title.
 * REQ-IDX-007: Filter by channel.
 * REQ-IDX-008: Filter to show only current user's ideas.
 */
export function IdeasPage() {
  const { ideas, isLoading, error, deleteIdea } = useIdeas()

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [channelFilter, setChannelFilter] = useState('')
  const [myIdeasOnly, setMyIdeasOnly] = useState(false)

  // Delete confirmation state
  const deleteDialogRef = useRef<ConfirmDialogRef>(null)
  const [ideaToDelete, setIdeaToDelete] = useState<string | null>(null)

  // Debounce search input (300ms)
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Get current user from localStorage
  const currentUser = localStorage.getItem('youtubeTracker_userName') || ''

  // Get unique channels that have ideas (REQ-IDX-007)
  const channelsWithIdeas = useMemo(() => {
    const channelMap = new Map<string, { id: string; name: string }>()
    ideas.forEach(idea => {
      const ch = idea.video.channel
      if (!channelMap.has(ch.id)) {
        channelMap.set(ch.id, ch)
      }
    })
    return Array.from(channelMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    )
  }, [ideas])

  // Apply all filters
  const filteredIdeas = useMemo(() => {
    return ideas.filter(idea => {
      // Search filter (note and video title)
      if (debouncedSearch) {
        const search = debouncedSearch.toLowerCase()
        const matchesNote = idea.note.toLowerCase().includes(search)
        const matchesTitle = idea.video.title.toLowerCase().includes(search)
        if (!matchesNote && !matchesTitle) return false
      }

      // Channel filter
      if (channelFilter && idea.video.channel.id !== channelFilter) return false

      // My ideas filter
      if (myIdeasOnly && idea.added_by !== currentUser) return false

      return true
    })
  }, [ideas, debouncedSearch, channelFilter, myIdeasOnly, currentUser])

  // Delete flow
  const handleDeleteClick = (id: string) => {
    setIdeaToDelete(id)
    deleteDialogRef.current?.open()
  }

  const handleConfirmDelete = async () => {
    if (!ideaToDelete) return

    const result = await deleteIdea(ideaToDelete)
    if (result.success) {
      toast.success('Idea deleted')
    } else {
      toast.error(result.error || 'Failed to delete idea')
    }
    setIdeaToDelete(null)
  }

  // Get the idea being deleted for the dialog message
  const ideaBeingDeleted = ideaToDelete
    ? ideas.find(i => i.id === ideaToDelete)
    : null

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setChannelFilter('')
    setMyIdeasOnly(false)
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">Ideas</h1>
        {!isLoading && ideas.length > 0 && (
          <span className="bg-[#3f3f3f] text-[#aaaaaa] text-sm px-2 py-0.5 rounded-full">
            {filteredIdeas.length === ideas.length
              ? ideas.length
              : `${filteredIdeas.length} of ${ideas.length}`}
          </span>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-600 rounded-lg text-red-400">
          <p>Error loading ideas: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Refresh page
          </button>
        </div>
      )}

      {/* Filters Row */}
      {!isLoading && ideas.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aaaaaa]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search ideas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#272727] border border-[#3f3f3f] rounded-lg text-[#f1f1f1] placeholder-[#aaaaaa] focus:outline-none focus:border-[#4f4f4f]"
            />
          </div>

          {/* Channel Filter */}
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="px-4 py-2 bg-[#272727] border border-[#3f3f3f] rounded-lg text-[#f1f1f1] focus:outline-none focus:border-[#4f4f4f] cursor-pointer"
          >
            <option value="">All Channels</option>
            {channelsWithIdeas.map(channel => (
              <option key={channel.id} value={channel.id}>
                {channel.name}
              </option>
            ))}
          </select>

          {/* My Ideas Toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={myIdeasOnly}
              onChange={(e) => setMyIdeasOnly(e.target.checked)}
              className="w-4 h-4 rounded bg-[#272727] border-[#3f3f3f] text-red-600 focus:ring-red-600 focus:ring-offset-[#0f0f0f] cursor-pointer"
            />
            <span className="text-sm text-[#aaaaaa]">My Ideas</span>
          </label>
        </div>
      )}

      {/* Loading State - Skeleton List */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <IdeaCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Ideas List */}
      {!isLoading && !error && (
        <>
          {ideas.length === 0 ? (
            // No ideas at all
            <EmptyState
              icon={<LightbulbIcon />}
              title="No ideas saved yet"
              description="Browse channel videos and save ideas you like."
            />
          ) : filteredIdeas.length === 0 ? (
            // No results from filter
            <EmptyState
              icon={<SearchIcon />}
              title="No ideas match your filters"
              description="Try adjusting your search or filters."
              action={{
                label: "Clear filters",
                onClick: clearFilters
              }}
            />
          ) : (
            // Ideas list
            <div className="space-y-4">
              {filteredIdeas.map(idea => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Real-time indicator */}
      {!isLoading && !error && ideas.length > 0 && (
        <div className="mt-6 text-center">
          <span className="inline-flex items-center gap-2 text-xs text-[#aaaaaa]">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Real-time sync active
          </span>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        ref={deleteDialogRef}
        title="Delete Idea"
        message={ideaBeingDeleted
          ? `Are you sure you want to delete this idea for "${ideaBeingDeleted.video.title}"?`
          : 'Are you sure you want to delete this idea?'
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
