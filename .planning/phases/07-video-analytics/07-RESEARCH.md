# Phase 7: Video Analytics - Research

**Researched:** 2026-01-26
**Domain:** React sorting/filtering state, time period filtering, UI controls, session persistence
**Confidence:** HIGH

## Summary

Phase 7 adds video sorting and time period filtering to the Analytics page. Users need to sort videos by publish date or view count (ascending/descending), filter by time periods (7/30/90 days or all time), and see these selections persist during their session. The implementation builds on existing patterns from Phase 6 (video data already fetched via batch query) and IdeasPage (filtering UI patterns with select dropdowns and state management).

The standard approach uses:
1. **useState for simple sort/filter state** - Sort field, sort direction, and time period are independent primitives that don't require useReducer complexity
2. **useMemo for filtered/sorted results** - Compute filtered videos once per state change, avoid recomputation on every render
3. **date-fns for time filtering** - Already in project (v4.1.0), provides `subDays` for date arithmetic and `isAfter` for comparisons
4. **sessionStorage for persistence** - Persist sort/filter state across page navigation within session, clear on tab close
5. **Tailwind-styled select dropdowns and button groups** - Match existing IdeasPage filter UI patterns

**Primary recommendation:** Extend AnalyticsPage with SortFilterControls component using existing UI patterns from IdeasPage, compute filtered/sorted videos with useMemo, persist state to sessionStorage via custom hook.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.3.1 | useState, useMemo for state and computed values | Already used throughout app |
| date-fns | 4.1.0 | `subDays`, `isAfter` for time period filtering | Already in project for formatRelativeDate |
| Tailwind CSS | 4.0.0 | Styling sort/filter controls | Consistent with app design |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-router | 7.0.0 | URL params (optional alternative to sessionStorage) | If sharing filter state via URL is needed |

### No New Dependencies Needed

All functionality is achievable with existing stack. sessionStorage is a browser API, no package needed.

**Installation:**
```bash
# No installation needed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── pages/
│   └── AnalyticsPage.tsx           # MODIFY - Add sort/filter state and UI
├── components/
│   ├── SortFilterControls.tsx      # NEW - Sort dropdown + time filter buttons
│   └── FilteredVideoGrid.tsx       # NEW - Grid that accepts sorted/filtered videos
├── hooks/
│   └── useSessionState.ts          # NEW - useState synced to sessionStorage
└── lib/
    └── formatters.ts               # EXISTING - Reuse formatViewCount, formatRelativeDate
```

### Pattern 1: Sort/Filter State with useState

**What:** Use separate useState calls for sort field, sort direction, and time period
**When to use:** When state values are independent primitives, not complex objects
**Example:**
```typescript
// Source: React documentation and IdeasPage.tsx pattern
type SortField = 'published_at' | 'view_count'
type SortDirection = 'asc' | 'desc'
type TimePeriod = '7d' | '30d' | '90d' | 'all'

export function AnalyticsPage() {
  // Individual state for each filter dimension
  const [sortField, setSortField] = useState<SortField>('published_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d')

  // ... use in useMemo for filtering/sorting
}
```

### Pattern 2: Computed Filtered/Sorted Videos with useMemo

**What:** Derive filtered and sorted video array from source videos and filter state
**When to use:** When computation involves filtering and sorting arrays that may be large
**Example:**
```typescript
// Source: IdeasPage.tsx filteredIdeas pattern + MDN Array.sort/filter
import { subDays, isAfter } from 'date-fns'

const filteredAndSortedVideos = useMemo(() => {
  const now = new Date()

  // Step 1: Filter by time period
  let filtered = videos
  if (timePeriod !== 'all') {
    const daysMap = { '7d': 7, '30d': 30, '90d': 90 }
    const cutoffDate = subDays(now, daysMap[timePeriod])
    filtered = videos.filter(v => isAfter(new Date(v.published_at), cutoffDate))
  }

  // Step 2: Sort (create copy to avoid mutation)
  const sorted = [...filtered].sort((a, b) => {
    const aVal = sortField === 'published_at'
      ? new Date(a.published_at).getTime()
      : a.view_count
    const bVal = sortField === 'published_at'
      ? new Date(b.published_at).getTime()
      : b.view_count

    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
  })

  return sorted
}, [videos, timePeriod, sortField, sortDirection])
```

### Pattern 3: Session State Persistence Hook

**What:** Custom hook that syncs React state to sessionStorage
**When to use:** When state should persist across page navigation but clear on tab close
**Example:**
```typescript
// Source: https://www.darrenlester.com/blog/syncing-react-state-and-session-storage
import { useState, useEffect } from 'react'

export function useSessionState<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  // Initialize from sessionStorage or default
  const [state, setState] = useState<T>(() => {
    const stored = sessionStorage.getItem(key)
    if (stored !== null) {
      try {
        return JSON.parse(stored) as T
      } catch {
        return defaultValue
      }
    }
    return defaultValue
  })

  // Sync to sessionStorage on change
  useEffect(() => {
    sessionStorage.setItem(key, JSON.stringify(state))
  }, [key, state])

  return [state, setState]
}

// Usage in AnalyticsPage:
const [sortField, setSortField] = useSessionState<SortField>('analytics_sortField', 'published_at')
const [sortDirection, setSortDirection] = useSessionState<SortDirection>('analytics_sortDir', 'desc')
const [timePeriod, setTimePeriod] = useSessionState<TimePeriod>('analytics_timePeriod', '30d')
```

### Pattern 4: Sort Controls UI (Dropdown + Direction Toggle)

**What:** Select dropdown for sort field with toggle button for direction
**When to use:** When users need to choose sort criteria and direction independently
**Example:**
```typescript
// Source: IdeasPage.tsx channel filter pattern + Tailwind styling
interface SortControlsProps {
  sortField: SortField
  sortDirection: SortDirection
  onSortFieldChange: (field: SortField) => void
  onSortDirectionChange: (dir: SortDirection) => void
}

export function SortControls({
  sortField,
  sortDirection,
  onSortFieldChange,
  onSortDirectionChange
}: SortControlsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Sort field dropdown */}
      <select
        value={sortField}
        onChange={(e) => onSortFieldChange(e.target.value as SortField)}
        className="px-4 py-2 bg-[#272727] border border-[#3f3f3f] rounded-lg text-[#f1f1f1] focus:outline-none focus:border-[#4f4f4f] cursor-pointer"
      >
        <option value="published_at">Date</option>
        <option value="view_count">Views</option>
      </select>

      {/* Direction toggle button */}
      <button
        onClick={() => onSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc')}
        className="p-2 bg-[#272727] border border-[#3f3f3f] rounded-lg hover:bg-[#3f3f3f] transition-colors"
        title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
      >
        {sortDirection === 'asc' ? (
          <ArrowUpIcon className="w-4 h-4" />
        ) : (
          <ArrowDownIcon className="w-4 h-4" />
        )}
      </button>
    </div>
  )
}
```

### Pattern 5: Time Period Filter (Button Group)

**What:** Horizontal button group with time period options, active state visually indicated
**When to use:** For mutually exclusive options with small fixed set
**Example:**
```typescript
// Source: Tailwind button group pattern + existing app styling
interface TimePeriodFilterProps {
  value: TimePeriod
  onChange: (period: TimePeriod) => void
  videoCountInPeriod?: number
}

const periods: { value: TimePeriod; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: 'all', label: 'All time' },
]

export function TimePeriodFilter({ value, onChange, videoCountInPeriod }: TimePeriodFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex rounded-lg overflow-hidden border border-[#3f3f3f]">
        {periods.map((period) => (
          <button
            key={period.value}
            onClick={() => onChange(period.value)}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              value === period.value
                ? 'bg-[#3f3f3f] text-white'
                : 'bg-[#272727] text-[#aaaaaa] hover:bg-[#3f3f3f] hover:text-white'
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>
      {videoCountInPeriod !== undefined && (
        <span className="text-sm text-[#aaaaaa]">
          {videoCountInPeriod} video{videoCountInPeriod !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  )
}
```

### Anti-Patterns to Avoid

- **Mutating array in sort:** Always spread array `[...videos].sort()` before sorting. React state mutation causes bugs.
- **useReducer overkill:** For 3 independent primitives (sortField, sortDirection, timePeriod), useState is cleaner than useReducer.
- **Computing in render without useMemo:** Filter + sort on every render wastes cycles when state hasn't changed.
- **localStorage instead of sessionStorage:** Sort/filter state is temporary UI preference, not persistent user data.
- **Storing Date objects in sessionStorage:** Only strings are supported. Store ISO strings, parse when reading.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date subtraction | Manual millisecond math | date-fns `subDays` | Handles DST, leap years, edge cases |
| Date comparison | String comparison | date-fns `isAfter` | Proper Date object comparison |
| Session persistence | Manual JSON.stringify/parse | Custom useSessionState hook | Encapsulates boilerplate, type-safe |
| Dropdown styling | Custom dropdown component | Native select with Tailwind | Already works in IdeasPage, accessible |
| Button group | Separate buttons with manual logic | Mapped button array | DRY, consistent styling |

**Key insight:** IdeasPage already has filtering patterns (channel dropdown, search, my ideas toggle) that can be adapted for sort/filter controls.

## Common Pitfalls

### Pitfall 1: Array Mutation in Sort

**What goes wrong:** `videos.sort()` mutates the original array, causing React state inconsistencies
**Why it happens:** Sort returns sorted array AND mutates in place
**How to avoid:** Always spread: `[...videos].sort((a, b) => ...)`
**Warning signs:** Stale data in other components, inconsistent renders

### Pitfall 2: Time Zone Issues in Date Filtering

**What goes wrong:** Videos appear in wrong time period based on user's local timezone
**Why it happens:** Comparing UTC dates with local Date objects
**How to avoid:**
- Prior decision states "UTC for all time-based analytics"
- Use `new Date(video.published_at)` which parses UTC ISO strings correctly
- `subDays(new Date(), 7)` uses local time which is fine for "last 7 days" relative filtering
**Warning signs:** Same video shows in different periods at different times of day

### Pitfall 3: Missing Default Sort Applied to All Videos

**What goes wrong:** Videos in different channels appear interleaved randomly
**Why it happens:** No sort applied when time filter changes
**How to avoid:** Always apply sort after filter in useMemo chain
**Warning signs:** Video order changes unexpectedly when switching time periods

### Pitfall 4: sessionStorage Not Available (SSR/Incognito)

**What goes wrong:** App crashes on hydration or in private browsing
**Why it happens:** sessionStorage may throw in SSR or when storage is disabled
**How to avoid:** Wrap sessionStorage access in try/catch, fall back to useState
**Warning signs:** "sessionStorage is not defined" errors in console

### Pitfall 5: Filter Count Not Updating

**What goes wrong:** "X videos" count doesn't match visible videos
**Why it happens:** Count computed from unfiltered array, or computed at wrong time
**How to avoid:** Derive count from `filteredAndSortedVideos.length` after all filters applied
**Warning signs:** Count says "47 videos" but only 12 visible

### Pitfall 6: Sort Direction Not Visually Indicated

**What goes wrong:** User doesn't know current sort direction (SORT-05 requirement)
**Why it happens:** Button shows static icon, not current state
**How to avoid:** Toggle icon (ArrowUp/ArrowDown) based on sortDirection state
**Warning signs:** Users repeatedly click sort expecting change, nothing visible happens

## Code Examples

Verified patterns from official sources and existing codebase:

### Complete SortFilterControls Component

```typescript
// Source: IdeasPage.tsx pattern + Tailwind docs
import { SortField, SortDirection, TimePeriod } from '../lib/types'

interface SortFilterControlsProps {
  sortField: SortField
  sortDirection: SortDirection
  timePeriod: TimePeriod
  videoCount: number
  onSortFieldChange: (field: SortField) => void
  onSortDirectionChange: (dir: SortDirection) => void
  onTimePeriodChange: (period: TimePeriod) => void
}

function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  )
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export function SortFilterControls({
  sortField,
  sortDirection,
  timePeriod,
  videoCount,
  onSortFieldChange,
  onSortDirectionChange,
  onTimePeriodChange,
}: SortFilterControlsProps) {
  const periods: { value: TimePeriod; label: string }[] = [
    { value: '7d', label: '7 days' },
    { value: '30d', label: '30 days' },
    { value: '90d', label: '90 days' },
    { value: 'all', label: 'All time' },
  ]

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      {/* Sort controls */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#aaaaaa]">Sort by</span>
        <select
          value={sortField}
          onChange={(e) => onSortFieldChange(e.target.value as SortField)}
          className="px-3 py-1.5 bg-[#272727] border border-[#3f3f3f] rounded-lg text-[#f1f1f1] text-sm focus:outline-none focus:border-[#4f4f4f] cursor-pointer"
        >
          <option value="published_at">Date</option>
          <option value="view_count">Views</option>
        </select>
        <button
          onClick={() => onSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc')}
          className="p-1.5 bg-[#272727] border border-[#3f3f3f] rounded-lg hover:bg-[#3f3f3f] transition-colors"
          title={sortDirection === 'asc' ? 'Ascending (oldest/lowest first)' : 'Descending (newest/highest first)'}
        >
          {sortDirection === 'asc' ? (
            <ArrowUpIcon className="w-4 h-4" />
          ) : (
            <ArrowDownIcon className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Time period filter */}
      <div className="flex items-center gap-3">
        <div className="flex rounded-lg overflow-hidden border border-[#3f3f3f]">
          {periods.map((period) => (
            <button
              key={period.value}
              onClick={() => onTimePeriodChange(period.value)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                timePeriod === period.value
                  ? 'bg-[#3f3f3f] text-white'
                  : 'bg-[#272727] text-[#aaaaaa] hover:bg-[#3f3f3f] hover:text-white'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
        <span className="text-sm text-[#aaaaaa]">
          {videoCount} video{videoCount !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}
```

### useSessionState Hook

```typescript
// Source: https://www.darrenlester.com/blog/syncing-react-state-and-session-storage
import { useState, useEffect } from 'react'

export function useSessionState<T>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    // SSR-safe check
    if (typeof window === 'undefined') return defaultValue

    try {
      const stored = sessionStorage.getItem(key)
      return stored !== null ? (JSON.parse(stored) as T) : defaultValue
    } catch {
      return defaultValue
    }
  })

  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(state))
    } catch {
      // Storage full or unavailable - fail silently
    }
  }, [key, state])

  return [state, setState]
}
```

### Time Period Filtering with date-fns

```typescript
// Source: https://date-fns.org/docs/subDays + https://date-fns.org/docs/isAfter
import { subDays, isAfter } from 'date-fns'

type TimePeriod = '7d' | '30d' | '90d' | 'all'

function filterByTimePeriod(videos: Video[], timePeriod: TimePeriod): Video[] {
  if (timePeriod === 'all') return videos

  const daysMap: Record<Exclude<TimePeriod, 'all'>, number> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
  }

  const cutoffDate = subDays(new Date(), daysMap[timePeriod])

  return videos.filter(video =>
    isAfter(new Date(video.published_at), cutoffDate)
  )
}
```

### Array Sorting (Non-Mutating)

```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
type SortField = 'published_at' | 'view_count'
type SortDirection = 'asc' | 'desc'

function sortVideos(
  videos: Video[],
  field: SortField,
  direction: SortDirection
): Video[] {
  // IMPORTANT: Spread to avoid mutating original array
  return [...videos].sort((a, b) => {
    let comparison: number

    if (field === 'published_at') {
      comparison = new Date(a.published_at).getTime() - new Date(b.published_at).getTime()
    } else {
      comparison = a.view_count - b.view_count
    }

    return direction === 'asc' ? comparison : -comparison
  })
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| useReducer for all state | useState for simple, useReducer for complex | React Hooks matured 2020+ | Simpler code for simple cases |
| localStorage for preferences | sessionStorage for session-scoped state | Always distinct, often misused | Correct semantics: preferences vs UI state |
| Custom date math | date-fns utility functions | date-fns v2+ (2019) | Immutable, tree-shakeable, handles edge cases |
| Moment.js | date-fns or native Intl | Moment deprecated 2020 | Smaller bundle, modern API |

**Deprecated/outdated:**
- **Moment.js**: Deprecated in favor of date-fns, Luxon, or native APIs. Project already uses date-fns.
- **useReducer everywhere**: React docs now recommend useState for simple independent state values.
- **Class component state**: Hooks are the standard pattern since React 16.8 (2019).

## Open Questions

Things that couldn't be fully resolved:

1. **Should sort/filter apply to Channel Overview cards or just a video list?**
   - What we know: Requirements mention "videos" but Phase 6 shows channel cards
   - What's unclear: Is there a video list view in analytics, or just channel overview?
   - Recommendation: Add a "Videos" section below Channel Overview that shows aggregated videos from all channels, with sort/filter applied there

2. **Default sort for "All time" period with many videos?**
   - What we know: Users may have hundreds of videos across channels
   - What's unclear: Should we paginate or limit the "all time" view?
   - Recommendation: Keep all videos for now, add pagination if performance becomes an issue (defer to future phase)

3. **Should URL params be used instead of sessionStorage?**
   - What we know: URL params allow sharing filter state, sessionStorage doesn't
   - What's unclear: Is sharing analytics filter state a use case?
   - Recommendation: Use sessionStorage for v1.1 (simpler), add URL params in future if sharing needed

## Sources

### Primary (HIGH confidence)
- **Existing codebase** - IdeasPage.tsx (filtering patterns, useMemo, select dropdown styling)
- **React documentation** - useState vs useReducer guidance: https://react.dev/learn/extracting-state-logic-into-a-reducer
- **MDN Array.sort()** - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
- **date-fns documentation** - subDays, isAfter functions (already in project)

### Secondary (MEDIUM confidence)
- **Session storage patterns** - https://www.darrenlester.com/blog/syncing-react-state-and-session-storage
- **useState vs useReducer comparison** - https://react.wiki/hooks/use-reducer-vs-use-state/
- **React state management 2026** - https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns

### Tertiary (LOW confidence)
- **Tailwind button group examples** - Community patterns, verified against project styling

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new dependencies, all patterns exist in codebase
- Architecture: HIGH - Direct extension of existing IdeasPage filtering patterns
- Pitfalls: HIGH - Array mutation and time zone issues are well-documented JavaScript gotchas

**Research date:** 2026-01-26
**Valid until:** 2026-02-26 (30 days - stable patterns, no external dependency changes)

---

## Implementation Recommendations

Based on research, these are my recommendations for implementing Phase 7:

### State Management

**Recommendation:** Use three separate `useState` (or `useSessionState` for persistence) calls:
- `sortField: 'published_at' | 'view_count'` (default: 'published_at')
- `sortDirection: 'asc' | 'desc'` (default: 'desc' for "most recent first")
- `timePeriod: '7d' | '30d' | '90d' | 'all'` (default: '30d' per TIME-02)

Rationale: These are independent primitive values, not complex related state. useState is cleaner than useReducer.

### UI Layout

**Recommendation:** Add sort/filter controls bar between "Channel Overview" section and a new "Videos" section:
```
Analytics
├── Channel Overview (Phase 6 - existing)
│   └── Grid of ChannelOverviewCards
├── [NEW] Sort & Filter Controls
│   ├── Sort: [Date v] [↓]
│   └── Time: [7d] [30d] [90d] [All] • "47 videos"
└── [NEW] Videos Section
    └── Grid of VideoCards (filtered & sorted)
```

Rationale: Keeps channel overview visible while adding video browsing with filters.

### Session Persistence

**Recommendation:** Create `useSessionState` hook that wraps useState with sessionStorage sync. Use storage keys prefixed with `analytics_` to avoid collisions.

Rationale: Meets SORT-04 requirement (persist during session), clears appropriately on tab close.

### Time Period Default

**Recommendation:** Default to `30d` per requirement TIME-02. This is most useful for spotting recent trends without overwhelming with old data.

### Visual Indicators

**Recommendation:**
- Sort direction: Arrow icon that toggles between up/down (SORT-05)
- Time period: Button group with active button highlighted (TIME-04)
- Video count: Badge showing "X videos" after time filter buttons (TIME-05)
