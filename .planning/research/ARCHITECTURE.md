# Architecture Research

**Domain:** Analytics Dashboard Integration
**Researched:** 2026-01-26
**Confidence:** HIGH

## Executive Summary

The existing React/Supabase architecture follows clean patterns: custom hooks for data fetching with real-time subscriptions, presentational components, and a thin service layer. Analytics features integrate naturally by extending these patterns with:

1. **New analytics hooks** that compute derived metrics from existing video data
2. **Presentational chart components** using Recharts (lightweight, SVG-based, excellent docs)
3. **Client-side calculation** (sufficient for <100 data points per channel)
4. **Optional Supabase aggregate queries** for cross-channel summaries

No database schema changes required. All analytics can be derived from existing `videos` and `channels` tables.

## Integration with Existing Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              EXISTING SYSTEM                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌─────────────────────────────┐   │
│  │   App.tsx    │───>│    Pages     │───>│       Components            │   │
│  │  (Routes)    │    │ - Channels   │    │ - ChannelCard, VideoCard    │   │
│  └──────────────┘    │ - Detail     │    │ - VideoGrid, IdeaCard       │   │
│                      │ - Ideas      │    └─────────────────────────────┘   │
│                      └──────────────┘                 │                     │
│                             │                         │                     │
│                      ┌──────v──────────────────┐     │                     │
│                      │      Custom Hooks       │<────┘                     │
│                      │ - useChannels           │                           │
│                      │ - useChannelVideos      │                           │
│                      │ - useIdeas              │                           │
│                      └──────────────────────────┘                           │
│                             │                                               │
│                      ┌──────v──────────────────┐                           │
│                      │    Service Layer        │                           │
│                      │ - lib/channels.ts       │                           │
│                      │ - lib/videos.ts         │                           │
│                      │ - lib/ideas.ts          │                           │
│                      └──────────────────────────┘                           │
│                             │                                               │
│                      ┌──────v──────────────────┐                           │
│                      │    lib/supabase.ts      │                           │
│                      │    (Supabase Client)    │                           │
│                      └──────────────────────────┘                           │
└─────────────────────────────────────────────────────────────────────────────┘
                              │
                              v
┌─────────────────────────────────────────────────────────────────────────────┐
│                              NEW ANALYTICS LAYER                             │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         Analytics Page                                │  │
│  │  /analytics (NEW)                                                    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                              │                                              │
│       ┌──────────────────────┼──────────────────────┐                      │
│       │                      │                      │                      │
│       v                      v                      v                      │
│  ┌──────────┐      ┌──────────────────┐    ┌──────────────────┐           │
│  │ Channel  │      │ Video Analytics  │    │ Pattern Charts   │           │
│  │ Overview │      │ (sortable grid)  │    │ (frequency,      │           │
│  │ Cards    │      │                  │    │  duration, etc.) │           │
│  └──────────┘      └──────────────────┘    └──────────────────┘           │
│       │                      │                      │                      │
│       └──────────────────────┼──────────────────────┘                      │
│                              v                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    Analytics Hooks (NEW)                              │  │
│  │  - useChannelAnalytics  (per-channel metrics)                        │  │
│  │  - useVideoSorting      (multi-criteria sort)                        │  │
│  │  - useUploadPatterns    (frequency analysis)                         │  │
│  │  - useDurationAnalysis  (duration bucketing)                         │  │
│  │  - useViewVelocity      (views/time calculations)                    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                              │                                              │
│                              v                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                  lib/analytics.ts (NEW)                               │  │
│  │  Pure calculation functions (no side effects)                        │  │
│  │  - calculateUploadFrequency()                                        │  │
│  │  - calculateViewVelocity()                                           │  │
│  │  - bucketByDuration()                                                │  │
│  │  - aggregateChannelStats()                                           │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Architecture Pattern

The existing codebase follows a clear pattern:

```
Page Component (ChannelDetailPage)
    │
    ├── Uses custom hook (useChannelVideos)
    │   └── Returns: { data, isLoading, error, refresh }
    │
    ├── Renders grid component (VideoGrid)
    │   └── Renders item component (VideoCard)
    │
    └── Handles actions (onSaveIdea callback)
```

**Analytics should follow this same pattern:**

```
AnalyticsPage
    │
    ├── Uses useChannels() (existing)
    ├── Uses useAnalyticsData() (new - aggregates all channel videos)
    │
    ├── Renders ChannelOverview (new component)
    │   └── Uses useChannelAnalytics(channelId)
    │
    ├── Renders VideoAnalyticsGrid (new component)
    │   └── Uses useVideoSorting(videos, sortCriteria)
    │
    └── Renders PatternCharts (new component)
        ├── UploadFrequencyChart (uses useUploadPatterns)
        ├── DurationDistributionChart (uses useDurationAnalysis)
        └── ViewVelocityChart (uses useViewVelocity)
```

## New Components Needed

### Page Components

| Component | Responsibility | Dependencies | Priority |
|-----------|---------------|--------------|----------|
| `AnalyticsPage` | Main analytics page layout, data coordination | useChannels, useAnalyticsData | P0 |

### Analytics Display Components

| Component | Responsibility | Dependencies | Priority |
|-----------|---------------|--------------|----------|
| `ChannelOverviewCard` | Display single channel's key metrics | Channel, computed stats | P0 |
| `ChannelOverviewGrid` | Grid of ChannelOverviewCards | ChannelOverviewCard | P0 |
| `VideoAnalyticsGrid` | Sortable video grid with analytics columns | VideoCard (existing), sorting hook | P1 |
| `SortControls` | UI for selecting sort criteria | Local state | P1 |

### Chart Components

| Component | Responsibility | Dependencies | Priority |
|-----------|---------------|--------------|----------|
| `UploadFrequencyChart` | Bar chart of uploads by day/week | Recharts, pattern data | P1 |
| `DurationDistributionChart` | Histogram of video lengths | Recharts, bucketed data | P2 |
| `ViewVelocityChart` | Scatter/line chart of view velocity | Recharts, velocity data | P2 |
| `AnalyticsCard` | Wrapper for charts with consistent styling | None | P0 |

### Skeleton Components

| Component | Responsibility | Priority |
|-----------|---------------|----------|
| `ChannelOverviewSkeleton` | Loading state for ChannelOverviewCard | P0 |
| `ChartSkeleton` | Loading state for chart components | P1 |

## Modified Components

| Component | Modification | Reason |
|-----------|-------------|--------|
| `App.tsx` | Add `/analytics` route | New page |
| `Nav.tsx` | Add Analytics nav link | Navigation |
| `VideoGrid.tsx` | Add optional `sortable` prop | Reuse in analytics |
| `lib/types.ts` | Add analytics types | Type safety |
| `lib/formatters.ts` | Add analytics formatters | Format velocity, percentages |

## New Hooks Needed

### Data Fetching Hooks

| Hook | Input | Output | Notes |
|------|-------|--------|-------|
| `useAnalyticsData` | none | `{ channels, allVideos, isLoading }` | Aggregates all tracked channels' videos |

### Calculation Hooks (with useMemo)

| Hook | Input | Output | Notes |
|------|-------|--------|-------|
| `useChannelAnalytics(channelId, videos)` | channel ID, videos | `{ totalViews, avgViews, uploadFrequency, ... }` | Memoized calculations |
| `useVideoSorting(videos, sortConfig)` | videos, sort criteria | `{ sortedVideos, setSortConfig }` | Multi-criteria sorting |
| `useUploadPatterns(videos)` | videos array | `{ byDayOfWeek, byMonth, ... }` | Frequency analysis |
| `useDurationAnalysis(videos)` | videos array | `{ buckets, avgDuration, ... }` | Duration bucketing |
| `useViewVelocity(videos)` | videos array | `{ velocityData, avgVelocity, ... }` | Views per day since publish |

### Hook Implementation Pattern

Follow the existing hook pattern with useMemo for expensive calculations:

```typescript
// src/hooks/useChannelAnalytics.ts
import { useMemo } from 'react'
import type { Video } from '../lib/types'
import { calculateChannelStats } from '../lib/analytics'

interface ChannelAnalytics {
  totalViews: number
  avgViews: number
  totalVideos: number
  avgDuration: number
  uploadFrequency: number // videos per week
}

export function useChannelAnalytics(videos: Video[]): ChannelAnalytics {
  return useMemo(() => {
    return calculateChannelStats(videos)
  }, [videos])
}
```

## Data Flow

### Analytics Calculation Flow

```
1. AnalyticsPage mounts
       │
       v
2. useAnalyticsData() fetches all channels + their videos
   (reuses existing fetchChannelVideos for each channel)
       │
       v
3. Data flows to child components
       │
       ├──> ChannelOverviewGrid
       │         │
       │         v
       │    useChannelAnalytics(videos) per channel
       │    (useMemo caches calculations)
       │
       ├──> VideoAnalyticsGrid
       │         │
       │         v
       │    useVideoSorting(allVideos, sortConfig)
       │    (useMemo for sorted array)
       │
       └──> PatternCharts
                 │
                 v
            useUploadPatterns(allVideos)
            useDurationAnalysis(allVideos)
            useViewVelocity(allVideos)
            (each hook useMemo-caches calculations)
```

### Caching Strategy

**Client-Side Caching (Primary):**
- `useMemo` for all derived calculations
- Calculations only rerun when source data changes
- Sufficient for <100 videos per channel (20 videos * 5 channels = 100 max)

**Data Freshness:**
- Leverage existing 24-hour video cache from `useChannelVideos`
- Analytics inherit this cache - no additional API calls needed
- Manual refresh on AnalyticsPage triggers refetch of all channel videos

**No Server-Side Caching Needed:**
- Calculations are fast (<10ms for 100 videos)
- Adding PostgreSQL views or materialized views would add complexity without benefit
- If scale increases significantly (1000+ videos), consider Supabase aggregate queries

### State Management Approach

**Keep it Simple:**
- No new global state library needed
- Use existing Supabase real-time subscriptions
- Local component state for UI (sort selections, filters)
- Props drilling is fine for 2-3 levels deep

```
AnalyticsPage (owns data loading)
    │
    ├── channels, allVideos (from hooks)
    │
    └── Passes to children via props
        ├── ChannelOverviewGrid channels={channels} videos={videosByChannel}
        ├── VideoAnalyticsGrid videos={allVideos} sortConfig={sortConfig}
        └── PatternCharts videos={allVideos}
```

## Recommended Build Order

Based on component dependencies and incremental value:

### Phase 1: Foundation (Prerequisite for all)

**Build Order:**
1. `lib/analytics.ts` - Pure calculation functions
2. `lib/types.ts` additions - Analytics types
3. `lib/formatters.ts` additions - Analytics formatters
4. `AnalyticsPage` shell - Route setup, basic layout
5. `Nav.tsx` modification - Add link

**Rationale:** Establishes the calculation layer that all analytics components depend on. Route setup allows incremental testing.

### Phase 2: Channel Overview (Highest Value)

**Build Order:**
1. `useAnalyticsData` hook - Aggregates all channel data
2. `useChannelAnalytics` hook - Per-channel stats
3. `ChannelOverviewCard` component
4. `ChannelOverviewSkeleton` component
5. `ChannelOverviewGrid` component

**Rationale:** Channel overview provides immediate value with no external dependencies (no charting library). Users see actionable data quickly.

### Phase 3: Video Sorting (Quick Win)

**Build Order:**
1. `useVideoSorting` hook - Multi-criteria sort
2. `SortControls` component
3. `VideoAnalyticsGrid` component (extends VideoGrid)

**Rationale:** Sorting reuses existing `VideoGrid` and `VideoCard`. Minimal new UI, high utility.

### Phase 4: Charts (Visual Polish)

**Build Order:**
1. Install Recharts (`npm install recharts`)
2. `AnalyticsCard` wrapper component
3. `useUploadPatterns` hook
4. `UploadFrequencyChart` component
5. `ChartSkeleton` component
6. `useDurationAnalysis` hook
7. `DurationDistributionChart` component
8. `useViewVelocity` hook
9. `ViewVelocityChart` component

**Rationale:** Charts are highest complexity and can be built incrementally. Each chart is independent.

## Charting Library Recommendation

**Recommended: Recharts**

| Criterion | Recharts | Visx | Decision |
|-----------|----------|------|----------|
| Learning curve | Low | High | Recharts |
| Bundle size | ~100KB | Variable (tree-shakable) | Recharts acceptable |
| Customization | Good enough | Excellent | Recharts sufficient |
| Documentation | Excellent | Good | Recharts |
| SVG rendering | Yes | Yes | Either |
| Performance (<100 points) | Excellent | Excellent | Either |

**Why Recharts over Visx:**
- Existing codebase uses straightforward, declarative patterns
- Recharts matches this style (JSX-based, props-driven)
- No need for D3-level customization
- Faster to implement, easier to maintain

**Installation:**
```bash
npm install recharts
```

**Basic Usage Pattern:**
```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

function UploadFrequencyChart({ data }: { data: { day: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#ff0000" />
      </BarChart>
    </ResponsiveContainer>
  )
}
```

## Anti-Patterns to Avoid

### 1. Over-Engineering the Data Layer

**Bad:** Creating a complex analytics service with its own caching, state management, and API abstraction.

**Why bad:** The existing patterns work well. Adding abstraction adds complexity without benefit at this scale.

**Instead:** Keep analytics calculations as pure functions in `lib/analytics.ts`, use `useMemo` in hooks, reuse existing data fetching patterns.

### 2. Premature Server-Side Aggregation

**Bad:** Creating PostgreSQL views, materialized views, or Supabase Edge Functions for analytics calculations.

**Why bad:**
- Client-side calculations are fast enough for <100 videos
- Adds database migration complexity
- Makes local development harder
- Supabase aggregate functions require careful security configuration

**Instead:** Calculate in the browser using `useMemo`. Only move to server-side if performance becomes an issue (unlikely at current scale).

### 3. Global State for Transient UI

**Bad:** Using Zustand/Redux for sort selections, filter state, or chart interactions.

**Why bad:** This state is page-local and doesn't need to persist or sync.

**Instead:** Use `useState` in AnalyticsPage or individual chart components.

### 4. Fetching All Videos Eagerly

**Bad:** Calling Edge Function for every channel simultaneously on page load.

**Why bad:** Could hit YouTube API quota limits, slow initial load.

**Instead:**
- Use existing cached data from `getCachedVideos()` initially
- Fetch fresh data lazily (on manual refresh or when visiting channel detail)
- Consider staggered fetching if needed

### 5. Breaking Existing Component Contracts

**Bad:** Modifying `VideoCard` props to require analytics data.

**Why bad:** Breaks existing usages in `ChannelDetailPage`.

**Instead:** Create `VideoAnalyticsCard` that wraps `VideoCard` and adds analytics display, or use composition.

### 6. Mixing Calculation and Presentation

**Bad:** Calculating averages, velocities, and buckets inside chart components.

**Why bad:** Makes components harder to test, harder to reuse calculations elsewhere.

**Instead:**
- Pure calculation functions in `lib/analytics.ts`
- Custom hooks that call these functions with `useMemo`
- Components receive pre-calculated data as props

## File Structure

```
src/
├── components/
│   ├── analytics/                    # NEW - analytics components
│   │   ├── ChannelOverviewCard.tsx
│   │   ├── ChannelOverviewGrid.tsx
│   │   ├── VideoAnalyticsGrid.tsx
│   │   ├── SortControls.tsx
│   │   ├── AnalyticsCard.tsx
│   │   ├── UploadFrequencyChart.tsx
│   │   ├── DurationDistributionChart.tsx
│   │   └── ViewVelocityChart.tsx
│   ├── skeletons/
│   │   ├── ChannelOverviewSkeleton.tsx  # NEW
│   │   └── ChartSkeleton.tsx            # NEW
│   └── ... (existing)
├── hooks/
│   ├── useAnalyticsData.ts           # NEW - aggregate data fetching
│   ├── useChannelAnalytics.ts        # NEW - per-channel calculations
│   ├── useVideoSorting.ts            # NEW - multi-criteria sorting
│   ├── useUploadPatterns.ts          # NEW - frequency analysis
│   ├── useDurationAnalysis.ts        # NEW - duration bucketing
│   ├── useViewVelocity.ts            # NEW - velocity calculations
│   └── ... (existing)
├── lib/
│   ├── analytics.ts                  # NEW - pure calculation functions
│   ├── types.ts                      # MODIFIED - add analytics types
│   ├── formatters.ts                 # MODIFIED - add analytics formatters
│   └── ... (existing)
└── pages/
    ├── AnalyticsPage.tsx             # NEW
    └── ... (existing)
```

## Type Definitions

Add to `lib/types.ts`:

```typescript
// Analytics types
export interface ChannelStats {
  channelId: string
  channelName: string
  totalVideos: number
  totalViews: number
  avgViews: number
  avgDuration: number // seconds
  uploadsPerWeek: number
  lastUploadDate: string
}

export interface VideoWithVelocity extends Video {
  viewVelocity: number // views per day since publish
  daysAgo: number
}

export interface DurationBucket {
  label: string // "3-5 min", "5-10 min", etc.
  min: number
  max: number
  count: number
  avgViews: number
}

export interface UploadPattern {
  dayOfWeek: number // 0-6
  dayName: string // "Sunday", "Monday", etc.
  count: number
  avgViews: number
}

export type SortCriteria =
  | 'newest'
  | 'oldest'
  | 'most_views'
  | 'least_views'
  | 'longest'
  | 'shortest'
  | 'highest_velocity'

export interface SortConfig {
  criteria: SortCriteria
  direction: 'asc' | 'desc'
}
```

## Sources

### Architecture Patterns
- [React Architecture Patterns and Best Practices for 2026](https://www.bacancytechnology.com/blog/react-architecture-patterns-and-best-practices) - Feature-based structure, custom hooks
- [React Design Patterns for 2026 Projects](https://www.sayonetech.com/blog/react-design-patterns/) - Separation of concerns
- [GeeksforGeeks React Architecture](https://www.geeksforgeeks.org/reactjs/react-architecture-pattern-and-best-practices/) - State management patterns

### Charting Libraries
- [Best React Chart Libraries 2026](https://blog.logrocket.com/best-react-chart-libraries-2025/) - Recharts vs Visx comparison
- [React Chart Libraries Comparison](https://weavelinx.com/best-chart-libraries-for-react-projects-in-2026/) - Performance considerations

### Data Layer
- [React useMemo documentation](https://react.dev/reference/react/useMemo) - Caching computed values
- [Supabase PostgREST Aggregate Functions](https://supabase.com/blog/postgrest-aggregate-functions) - Server-side aggregation (if needed later)
- [Supabase for Analytics](https://www.tinybird.co/blog/can-i-use-supabase-for-user-facing-analytics) - Limitations and alternatives

### Existing Codebase (HIGH confidence)
- Reviewed: `src/hooks/useChannels.ts`, `useChannelVideos.ts`, `useIdeas.ts` - Established hook patterns
- Reviewed: `src/components/VideoGrid.tsx`, `VideoCard.tsx` - Component patterns
- Reviewed: `src/pages/ChannelDetailPage.tsx` - Page composition patterns
- Reviewed: `src/lib/types.ts`, `formatters.ts`, `videos.ts` - Service layer patterns
