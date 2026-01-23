# Phase 3: Ideas System - Research

**Researched:** 2026-01-24
**Domain:** Supabase CRUD, Real-time subscriptions, React modals, Client-side filtering
**Confidence:** HIGH

## Summary

This phase implements a complete ideas management system for saving, viewing, filtering, and deleting video ideas. The core technology stack is already established (Supabase, React, Tailwind, Sonner) with existing patterns for real-time subscriptions (useChannels), database operations (lib/channels.ts), and native dialog modals (ConfirmDialog.tsx).

The implementation follows the established codebase patterns: create an `ideas` table with foreign key to `videos`, a `lib/ideas.ts` for CRUD operations, a `useIdeas` hook for state and real-time sync, and a `SaveIdeaModal` using the native dialog element. The Ideas page will use client-side filtering with a debounced search box and native select dropdowns for channel filtering.

**Primary recommendation:** Follow the useChannels pattern exactly for the useIdeas hook, including real-time subscriptions with postgres_changes. Use native HTML dialog for the save modal (matching ConfirmDialog pattern). Use native select element for the channel filter dropdown.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | ^2.91.0 | Database CRUD & real-time | Already in project, provides postgres_changes subscriptions |
| react | ^18.3.1 | UI framework | Project standard |
| sonner | ^1.7.0 | Toast notifications | Already configured with Toaster in App.tsx |
| date-fns | ^4.1.0 | Date formatting | Already used in formatters.ts |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Native HTML dialog | N/A | Modal dialogs | ConfirmDialog pattern established |
| Native HTML select | N/A | Filter dropdowns | Simple filtering needs |
| Native HTML input | N/A | Search box | Client-side text filtering |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native dialog | react-modal, @radix-ui/dialog | Native already works well, no extra dependency |
| Native select | React Select | Overkill for simple channel list, adds bundle size |
| Custom debounce | lodash.debounce | Custom hook is ~10 lines, avoids lodash dependency |

**Installation:**
```bash
# No new packages needed - all dependencies already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── ideas.ts           # CRUD operations (fetchIdeas, addIdea, deleteIdea)
│   └── types.ts           # Add Idea, IdeaInsert, IdeaWithVideo types
├── hooks/
│   └── useIdeas.ts        # State + real-time subscription hook
├── components/
│   ├── SaveIdeaModal.tsx  # Native dialog for saving ideas
│   ├── IdeaCard.tsx       # Display single idea with video info
│   └── IdeaList.tsx       # List of ideas with filtering
└── pages/
    └── IdeasPage.tsx      # Main ideas page (update existing)
```

### Pattern 1: Database Layer with Types
**What:** Separate lib file for CRUD operations with typed results
**When to use:** All database operations
**Example:**
```typescript
// Source: Existing lib/channels.ts pattern
import { supabase } from './supabase'
import type { Idea, IdeaInsert, IdeaWithVideo, DbResult } from './types'

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
    return { data: null, error: error.message }
  }
  return { data: data as IdeaWithVideo[], error: null }
}

export async function addIdea(idea: IdeaInsert): Promise<DbResult<Idea>> {
  const { data, error } = await supabase
    .from('ideas')
    .insert(idea)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }
  return { data: data as Idea, error: null }
}

export async function deleteIdea(id: string): Promise<DbResult<null>> {
  const { error } = await supabase
    .from('ideas')
    .delete()
    .eq('id', id)

  if (error) {
    return { data: null, error: error.message }
  }
  return { data: null, error: null }
}
```

### Pattern 2: Real-time Hook with Toast Notifications
**What:** Hook that manages state and subscribes to real-time changes
**When to use:** Ideas list with collaborative real-time updates
**Example:**
```typescript
// Source: Existing hooks/useChannels.ts pattern + REQ-IDX-005
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { supabase } from '../lib/supabase'
import { fetchIdeas, addIdea, deleteIdea } from '../lib/ideas'
import type { IdeaWithVideo, IdeaInsert } from '../lib/types'

export function useIdeas() {
  const [ideas, setIdeas] = useState<IdeaWithVideo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadIdeas = useCallback(async () => {
    setIsLoading(true)
    const result = await fetchIdeas()
    if (result.error) {
      setError(result.error)
    } else {
      setIdeas(result.data || [])
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadIdeas()

    // Real-time subscription
    const channelName = `ideas-realtime-${Date.now()}`
    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ideas' },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // Refetch to get joined video data
            const result = await fetchIdeas()
            if (!result.error && result.data) {
              setIdeas(result.data)
              // Toast for teammate's new idea (REQ-IDX-005)
              const newIdea = result.data.find(i => i.id === payload.new.id)
              if (newIdea) {
                toast.info(`New idea added by ${newIdea.added_by || 'teammate'}`)
              }
            }
          } else if (payload.eventType === 'DELETE') {
            setIdeas((prev) => prev.filter((i) => i.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [loadIdeas])

  // ... handleAddIdea, handleDeleteIdea methods
  return { ideas, isLoading, error, addIdea: handleAddIdea, deleteIdea: handleDeleteIdea }
}
```

### Pattern 3: Native Dialog Modal with Form
**What:** Modal using native dialog element with form submission
**When to use:** Save idea modal with note input
**Example:**
```typescript
// Source: Existing components/ConfirmDialog.tsx pattern
import { useRef, useImperativeHandle, forwardRef, useState } from 'react'
import type { Video } from '../lib/types'

export interface SaveIdeaModalRef {
  open: (video: Video) => void
  close: () => void
}

interface SaveIdeaModalProps {
  onSave: (videoId: string, note: string, addedBy: string) => Promise<{ success: boolean; error?: string }>
}

export const SaveIdeaModal = forwardRef<SaveIdeaModalRef, SaveIdeaModalProps>(
  function SaveIdeaModal({ onSave }, ref) {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const [video, setVideo] = useState<Video | null>(null)
    const [note, setNote] = useState('')
    const [addedBy, setAddedBy] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useImperativeHandle(ref, () => ({
      open: (v: Video) => {
        setVideo(v)
        setNote('')
        dialogRef.current?.showModal()
      },
      close: () => dialogRef.current?.close(),
    }))

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!video || note.length < 10) return

      setIsSubmitting(true)
      const result = await onSave(video.id, note, addedBy)
      setIsSubmitting(false)

      if (result.success) {
        dialogRef.current?.close()
      }
    }

    return (
      <dialog ref={dialogRef} className="...">
        {video && (
          <form onSubmit={handleSubmit}>
            {/* Video thumbnail and title (read-only) */}
            {/* Note textarea (min 10 chars) */}
            {/* Added by input */}
            {/* Cancel/Save buttons */}
          </form>
        )}
      </dialog>
    )
  }
)
```

### Pattern 4: Client-side Filtering with Debounce
**What:** Filter ideas by search text, channel, and user
**When to use:** Ideas page filtering (REQ-IDX-006, REQ-IDX-007, REQ-IDX-008)
**Example:**
```typescript
// Custom debounce hook (no external dependency needed)
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

// In IdeasPage
const [searchQuery, setSearchQuery] = useState('')
const [channelFilter, setChannelFilter] = useState('')
const [myIdeasOnly, setMyIdeasOnly] = useState(false)

const debouncedSearch = useDebounce(searchQuery, 300)

const filteredIdeas = useMemo(() => {
  return ideas.filter(idea => {
    // Search filter (note text and video title)
    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase()
      const matchesNote = idea.note.toLowerCase().includes(search)
      const matchesTitle = idea.video.title.toLowerCase().includes(search)
      if (!matchesNote && !matchesTitle) return false
    }

    // Channel filter
    if (channelFilter && idea.video.channel.id !== channelFilter) {
      return false
    }

    // My ideas filter (using localStorage username for v1)
    if (myIdeasOnly && idea.added_by !== currentUser) {
      return false
    }

    return true
  })
}, [ideas, debouncedSearch, channelFilter, myIdeasOnly, currentUser])
```

### Anti-Patterns to Avoid
- **Fetching video data separately:** Don't make separate API calls for video/channel info - use Supabase nested select
- **Server-side filtering for small datasets:** Client-side filtering is appropriate for ideas list (likely < 1000 items)
- **Using state for derived data:** Filter results should be computed via useMemo, not stored in state
- **Not debouncing search input:** Without debounce, every keystroke triggers expensive filtering

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal dialog | Custom div with overlay | Native `<dialog>` element | Focus trap, Escape key, aria roles built-in |
| Toast notifications | Custom notification system | sonner (already installed) | Animation, stacking, auto-dismiss handled |
| Real-time sync | Polling or WebSocket from scratch | Supabase postgres_changes | Already integrated, handles reconnection |
| Date formatting | Manual date string manipulation | date-fns formatDistanceToNow | Already used in formatters.ts |
| Debounce | setTimeout management | Custom 10-line hook | Simple enough to not need lodash |

**Key insight:** The project already has established patterns for all major functionality. Following existing patterns ensures consistency and reduces bugs.

## Common Pitfalls

### Pitfall 1: Real-time INSERT not having joined data
**What goes wrong:** postgres_changes payload only contains the inserted row, not joined video/channel data
**Why it happens:** Supabase real-time sends raw row data, not query results
**How to avoid:** On INSERT event, refetch the full ideas list to get joined data
**Warning signs:** Idea card shows undefined video title/thumbnail

### Pitfall 2: Stale closure in real-time callback
**What goes wrong:** Real-time handler uses stale state values
**Why it happens:** JavaScript closure captures state at subscription time
**How to avoid:** Use functional setState `setIdeas(prev => [...])` or refetch entirely
**Warning signs:** UI not updating, duplicate entries appearing

### Pitfall 3: Note validation not matching server
**What goes wrong:** Client allows < 10 char notes but server rejects
**Why it happens:** Validation only on client or only on server
**How to avoid:** Add CHECK constraint in migration AND validate in form before submit
**Warning signs:** Form submits but toast.error appears

### Pitfall 4: Channel filter dropdown not showing all channels
**What goes wrong:** Dropdown only shows channels that have ideas, but should show all tracked channels
**Why it happens:** Filtering channels by those with saved ideas
**How to avoid:** REQ-IDX-007 specifies "channels with saved ideas" - this is correct behavior
**Warning signs:** N/A - just follow the requirement

### Pitfall 5: My Ideas toggle without persistent identity
**What goes wrong:** No way to identify "my" ideas without authentication
**Why it happens:** v1 has no auth
**How to avoid:** Use localStorage for added_by name, make it a required field in save modal
**Warning signs:** Toggle does nothing, or matches random entries

### Pitfall 6: Real-time channel name collision
**What goes wrong:** Multiple subscriptions on same channel cause issues
**Why it happens:** Using static channel name
**How to avoid:** Use unique channel name with timestamp: `ideas-realtime-${Date.now()}`
**Warning signs:** Console warning about duplicate subscriptions

## Code Examples

Verified patterns from official sources:

### Supabase Nested Select (Foreign Key Join)
```typescript
// Source: https://supabase.com/docs/guides/database/joins-and-nesting
const { data, error } = await supabase
  .from('ideas')
  .select(`
    id,
    note,
    added_by,
    created_at,
    video:video_id (
      id,
      youtube_id,
      title,
      thumbnail_url,
      channel:channel_id (
        id,
        name
      )
    )
  `)
  .order('created_at', { ascending: false })
```

### Toast with Info Type for Teammate Actions
```typescript
// Source: sonner documentation + REQ-IDX-005
import { toast } from 'sonner'

// When real-time detects teammate's new idea
toast.info(`New idea added by ${addedBy}`)

// Success on save
toast.success('Idea saved!')

// Error handling
toast.error(error || 'Failed to save idea')
```

### Migration with Foreign Key and Check Constraint
```sql
-- Source: Existing migration patterns + REQ-DM-003
CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  added_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure note has minimum length
  CONSTRAINT ideas_note_min_length CHECK (char_length(note) >= 10)
);

-- Index for filtering by added_by (My Ideas toggle)
CREATE INDEX IF NOT EXISTS ideas_added_by_idx ON ideas(added_by);

-- Index for chronological listing
CREATE INDEX IF NOT EXISTS ideas_created_at_idx ON ideas(created_at DESC);
```

### Native Select for Channel Filter
```typescript
// Source: Project standards + HTML5
const channelsWithIdeas = useMemo(() => {
  const channelIds = new Set(ideas.map(i => i.video.channel.id))
  return Array.from(channelIds).map(id => {
    const idea = ideas.find(i => i.video.channel.id === id)
    return idea?.video.channel
  }).filter(Boolean)
}, [ideas])

<select
  value={channelFilter}
  onChange={(e) => setChannelFilter(e.target.value)}
  className="bg-[#272727] text-white rounded-lg px-3 py-2"
>
  <option value="">All Channels</option>
  {channelsWithIdeas.map(channel => (
    <option key={channel.id} value={channel.id}>{channel.name}</option>
  ))}
</select>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| React portals for modals | Native `<dialog>` element | 2022+ (wide browser support) | Better accessibility, simpler code |
| Context API for realtime | Supabase client subscription | Built-in to @supabase/supabase-js | Direct subscription in hooks |
| lodash debounce | Custom useDebounce hook | React hooks pattern | Fewer dependencies |
| Separate API calls for joins | Nested select in Supabase | Always available | Single query, automatic typing |

**Deprecated/outdated:**
- createPortal for modals: Native dialog is simpler and more accessible
- Polling for updates: Real-time subscriptions are more efficient

## Open Questions

Things that couldn't be fully resolved:

1. **added_by identity persistence**
   - What we know: No auth in v1, need to identify user for "My Ideas" filter
   - What's unclear: Should username be stored in localStorage and pre-filled, or always required?
   - Recommendation: Store in localStorage after first save, pre-fill in subsequent saves

2. **Real-time performance at scale**
   - What we know: Supabase recommends Broadcast over postgres_changes for scale
   - What's unclear: At what scale does this become an issue?
   - Recommendation: postgres_changes is fine for team use (< 10 users). Monitor and switch if needed.

3. **ON DELETE CASCADE chain**
   - What we know: videos CASCADE from channels, ideas CASCADE from videos
   - What's unclear: When deleting a channel, do ideas cascade correctly through videos?
   - Recommendation: Test this explicitly - delete channel should delete all its ideas

## Sources

### Primary (HIGH confidence)
- Existing codebase: `hooks/useChannels.ts`, `components/ConfirmDialog.tsx`, `lib/channels.ts`
- [Supabase Joins Documentation](https://supabase.com/docs/guides/database/joins-and-nesting)
- [Supabase Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes)
- [Sonner Documentation](https://sonner.emilkowal.ski/)

### Secondary (MEDIUM confidence)
- [Supabase Real-time Feature Overview](https://supabase.com/features/realtime-postgres-changes)
- [Native Dialog Element Best Practices](https://blog.croct.com/post/best-react-modal-dialog-libraries)
- [React Debounce Patterns](https://dev.to/goswamitushar/debounced-search-with-client-side-filtering-a-lightweight-optimization-for-large-lists-2mn2)

### Tertiary (LOW confidence)
- General web search for 2026 best practices (patterns confirmed with official docs)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use in project
- Architecture: HIGH - Follows established patterns from existing codebase
- Pitfalls: HIGH - Derived from Supabase documentation and common React patterns

**Research date:** 2026-01-24
**Valid until:** 30 days (stable patterns, established stack)
