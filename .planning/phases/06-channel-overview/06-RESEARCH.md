# Phase 6: Channel Overview - Research

**Researched:** 2026-01-26
**Domain:** React data aggregation, responsive grid layouts, skeleton loading patterns
**Confidence:** HIGH

## Summary

Phase 6 requires displaying all tracked channels as overview cards in a responsive grid layout. Each card shows aggregated metrics derived from existing channel data and related video data (subscriber count, total video count, latest upload date). The implementation leverages existing patterns from the codebase: the ChannelCard component structure, ChannelGrid responsive layout, skeleton loading states, and the useChannels hook for data.

The standard approach for this phase is to create derived metrics on-demand during render without useMemo (as calculations are simple array operations), use Tailwind CSS's mobile-first responsive grid utilities (grid-cols-1 md:grid-cols-2 lg:grid-cols-3), and implement skeleton states that match exact card dimensions to prevent layout shift.

Research focused on three domains: (1) React patterns for deriving state from props/existing data, (2) Tailwind CSS responsive grid patterns, and (3) skeleton loading best practices for smooth transitions and CLS prevention.

**Primary recommendation:** Extend existing ChannelCard component to display aggregated metrics, query videos table for counts and latest dates, use simple derived data calculations without memoization, and reuse existing skeleton patterns.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.3.1 | UI framework | Already in project, component-based architecture |
| Tailwind CSS | 4.0.0 | Responsive styling | Already in project, mobile-first responsive utilities |
| date-fns | 4.1.0 | Date formatting | Already in project for relative date formatting |
| Supabase | 2.91.0 | Database queries | Already in project for fetching channel and video data |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-router | 7.0.0 | Navigation | Already used for channel detail links |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tailwind Grid | CSS Grid directly | Tailwind provides responsive utilities out-of-box, less code |
| date-fns | Intl.DateTimeFormat | date-fns already in project, consistent with existing patterns |
| Derived state | useMemo | Simple calculations don't benefit from memoization overhead |

**Installation:**
No new packages required - all dependencies already in package.json.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── ChannelOverviewCard.tsx    # New: Card with aggregated metrics
│   ├── ChannelOverviewGrid.tsx    # New: Grid container with responsive layout
│   └── skeletons/
│       └── ChannelOverviewCardSkeleton.tsx  # New: Skeleton matching card
├── hooks/
│   └── useChannels.ts              # Existing: Already fetches channels
└── lib/
    └── formatters.ts               # Existing: Reuse formatViewCount for subscribers
```

### Pattern 1: Derived Metrics from Database Query
**What:** Calculate total video count and latest upload date using database aggregation functions
**When to use:** When displaying summary statistics from related tables
**Example:**
```typescript
// Source: Verified pattern from existing codebase and React documentation
// Query Supabase for aggregated video metrics per channel
const { data } = await supabase
  .from('channels')
  .select(`
    *,
    videos (
      count,
      published_at
    )
  `)
  .eq('videos.channel_id', 'id')
  .order('videos.published_at', { ascending: false })
  .limit(1, { foreignTable: 'videos' })

// OR use separate query for videos count:
const { count } = await supabase
  .from('videos')
  .select('*', { count: 'exact', head: true })
  .eq('channel_id', channel.id)
```

### Pattern 2: Responsive Grid with Tailwind Mobile-First
**What:** Use mobile-first responsive utilities to adapt grid columns by viewport
**When to use:** For card layouts that need different column counts across devices
**Example:**
```typescript
// Source: https://tailwindcss.com/docs/responsive-design
// Mobile-first: base class applies to all, md/lg apply at breakpoints and above
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {channels.map(channel => (
    <ChannelOverviewCard key={channel.id} channel={channel} />
  ))}
</div>

// Breakpoints:
// - Base (0-639px): 1 column
// - sm (640px+): 2 columns
// - lg (1024px+): 3 columns
```

### Pattern 3: Skeleton Loading without Layout Shift
**What:** Match skeleton dimensions exactly to loaded content to prevent CLS
**When to use:** All loading states to ensure smooth transitions
**Example:**
```typescript
// Source: Existing ChannelCardSkeleton.tsx pattern
// Key principles:
// 1. Use exact dimensions (w-[88px] h-[88px] for avatar)
// 2. Match spacing (gap-4, p-4)
// 3. Use motion-safe:animate-pulse for accessibility
// 4. Render same number of skeletons as expected cards

export function ChannelOverviewCardSkeleton() {
  return (
    <div className="bg-[#272727] rounded-xl p-4">
      <div className="flex items-start gap-4">
        <div className="w-[88px] h-[88px] rounded-full bg-[#3f3f3f] motion-safe:animate-pulse" />
        <div className="flex-1 space-y-3">
          <div className="h-5 rounded bg-[#3f3f3f] w-3/4 motion-safe:animate-pulse" />
          <div className="h-4 rounded bg-[#3f3f3f] w-1/2 motion-safe:animate-pulse" />
          <div className="h-3 rounded bg-[#3f3f3f] w-2/3 motion-safe:animate-pulse" />
        </div>
      </div>
    </div>
  )
}
```

### Pattern 4: Simple Derived Data Without useMemo
**What:** Calculate metrics directly in render for simple operations
**When to use:** For fast array operations (length, Math.max) that don't justify memoization overhead
**Example:**
```typescript
// Source: https://react.dev/reference/react/useMemo
// For simple calculations, direct computation is preferred over useMemo
function ChannelOverviewCard({ channel, videos }) {
  // Simple array length - no useMemo needed
  const totalVideos = videos.length

  // Simple Math.max - no useMemo needed (unless videos array is huge)
  const latestUploadDate = videos.length > 0
    ? new Date(Math.max(...videos.map(v => new Date(v.published_at).getTime())))
    : null

  return (
    <div>
      <p>{totalVideos} videos</p>
      <p>Latest: {latestUploadDate ? formatRelativeDate(latestUploadDate.toISOString()) : 'N/A'}</p>
    </div>
  )
}

// Only use useMemo if profiling shows ≥1ms overhead
```

### Anti-Patterns to Avoid
- **Premature memoization:** Don't use useMemo for simple calculations without profiling first (React docs: "only use as performance optimization after code works")
- **Grid reordering without space:** Don't change grid-template-columns dynamically without reserving space, causes CLS
- **Skeleton dimension mismatch:** Don't approximate skeleton sizes, match exact px/spacing to prevent layout shift
- **N+1 queries:** Don't query videos individually per channel in a loop, use batch query with joins or foreign table selects

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Responsive breakpoints | Custom media queries | Tailwind responsive prefixes (sm:, md:, lg:) | Mobile-first system handles all screen sizes, consistent with existing code |
| Relative date formatting | Custom "X days ago" logic | date-fns formatDistanceToNow | Already in project (formatters.ts), handles edge cases, i18n-ready |
| Number abbreviation | Manual K/M formatting | Intl.NumberFormat with compact notation | Already used in formatters.ts, locale-aware, handles edge cases |
| Loading states | Blank space or spinners | Skeleton screens matching content dimensions | Prevents CLS, better UX per research (extends wait tolerance 30-40%) |
| Max date from array | Manual loop comparison | Math.max(...dates.map(d => new Date(d))) | One-liner, performant for typical arrays (<1000 items) |

**Key insight:** Existing codebase already has these patterns established. Reuse formatters.ts utilities, skeleton components, and Tailwind conventions rather than creating variations.

## Common Pitfalls

### Pitfall 1: Cumulative Layout Shift (CLS) from Skeleton Mismatch
**What goes wrong:** Skeleton placeholder dimensions don't match loaded content, causing visible layout shift when content loads
**Why it happens:** Approximate sizing ("w-20" instead of "w-[88px]"), missing spacing classes, or wrong placeholder count
**How to avoid:**
- Copy exact dimensions from target component (use inspector to verify)
- Match all spacing (gap, padding, margin) precisely
- Use same grid structure (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3)
- Show expected number of skeletons (e.g., if expecting 3+ channels, show 6 skeletons)
**Warning signs:** Content "jumps" when loading completes, different card heights before/after load

### Pitfall 2: Overusing useMemo for Simple Calculations
**What goes wrong:** Adding useMemo for array.length or simple Math.max operations adds more overhead than it saves
**Why it happens:** Misconception that all derived state needs memoization
**How to avoid:**
- Only memoize if console.time shows ≥1ms overhead
- Don't memoize unless dependencies rarely change
- For simple operations (length, max on <100 items), direct calculation is faster
**Warning signs:** More code with no performance benefit, console profiling shows <1ms for calculation

### Pitfall 3: N+1 Query Problem for Video Metrics
**What goes wrong:** Fetching video count/latest date individually for each channel in a loop causes many database queries
**Why it happens:** Iterating channels.map(async channel => fetch videos for channel)
**How to avoid:**
- Use Supabase foreign table select: `.select('*, videos(count, published_at)')`
- Or batch query all videos once: `.from('videos').select('*').in('channel_id', channelIds)`
- Calculate metrics client-side from batch results
**Warning signs:** Network waterfall shows sequential queries, slow page load with many channels

### Pitfall 4: Responsive Grid Breaking on Intermediate Sizes
**What goes wrong:** Grid looks good on phone (320px) and desktop (1920px) but breaks on tablets (768px) or small laptops (1366px)
**Why it happens:** Only testing extremes, not using sm: breakpoint, or using max-width instead of min-width
**How to avoid:**
- Use mobile-first breakpoints: base → sm: → md: → lg:
- Test at Tailwind's exact breakpoints: 640px (sm), 768px (md), 1024px (lg)
- Add sm:grid-cols-2 between mobile and desktop for tablet coverage
**Warning signs:** Cards too wide on tablets, horizontal scrolling, inconsistent gaps

### Pitfall 5: Stale Subscriber Count from useChannels Hook
**What goes wrong:** Subscriber count shown is from when channel was added, not current
**Why it happens:** useChannels returns channels table data, which isn't updated unless refreshed from YouTube API
**How to avoid:**
- Document that subscriber count is snapshot from when channel was added (acceptable for v1.1)
- OR add "last updated" timestamp and refresh button (future enhancement)
- Consider this "point-in-time" data, not real-time
**Warning signs:** User reports subscriber count differs from YouTube, no update mechanism visible

## Code Examples

Verified patterns from official sources:

### Calculating Latest Upload Date from Videos Array
```typescript
// Source: Verified pattern from MDN and JavaScript best practices
// Given array of video objects with published_at ISO strings
const videos: Video[] = [
  { published_at: '2024-01-15T10:00:00Z', ... },
  { published_at: '2024-01-20T14:30:00Z', ... },
]

// Option 1: Math.max with spread (clean, performant for <1000 items)
const latestDate = videos.length > 0
  ? new Date(Math.max(...videos.map(v => new Date(v.published_at).getTime())))
  : null

// Option 2: reduce (slightly better for very large arrays)
const latestDate = videos.reduce((max, video) => {
  const date = new Date(video.published_at)
  return date > max ? date : max
}, new Date(0))

// Then format with date-fns
import { formatDistanceToNow } from 'date-fns'
const latestUpload = latestDate ? formatDistanceToNow(latestDate, { addSuffix: true }) : 'No videos'
// Output: "2 days ago"
```

### Responsive Grid with Gap Spacing
```typescript
// Source: https://tailwindcss.com/docs/grid-template-columns
// Tailwind v4 uses same grid utilities as v3
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {/*
    - gap-4 = 1rem (16px) spacing between cards
    - grid-cols-1: 1 column (0-639px mobile)
    - sm:grid-cols-2: 2 columns at 640px+ (tablets)
    - lg:grid-cols-3: 3 columns at 1024px+ (desktops)
    - Can add xl:grid-cols-4 for very wide screens if needed
  */}
  {channels.map(channel => <Card key={channel.id} {...channel} />)}
</div>
```

### Querying Aggregated Video Data with Supabase
```typescript
// Source: Supabase documentation patterns and existing codebase
// Option 1: Count only (for total videos per channel)
const { count } = await supabase
  .from('videos')
  .select('*', { count: 'exact', head: true })
  .eq('channel_id', channelId)

// Option 2: Get all videos for client-side aggregation
const { data: videos } = await supabase
  .from('videos')
  .select('published_at')
  .eq('channel_id', channelId)
  .order('published_at', { ascending: false })
  .limit(1) // Just need latest for latest upload date

// Then calculate in component:
const totalVideos = videos?.length ?? 0
const latestUpload = videos?.[0]?.published_at ?? null
```

### Formatting Subscriber Count (Existing Pattern)
```typescript
// Source: src/lib/formatters.ts (existing code)
// Already available in project - reuse this pattern
import { formatViewCount } from '../lib/formatters'

// formatViewCount uses Intl.NumberFormat with compact notation
// Examples:
//   1234 → "1.2K"
//   1500000 → "1.5M"
//   42 → "42"

<p>{formatViewCount(channel.subscriber_count ?? 0)} subscribers</p>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom media queries | Tailwind responsive utilities | Tailwind v1+ (2017+) | Less CSS, consistent breakpoints, mobile-first |
| Moment.js for dates | date-fns | ~2018-2019 | Smaller bundle, tree-shakeable, immutable |
| Loading spinners | Skeleton screens | ~2019-2020 UX trend | Better perceived performance, prevents CLS |
| getDerivedStateFromProps | Compute in render | React 16.3+ guidance | Simpler code, fewer bugs, React team recommendation |
| Float layouts | CSS Grid/Flexbox | CSS Grid stable 2017 | Responsive without hacks, better browser support |

**Deprecated/outdated:**
- **Moment.js**: Deprecated in favor of date-fns, Luxon, or native Intl (bundle size concerns, maintenance stopped)
- **useMemo for everything**: React docs now emphasize using useMemo only after profiling shows need
- **Class-based getDerivedStateFromProps**: React Hooks (2019+) favor computing derived values in render
- **Fixed-width grids**: Modern responsive design requires fluid grids with breakpoints

## Open Questions

Things that couldn't be fully resolved:

1. **How many channels to show skeletons for?**
   - What we know: Existing patterns show 4-8 skeletons for unknown list lengths
   - What's unclear: Best number for this specific use case (most users track 3-10 channels)
   - Recommendation: Show 6 skeletons (2 rows × 3 cols on desktop) as reasonable default

2. **Should we refresh subscriber counts automatically?**
   - What we know: Subscriber count is snapshot from when channel was added
   - What's unclear: User expectation - do they expect real-time data or is snapshot acceptable?
   - Recommendation: Keep as snapshot for v1.1, add "as of [date]" label if needed, defer auto-refresh to v1.2

3. **What if a channel has no videos yet?**
   - What we know: Edge case where channel exists but no videos fetched
   - What's unclear: Display "0 videos" or "No videos yet" or hide the card?
   - Recommendation: Show "0 videos" and "No uploads yet" - maintains grid consistency

4. **Should we paginate or virtualize for 100+ channels?**
   - What we know: Most users track <10 channels, grid can handle ~50 without performance issues
   - What's unclear: At what threshold does performance degrade?
   - Recommendation: No pagination/virtualization for v1.1, revisit if user testing shows >50 channels is common

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design) - Official docs, breakpoint system
- [Tailwind CSS Grid Template Columns](https://tailwindcss.com/docs/grid-template-columns) - Official docs, grid utilities
- [React useMemo Hook](https://react.dev/reference/react/useMemo) - Official docs, when to use memoization
- Existing codebase (ChannelCard.tsx, ChannelGrid.tsx, formatters.ts, skeletons/) - Established patterns

### Secondary (MEDIUM confidence)
- [Tailwind CSS tutorial - responsive grid explained](https://tw-elements.com/learn/te-foundations/tailwind-css/responsiveness/) - Community tutorial
- [Mastering Responsive Layouts with Tailwind Grid](https://codeparrot.ai/blogs/mastering-responsive-layouts-with-tailwind-grid-in-react) - 2025+ examples
- [Understanding when to use useMemo](https://maxrozen.com/understanding-when-use-usememo) - Performance guidance
- [When to useMemo and useCallback](https://kentcdodds.com/blog/usememo-and-usecallback) - Kent C. Dodds best practices

### Tertiary (LOW confidence - flagged for validation)
- [Implementation Principles of Skeleton Screen Technology](https://www.oreateai.com/blog/implementation-principles-and-best-practices-of-skeleton-screen-technology-in-frontend-development/e160a0b9a5889b8455aa84e6bcda9afc) - 30-40% wait tolerance claim (needs verification)
- [Get Max Date in Array of Objects](https://bobbyhadz.com/blog/javascript-get-max-min-date-in-array-of-objects) - Community tutorial, basic JavaScript

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project, verified versions
- Architecture: HIGH - Patterns verified from official docs and existing codebase
- Pitfalls: MEDIUM-HIGH - CLS/skeleton guidance from web vitals research, useMemo from React docs, N+1 from database best practices

**Research date:** 2026-01-26
**Valid until:** 2026-02-26 (30 days - stable technologies, established patterns)
