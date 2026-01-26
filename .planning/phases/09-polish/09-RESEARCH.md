# Phase 9: Polish - Research

**Researched:** 2026-01-26
**Domain:** Chart accessibility, axis labels, legends, empty states, data freshness indicators, prefers-reduced-motion
**Confidence:** HIGH

## Summary

Phase 9 focuses on polishing the existing chart components (UploadFrequencyChart, DurationScatterChart) to meet production standards. The four key areas are: (1) proper axis labels and legends using Recharts' Label component, (2) data freshness indicators showing when data was last fetched, (3) empty chart state messaging with conditional rendering, and (4) respecting prefers-reduced-motion for animations using React hooks and Recharts' `isAnimationActive` prop.

Recharts v3.7.0 provides built-in support for axis labels via the `label` prop (accepts string, object, or ReactElement) and the standalone `<Label>` component. For accessibility, the `accessibilityLayer` prop (already in use, enabled by default in v3) provides keyboard navigation and screen reader support. Animation control is achieved through `isAnimationActive` prop on chart components, which can be dynamically toggled based on the user's motion preference detected via `window.matchMedia('(prefers-reduced-motion: reduce)')`.

Empty states are handled through conditional rendering - checking data length before rendering the chart and displaying a helpful message with context-specific guidance when no data exists. Data freshness indicators are UI patterns that display "last updated" timestamps, typically positioned near the data they describe.

**Primary recommendation:** Add descriptive axis labels using Recharts' Label component, implement a usePrefersReducedMotion hook to control isAnimationActive, conditionally render empty state messages before charts, and add a data freshness indicator showing when video data was last fetched from the API.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| recharts | 3.7.0 (existing) | Chart library with Label component | Already in use, provides label/legend API |
| React | 18.3.1 (existing) | Hooks for motion preferences | useEffect + useState for media query |
| date-fns | 4.1.0 (existing) | Format timestamps for freshness | formatRelative, formatDistanceToNow |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| N/A | - | No additional libraries needed | Use browser APIs and existing stack |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom hook | CSS-only @media | Hook allows JS-driven animations (Recharts isAnimationActive) |
| Label component | Custom SVG text | Label handles positioning, responsive scaling automatically |
| Conditional render | CSS display:none | Conditional rendering is more performant (no DOM nodes) |

**Installation:**
```bash
# No new packages needed - use existing recharts, React, date-fns
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── charts/
│   │   ├── UploadFrequencyChart.tsx    # Add axis labels, empty state
│   │   ├── DurationScatterChart.tsx    # Add axis labels, empty state
│   │   └── index.ts                    # Existing exports
│   └── DataFreshnessIndicator.tsx      # New: reusable freshness display
├── hooks/
│   └── usePrefersReducedMotion.ts      # New: motion preference detection
└── pages/
    └── AnalyticsPage.tsx               # Add freshness indicator, pass motion pref to charts
```

### Pattern 1: Axis Labels with Label Component
**What:** Add descriptive axis labels using Recharts' `<Label>` component nested within `<XAxis>` or `<YAxis>`
**When to use:** All charts need axis labels (POLI-01)
**Example:**
```typescript
// Source: https://recharts.github.io/en-US/api/XAxis/
import { XAxis, YAxis, Label } from 'recharts'

<XAxis dataKey="day">
  <Label value="Day of Week" position="insideBottom" offset={-5} />
</XAxis>

<YAxis allowDecimals={false}>
  <Label value="Upload Count" angle={-90} position="insideLeft" />
</YAxis>
```

**Key points:**
- Label must be a child component of XAxis/YAxis
- `position` controls placement ("insideBottom", "insideLeft", "top", "bottom", "left", "right")
- `angle={-90}` rotates Y-axis labels vertically
- `offset` fine-tunes positioning (negative values move inward)

### Pattern 2: Legend Component
**What:** Add legend to multi-series charts using Recharts' `<Legend>` component
**When to use:** Charts with multiple data series (POLI-01 requirement for legends)
**Example:**
```typescript
// Source: https://recharts.github.io/en-US/api/Legend/
import { Legend } from 'recharts'

<BarChart data={data}>
  {/* ...axes, grid, tooltip */}
  <Legend
    verticalAlign="top"
    height={36}
    iconType="square"
    formatter={(value) => <span className="text-[#f1f1f1]">{value}</span>}
  />
  <Bar dataKey="uploads" name="Uploads" fill="var(--color-chart-primary)" />
  <Bar dataKey="views" name="Views" fill="var(--color-chart-secondary)" />
</BarChart>
```

**Key points:**
- `name` prop on Bar/Line/Scatter components sets legend text
- `formatter` customizes legend text rendering
- `iconType` controls legend icon shape ("circle", "square", "line", etc.)
- Current charts (single series) may not need legends, but pattern available if needed

### Pattern 3: Empty State Conditional Rendering
**What:** Check data length and render helpful message when empty, not blank chart
**When to use:** All charts (POLI-03 requirement)
**Example:**
```typescript
// Source: UX best practices - https://www.eleken.co/blog-posts/empty-state-ux
export function UploadFrequencyChart({ videos }: { videos: Video[] }) {
  const data = useMemo(() => transformToFrequencyData(videos), [videos])

  // Empty state - no videos at all
  if (videos.length === 0) {
    return (
      <div className="h-64 w-full flex flex-col items-center justify-center text-center p-6">
        <svg className="w-12 h-12 text-[#aaaaaa] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-[#f1f1f1] font-medium mb-1">No upload data</p>
        <p className="text-[#aaaaaa] text-sm">
          Add channels and fetch videos to see upload frequency patterns
        </p>
      </div>
    )
  }

  // All data is zero (filtered out by time period)
  const hasNonZeroData = data.some(d => d.count > 0)
  if (!hasNonZeroData) {
    return (
      <div className="h-64 w-full flex flex-col items-center justify-center text-center p-6">
        <p className="text-[#f1f1f1] font-medium mb-1">No uploads in this period</p>
        <p className="text-[#aaaaaa] text-sm">Try selecting a longer time range</p>
      </div>
    )
  }

  // Normal state - render chart
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        {/* ...chart components */}
      </ResponsiveContainer>
    </div>
  )
}
```

**Key principles:**
- Say exactly why the screen is empty, not just "No data"
- Provide actionable guidance (what user can do next)
- Use relevant icon for visual context
- Keep message simple and empathetic

### Pattern 4: usePrefersReducedMotion Hook
**What:** React hook that detects user's motion preference and updates when it changes
**When to use:** Control animations in JS-driven components (POLI-04 requirement)
**Example:**
```typescript
// Source: https://www.joshwcomeau.com/react/prefers-reduced-motion/
import { useState, useEffect } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

export function usePrefersReducedMotion(): boolean {
  // Default to true (no motion) for SSR safety
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(true)

  useEffect(() => {
    const mediaQuery = window.matchMedia(QUERY)
    setPrefersReducedMotion(mediaQuery.matches)

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', listener)
    return () => mediaQuery.removeEventListener('change', listener)
  }, [])

  return prefersReducedMotion
}
```

**Usage in chart components:**
```typescript
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

export function UploadFrequencyChart({ videos }: { videos: Video[] }) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const data = useMemo(() => transformToFrequencyData(videos), [videos])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} accessibilityLayer>
        {/* ...other components */}
        <Bar
          dataKey="count"
          fill="var(--color-chart-primary)"
          radius={[4, 4, 0, 0]}
          isAnimationActive={!prefersReducedMotion}
          animationDuration={300}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
```

**Key points:**
- Hook defaults to `true` (animations disabled) for server-side rendering safety
- Listens for changes so updates if user toggles system preference
- Pass `!prefersReducedMotion` to `isAnimationActive` prop
- Apply to all animated components (Bar, Scatter, Line, etc.)

### Pattern 5: Data Freshness Indicator
**What:** Display "last updated" timestamp near data visualizations to build user trust
**When to use:** Near chart sections (POLI-02 requirement)
**Example:**
```typescript
// Source: https://www.smashingmagazine.com/2025/09/ux-strategies-real-time-dashboards/
import { formatDistanceToNow } from 'date-fns'

interface DataFreshnessIndicatorProps {
  lastFetchedAt: Date | string
  className?: string
}

export function DataFreshnessIndicator({
  lastFetchedAt,
  className = ''
}: DataFreshnessIndicatorProps) {
  const timestamp = typeof lastFetchedAt === 'string'
    ? new Date(lastFetchedAt)
    : lastFetchedAt

  return (
    <div className={`flex items-center gap-2 text-xs text-[#aaaaaa] ${className}`}>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>
        Updated {formatDistanceToNow(timestamp, { addSuffix: true })}
      </span>
    </div>
  )
}
```

**Usage in AnalyticsPage:**
```typescript
// Track when videos were last fetched
const [videosFetchedAt, setVideosFetchedAt] = useState<Date | null>(null)

useEffect(() => {
  async function fetchAllVideos() {
    // ...existing fetch logic
    setVideos(data || [])
    setVideosFetchedAt(new Date()) // Track fetch time
    setVideosLoading(false)
  }
  fetchAllVideos()
}, [channels])

return (
  <section className="mb-8">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-[#aaaaaa]">Charts</h2>
      {videosFetchedAt && (
        <DataFreshnessIndicator lastFetchedAt={videosFetchedAt} />
      )}
    </div>
    {/* ...charts */}
  </section>
)
```

**Key principles:**
- Position near the data it describes (section header or above charts)
- Use relative time format ("2 minutes ago") for better UX
- Include clock icon for visual clarity
- Use subtle styling to avoid distraction

### Anti-Patterns to Avoid
- **No empty state handling:** Rendering blank chart areas confuses users (violates POLI-03)
- **Hardcoded "No data" without context:** Say *why* there's no data and what to do
- **Ignoring prefers-reduced-motion:** Violates accessibility standards (WCAG 2.2.3)
- **Global animation disable:** Don't use `isAnimationActive={false}` for all users, only those who prefer reduced motion
- **Missing axis labels:** Charts without labels are ambiguous (violates POLI-01)
- **Stale data without indicator:** Users can't trust data if they don't know when it was fetched (violates POLI-02)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Axis label positioning | Manual SVG text with coordinates | Recharts `<Label>` component | Handles responsive scaling, positioning edge cases |
| Motion preference detection | One-time check on mount | Custom hook with event listener | Detects runtime changes when user toggles system setting |
| Relative timestamps | Custom date math | date-fns `formatDistanceToNow` | Handles edge cases (seconds/minutes/hours/days/months) |
| Empty state icons | Custom SVG paths | Heroicons or existing icon library | Consistent styling, accessibility built-in |
| Legend layout | Manual positioning calculations | Recharts `<Legend>` component | Handles overflow, responsive layout, icon rendering |

**Key insight:** Chart labeling and accessibility involve coordinate systems, responsive scaling, and runtime event handling that are error-prone to implement manually. Use the library-provided APIs.

## Common Pitfalls

### Pitfall 1: Label Overlap with Chart Content
**What goes wrong:** Axis labels overlap with tick labels or data points
**Why it happens:** Default positioning doesn't account for chart margins and label size
**How to avoid:** Use `insideBottom` / `insideLeft` positions with negative `offset`, or increase chart margins
**Warning signs:** Label text overlaps with numbers or bars

### Pitfall 2: Motion Preference Hook Hydration Mismatch
**What goes wrong:** Server-rendered HTML doesn't match client render, React hydration error
**Why it happens:** Hook starts with default value (true), then updates on mount
**How to avoid:** Default to `true` (animations disabled) for SSR safety, accept first render may differ
**Warning signs:** Console warning about hydration mismatch in Next.js or Gatsby

### Pitfall 3: Empty State Height Mismatch
**What goes wrong:** Empty state div collapses or has different height than chart
**Why it happens:** Chart parent has explicit height, empty state doesn't match
**How to avoid:** Apply same height class (`h-64`, `h-80`) to empty state container
**Warning signs:** Layout shift when data loads, different spacing for empty vs filled

### Pitfall 4: Animation Performance on Mobile
**What goes wrong:** Chart animations lag or stutter on mobile devices
**Why it happens:** SVG animations can be expensive on lower-power devices
**How to avoid:** Use shorter `animationDuration` (300ms instead of default 1500ms), or detect low-power mode
**Warning signs:** Janky animations on iOS Safari or older Android devices

### Pitfall 5: Legend Obscuring Data
**What goes wrong:** Legend overlaps chart content or pushes chart out of container
**Why it happens:** Legend takes up space within chart container
**How to avoid:** Increase chart container height to accommodate legend, or position legend outside chart
**Warning signs:** Bars/points cut off when legend is visible

### Pitfall 6: Freshness Timestamp Never Updates
**What goes wrong:** "Updated 5 hours ago" never refreshes even when staying on page
**Why it happens:** formatDistanceToNow is called once at render, not continuously
**How to avoid:** Use interval to re-render component every minute, or accept static timestamp (refresh on navigation)
**Warning signs:** User reports stale "updated X ago" messages

## Code Examples

Verified patterns from official sources:

### Complete UploadFrequencyChart with Polish
```typescript
// Combines: axis labels, empty state, motion preference
import { useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Label,
} from 'recharts'
import type { Video } from '../../lib/types'
import { transformToFrequencyData } from '../../lib/chartUtils'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

export function UploadFrequencyChart({ videos }: { videos: Video[] }) {
  const data = useMemo(() => transformToFrequencyData(videos), [videos])
  const prefersReducedMotion = usePrefersReducedMotion()

  // Empty state - no videos
  if (videos.length === 0) {
    return (
      <div className="h-64 w-full flex flex-col items-center justify-center text-center p-6">
        <svg className="w-12 h-12 text-[#aaaaaa] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-[#f1f1f1] font-medium mb-1">No upload data</p>
        <p className="text-[#aaaaaa] text-sm">
          Add channels and fetch videos to see upload frequency
        </p>
      </div>
    )
  }

  // Check for all-zero data (filtered by time period)
  const hasNonZeroData = data.some(d => d.count > 0)
  if (!hasNonZeroData) {
    return (
      <div className="h-64 w-full flex flex-col items-center justify-center text-center p-6">
        <p className="text-[#f1f1f1] font-medium mb-1">No uploads in this period</p>
        <p className="text-[#aaaaaa] text-sm">Try selecting a longer time range</p>
      </div>
    )
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} accessibilityLayer margin={{ bottom: 20, left: 20 }}>
          <CartesianGrid
            stroke="var(--color-chart-grid)"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="day"
            tick={{ fill: 'var(--color-text-secondary)' }}
            axisLine={{ stroke: 'var(--color-chart-grid)' }}
            tickLine={{ stroke: 'var(--color-chart-grid)' }}
          >
            <Label value="Day of Week" position="insideBottom" offset={-10} />
          </XAxis>
          <YAxis
            tick={{ fill: 'var(--color-text-secondary)' }}
            axisLine={{ stroke: 'var(--color-chart-grid)' }}
            tickLine={{ stroke: 'var(--color-chart-grid)' }}
            allowDecimals={false}
          >
            <Label value="Uploads" angle={-90} position="insideLeft" />
          </YAxis>
          <Tooltip
            content={FrequencyTooltip}
            cursor={{ fill: 'var(--color-surface-hover)', opacity: 0.3 }}
          />
          <Bar
            dataKey="count"
            fill="var(--color-chart-primary)"
            radius={[4, 4, 0, 0]}
            isAnimationActive={!prefersReducedMotion}
            animationDuration={300}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
```

### Complete DurationScatterChart with Polish
```typescript
// Combines: axis labels, empty state, motion preference, legend (optional)
import { useMemo } from 'react'
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Label,
} from 'recharts'
import type { Video } from '../../lib/types'
import { transformToScatterData } from '../../lib/chartUtils'
import { formatViewCount } from '../../lib/formatters'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

interface DurationScatterChartProps {
  videos: Video[]
  channelMap: Map<string, string>
}

export function DurationScatterChart({ videos, channelMap }: DurationScatterChartProps) {
  const data = useMemo(() => transformToScatterData(videos, channelMap), [videos, channelMap])
  const prefersReducedMotion = usePrefersReducedMotion()

  const avgDuration = useMemo(() => {
    if (data.length === 0) return 0
    const sum = data.reduce((acc, d) => acc + d.duration, 0)
    return Math.round(sum / data.length)
  }, [data])

  // Empty state
  if (videos.length === 0) {
    return (
      <div className="h-80 w-full flex flex-col items-center justify-center text-center p-6">
        <svg className="w-12 h-12 text-[#aaaaaa] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
        <p className="text-[#f1f1f1] font-medium mb-1">No video data</p>
        <p className="text-[#aaaaaa] text-sm">
          Add channels and fetch videos to see duration vs views analysis
        </p>
      </div>
    )
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart accessibilityLayer margin={{ bottom: 20, left: 60 }}>
          <CartesianGrid
            stroke="var(--color-chart-grid)"
            strokeDasharray="3 3"
          />
          <XAxis
            type="number"
            dataKey="duration"
            name="Duration"
            unit=" min"
            tick={{ fill: 'var(--color-text-secondary)' }}
            axisLine={{ stroke: 'var(--color-chart-grid)' }}
            tickLine={{ stroke: 'var(--color-chart-grid)' }}
          >
            <Label value="Video Duration (minutes)" position="insideBottom" offset={-10} />
          </XAxis>
          <YAxis
            type="number"
            dataKey="views"
            name="Views"
            tickFormatter={formatViewCount}
            tick={{ fill: 'var(--color-text-secondary)' }}
            axisLine={{ stroke: 'var(--color-chart-grid)' }}
            tickLine={{ stroke: 'var(--color-chart-grid)' }}
          >
            <Label value="View Count" angle={-90} position="insideLeft" />
          </YAxis>
          <Tooltip
            content={ScatterTooltip}
            cursor={{ strokeDasharray: '3 3' }}
          />
          {data.length > 0 && (
            <ReferenceLine
              x={avgDuration}
              stroke="var(--color-chart-reference)"
              strokeDasharray="5 5"
              label={{
                value: `Avg: ${avgDuration} min`,
                position: 'top',
                fill: 'var(--color-text-secondary)',
                fontSize: 12,
              }}
            />
          )}
          <Scatter
            data={data}
            fill="var(--color-chart-primary)"
            fillOpacity={0.7}
            isAnimationActive={!prefersReducedMotion}
            animationDuration={300}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
```

### AnalyticsPage with Data Freshness Indicator
```typescript
// Add freshness tracking and display
export function AnalyticsPage() {
  const { channels, isLoading, error } = useChannels()
  const [videos, setVideos] = useState<Video[]>([])
  const [videosLoading, setVideosLoading] = useState(true)
  const [videosFetchedAt, setVideosFetchedAt] = useState<Date | null>(null)

  // Fetch all videos for tracked channels
  useEffect(() => {
    async function fetchAllVideos() {
      if (channels.length === 0) {
        setVideosLoading(false)
        return
      }
      const channelIds = channels.map(c => c.id)
      const { data } = await supabase
        .from('videos')
        .select('*')
        .in('channel_id', channelIds)
        .order('published_at', { ascending: false })

      setVideos(data || [])
      setVideosFetchedAt(new Date()) // Track fetch time
      setVideosLoading(false)
    }
    if (!isLoading) {
      fetchAllVideos()
    }
  }, [channels, isLoading])

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      {/* Charts Section with Freshness Indicator */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#aaaaaa]">Charts</h2>
          {videosFetchedAt && !videosLoading && (
            <DataFreshnessIndicator lastFetchedAt={videosFetchedAt} />
          )}
        </div>
        {/* ...charts */}
      </section>
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CSS-only motion detection | React hook with event listener | 2020+ | Enables JS animation control (Recharts isAnimationActive) |
| Inline Label prop object | `<Label>` child component | Recharts v3 | Better TypeScript support, more flexible |
| No empty state standards | Context-specific messaging | 2023+ UX patterns | Better user experience, actionable guidance |
| "Last sync" in database | Client-side fetch tracking | Common pattern | Simpler implementation for client-side apps |

**Deprecated/outdated:**
- Using `@media (prefers-reduced-motion)` in CSS only - doesn't control JS animations
- Generic "No data" messages without context - UX best practices now require specific guidance
- Setting `isAnimationActive={false}` globally - should respect user preference

## Open Questions

Things that couldn't be fully resolved:

1. **Freshness Indicator Auto-Refresh**
   - What we know: formatDistanceToNow returns static string, not live-updating
   - What's unclear: Whether to implement interval-based refresh or accept static timestamp
   - Recommendation: Start with static timestamp (updates on page refresh), add interval if users request it

2. **Legend Necessity for Single-Series Charts**
   - What we know: Current charts (bar, scatter) show single data series
   - What's unclear: Whether POLI-01 "legends" requirement applies to single-series charts
   - Recommendation: Skip legend for single-series (axis labels provide context), add if multi-series later

3. **Motion Preference Propagation**
   - What we know: usePrefersReducedMotion hook works in each component
   - What's unclear: Whether to pass prop from parent or call hook in each chart component
   - Recommendation: Call hook in each chart component for better encapsulation

4. **Empty State Icon Consistency**
   - What we know: Need icons for empty bar chart and scatter plot
   - What's unclear: Whether to use Heroicons, custom SVG, or existing icon library
   - Recommendation: Use inline Heroicons-style SVG (already used in codebase for BarChartIcon)

## Sources

### Primary (HIGH confidence)
- [Recharts XAxis API](https://recharts.github.io/en-US/api/XAxis/) - Label prop options
- [Recharts Legend API](https://recharts.github.io/en-US/api/Legend/) - Legend component usage
- [Recharts Accessibility Wiki](https://github.com/recharts/recharts/wiki/Recharts-and-accessibility/ad2642f9fa2e43411621e9e29e3c6ea2d6396234) - accessibilityLayer feature
- [Josh Comeau's prefers-reduced-motion React Hook](https://www.joshwcomeau.com/react/prefers-reduced-motion/) - Motion preference detection

### Secondary (MEDIUM confidence)
- [Eleken Empty State UX](https://www.eleken.co/blog-posts/empty-state-ux) - Empty state best practices
- [Smashing Magazine: Real-Time Dashboards](https://www.smashingmagazine.com/2025/09/ux-strategies-real-time-dashboards/) - Data freshness patterns
- [Paige Niedringhaus: Recharts Styling](https://www.paigeniedringhaus.com/blog/build-and-custom-style-recharts-data-charts/) - Axis label examples
- [Recharts GitHub Issue #233](https://github.com/recharts/recharts/issues/233) - isAnimationActive prop discussion

### Tertiary (LOW confidence)
- [WebSearch: Empty state patterns 2026] - General UX guidance, not React-specific
- [WebSearch: Data freshness indicators] - Data engineering focus, not UI patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing libraries (recharts, React, date-fns)
- Architecture: HIGH - Patterns verified from official Recharts docs and Josh Comeau article
- Pitfalls: MEDIUM - Based on GitHub issues and UX best practices articles
- Empty states: HIGH - Verified from UX design resources and React patterns
- Motion preferences: HIGH - Verified from MDN, W3C, and Josh Comeau's authoritative article

**Research date:** 2026-01-26
**Valid until:** 2026-03-26 (60 days - accessibility standards and Recharts API are stable)
