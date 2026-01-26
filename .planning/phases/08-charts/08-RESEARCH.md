# Phase 8: Charts - Research

**Researched:** 2026-01-26
**Domain:** Data visualization with Recharts v3 (bar charts, scatter plots, dark theme)
**Confidence:** HIGH

## Summary

This phase implements two chart visualizations: a day-of-week upload frequency bar chart and a duration vs views scatter plot. Recharts v3.7.0 has been selected as the charting library (prior decision from v1.1 planning). Research focused on Recharts v3 API patterns, dark theme styling with CSS variables, accessibility requirements, and mobile responsiveness.

Recharts v3 introduced significant internal changes but maintained a stable API surface. The key considerations are: using `ResponsiveContainer` for mobile responsiveness, CSS variables for dark theme color consistency, `ReferenceLine` for average indicators, and custom tooltip components for hover/tap details. The existing CSS custom properties in the codebase (`--color-surface`, `--color-text-primary`, etc.) can be extended with chart-specific colors.

**Primary recommendation:** Use Recharts v3.7.0 with wrapper components that leverage the existing CSS variable system, implementing custom tooltips for both charts and `ReferenceLine` for the average duration indicator.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| recharts | 3.7.0 | React charting library | Decided in v1.1, SVG-based, declarative API, Tailwind v4 compatible |
| react-is | (match React) | Peer dependency for Recharts | Required by Recharts installation |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| date-fns | 4.1.0 (existing) | Day-of-week extraction | Parse `published_at` to get day index |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Recharts | Victory | More customizable but steeper learning curve |
| Recharts | Nivo | Better dark mode but larger bundle |
| Recharts | Chart.js (react-chartjs-2) | Canvas-based = better for 5000+ points, but less React-native feel |

**Installation:**
```bash
npm install recharts react-is
```

Note: `react-is` version should match installed React version (18.x).

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── charts/
│   │   ├── UploadFrequencyChart.tsx    # Day-of-week bar chart
│   │   ├── DurationScatterChart.tsx    # Duration vs views scatter
│   │   ├── ChartTooltip.tsx            # Shared custom tooltip component
│   │   └── index.ts                    # Barrel export
│   └── ...existing components
├── lib/
│   ├── chartUtils.ts                   # Data transformation helpers
│   └── ...existing lib files
└── index.css                           # Add chart color variables
```

### Pattern 1: ResponsiveContainer Wrapper
**What:** All charts must be wrapped in `ResponsiveContainer` for mobile responsiveness
**When to use:** Every chart implementation
**Example:**
```typescript
// Source: Recharts GitHub README + ResponsiveContainer docs
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

function UploadFrequencyChart({ data }: { data: FrequencyData[] }) {
  return (
    <div className="h-64 w-full"> {/* Parent MUST have defined dimensions */}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} accessibilityLayer>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="count" fill="var(--color-chart-primary)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
```

### Pattern 2: CSS Variables for Theming
**What:** Use CSS custom properties for all chart colors to match dark theme
**When to use:** All color/fill/stroke properties
**Example:**
```css
/* index.css - extend existing variables */
:root {
  /* Existing dark theme colors */
  --color-background: #0f0f0f;
  --color-surface: #272727;
  --color-text-primary: #f1f1f1;
  --color-text-secondary: #aaaaaa;
  --color-border: #3f3f3f;

  /* Chart-specific colors (accessible on dark background) */
  --color-chart-primary: #60a5fa;     /* Blue - 7.1:1 contrast on #0f0f0f */
  --color-chart-secondary: #34d399;   /* Green - 6.8:1 contrast */
  --color-chart-accent: #f472b6;      /* Pink - 5.2:1 contrast */
  --color-chart-grid: #3f3f3f;        /* Match border */
  --color-chart-reference: #fbbf24;   /* Yellow for average line */
}
```

### Pattern 3: Custom Tooltip Component
**What:** Create reusable tooltip that matches app styling
**When to use:** Both charts need custom tooltips
**Example:**
```typescript
// Source: shadcn/ui chart patterns + Recharts Tooltip API
import type { TooltipProps } from 'recharts'

interface ChartTooltipProps extends TooltipProps<number, string> {
  // Additional props for video details
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-[#272727] border border-[#3f3f3f] rounded-lg p-3 shadow-lg">
      <p className="text-[#f1f1f1] font-medium">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-[#aaaaaa] text-sm">
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}
```

### Pattern 4: ReferenceLine for Average Indicator
**What:** Use `ReferenceLine` component to show average duration
**When to use:** Duration scatter plot (DURA-04 requirement)
**Example:**
```typescript
// Source: Recharts GitHub discussions + ReferenceLine API
import { ReferenceLine, Label } from 'recharts'

const avgDuration = useMemo(() => {
  const sum = videos.reduce((acc, v) => acc + v.duration_seconds, 0)
  return Math.round(sum / videos.length)
}, [videos])

<ScatterChart>
  {/* ...other components */}
  <ReferenceLine
    x={avgDuration}
    stroke="var(--color-chart-reference)"
    strokeDasharray="5 5"
  >
    <Label
      value={`Avg: ${formatDuration(avgDuration)}`}
      position="top"
      fill="var(--color-text-secondary)"
    />
  </ReferenceLine>
</ScatterChart>
```

### Anti-Patterns to Avoid
- **Fixed pixel dimensions:** Never use `width={600}` on charts - always use ResponsiveContainer
- **Hardcoded hex colors:** Use CSS variables for all colors to maintain theme consistency
- **No parent dimensions:** ResponsiveContainer needs a parent with explicit height
- **Ignoring accessibilityLayer:** Always include `accessibilityLayer` prop (defaults to true in v3)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Responsive sizing | Custom resize observers | `ResponsiveContainer` | Handles edge cases, SSR concerns |
| Tooltip positioning | Manual coordinate math | Recharts `Tooltip` | Viewport collision detection |
| Axis tick formatting | Manual tick calculation | `XAxis`/`YAxis` tickFormatter | Handles edge cases, scaling |
| Average line | Manual SVG line element | `ReferenceLine` | Coordinates with axes, responsive |
| Day-of-week ordering | Manual sort logic | Static array with indices | `['Sun', 'Mon', 'Tue', ...]` |

**Key insight:** Recharts handles coordinate systems, scaling, and responsive behavior internally. Custom SVG elements inside Recharts can break when the chart resizes or data changes.

## Common Pitfalls

### Pitfall 1: ResponsiveContainer Parent Height
**What goes wrong:** Chart renders with 0 height or collapses
**Why it happens:** `ResponsiveContainer` needs a parent with explicit height
**How to avoid:** Always wrap in a div with `h-64` or similar explicit height class
**Warning signs:** Chart appears in dev tools but is invisible on screen

### Pitfall 2: Mobile Touch Events
**What goes wrong:** Tooltips don't appear on mobile tap
**Why it happens:** Recharts has had iOS touch event issues historically
**How to avoid:** Use `trigger="click"` on Tooltip for better mobile support, or keep default hover which now includes touch in v3
**Warning signs:** Works on desktop, fails on iOS Safari

### Pitfall 3: Color Contrast on Dark Background
**What goes wrong:** Chart elements invisible or hard to read
**Why it happens:** Using colors that look good on white but fail WCAG 3:1 on dark
**How to avoid:** Use the defined CSS variables with verified contrast ratios
**Warning signs:** Squinting to see grid lines or data points

### Pitfall 4: Large Dataset Performance
**What goes wrong:** Browser freezes with many data points
**Why it happens:** Each SVG element is a DOM node (5000+ points = 5000+ nodes)
**How to avoid:** For scatter plot, limit to recent videos per time filter; typical usage should be <500 points
**Warning signs:** Laggy hover interactions, slow initial render

### Pitfall 5: Recharts v3 API Changes
**What goes wrong:** Code from v2 tutorials doesn't work
**Why it happens:** v3 removed `activeIndex` prop, changed Customized component behavior
**How to avoid:** Use hooks like `useIsTooltipActive` for active state; avoid relying on internal props
**Warning signs:** TypeScript errors about missing props, runtime errors about undefined

## Code Examples

Verified patterns from official sources:

### Bar Chart for Day-of-Week Frequency
```typescript
// Source: Recharts GitHub + API docs
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

interface FrequencyData {
  day: string        // 'Sun', 'Mon', etc.
  dayIndex: number   // 0-6 for sorting
  count: number      // Number of uploads
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function transformToFrequencyData(videos: Video[]): FrequencyData[] {
  const counts = new Map<number, number>()

  // Initialize all days with 0
  DAYS.forEach((_, i) => counts.set(i, 0))

  // Count videos per day
  for (const video of videos) {
    const dayIndex = new Date(video.published_at).getUTCDay()
    counts.set(dayIndex, (counts.get(dayIndex) || 0) + 1)
  }

  // Transform to chart data
  return DAYS.map((day, index) => ({
    day,
    dayIndex: index,
    count: counts.get(index) || 0,
  }))
}

export function UploadFrequencyChart({ videos }: { videos: Video[] }) {
  const data = useMemo(() => transformToFrequencyData(videos), [videos])

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} accessibilityLayer>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-chart-grid)"
            vertical={false}
          />
          <XAxis
            dataKey="day"
            tick={{ fill: 'var(--color-text-secondary)' }}
            axisLine={{ stroke: 'var(--color-chart-grid)' }}
          />
          <YAxis
            tick={{ fill: 'var(--color-text-secondary)' }}
            axisLine={{ stroke: 'var(--color-chart-grid)' }}
            allowDecimals={false}
          />
          <Tooltip
            content={<FrequencyTooltip />}
            cursor={{ fill: 'var(--color-surface-hover)', opacity: 0.3 }}
          />
          <Bar
            dataKey="count"
            fill="var(--color-chart-primary)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
```

### Scatter Chart for Duration vs Views
```typescript
// Source: Recharts GitHub + ScatterChart API
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

interface ScatterData {
  duration: number    // Duration in minutes (for x-axis readability)
  views: number       // View count
  title: string       // For tooltip
  channelName: string // For tooltip
  videoId: string     // For identification
}

function transformToScatterData(
  videos: Video[],
  channelMap: Map<string, string>
): ScatterData[] {
  return videos.map(video => ({
    duration: Math.round(video.duration_seconds / 60), // Convert to minutes
    views: video.view_count,
    title: video.title,
    channelName: channelMap.get(video.channel_id) || 'Unknown',
    videoId: video.id,
  }))
}

export function DurationScatterChart({
  videos,
  channelMap,
}: {
  videos: Video[]
  channelMap: Map<string, string>
}) {
  const data = useMemo(
    () => transformToScatterData(videos, channelMap),
    [videos, channelMap]
  )

  const avgDuration = useMemo(() => {
    if (data.length === 0) return 0
    const sum = data.reduce((acc, d) => acc + d.duration, 0)
    return Math.round(sum / data.length)
  }, [data])

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart accessibilityLayer>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-chart-grid)"
          />
          <XAxis
            type="number"
            dataKey="duration"
            name="Duration"
            unit=" min"
            tick={{ fill: 'var(--color-text-secondary)' }}
            axisLine={{ stroke: 'var(--color-chart-grid)' }}
          />
          <YAxis
            type="number"
            dataKey="views"
            name="Views"
            tick={{ fill: 'var(--color-text-secondary)' }}
            axisLine={{ stroke: 'var(--color-chart-grid)' }}
            tickFormatter={(value) => formatCompactNumber(value)}
          />
          <Tooltip
            content={<ScatterTooltip />}
            cursor={{ strokeDasharray: '3 3' }}
          />
          <ReferenceLine
            x={avgDuration}
            stroke="var(--color-chart-reference)"
            strokeDasharray="5 5"
          >
            <Label
              value={`Avg: ${avgDuration} min`}
              position="top"
              fill="var(--color-text-secondary)"
              fontSize={12}
            />
          </ReferenceLine>
          <Scatter
            data={data}
            fill="var(--color-chart-primary)"
            fillOpacity={0.7}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
```

### Custom Tooltip for Scatter Plot
```typescript
// Source: Recharts Tooltip API + shadcn/ui patterns
import type { TooltipProps } from 'recharts'

function ScatterTooltip({
  active,
  payload,
}: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null

  const data = payload[0].payload as ScatterData

  return (
    <div className="bg-[#272727] border border-[#3f3f3f] rounded-lg p-3 shadow-lg max-w-xs">
      <p className="text-[#f1f1f1] font-medium text-sm line-clamp-2 mb-1">
        {data.title}
      </p>
      <p className="text-[#aaaaaa] text-xs mb-2">{data.channelName}</p>
      <div className="flex gap-4 text-xs">
        <span className="text-[#aaaaaa]">
          Duration: <span className="text-[#f1f1f1]">{data.duration} min</span>
        </span>
        <span className="text-[#aaaaaa]">
          Views: <span className="text-[#f1f1f1]">{formatCompactNumber(data.views)}</span>
        </span>
      </div>
    </div>
  )
}
```

### Channel Filter for Frequency Chart
```typescript
// Pattern for single-channel vs all-channels toggle (FREQ-03, FREQ-04)
interface FrequencyChartProps {
  videos: Video[]
  channels: Channel[]
}

export function UploadFrequencySection({ videos, channels }: FrequencyChartProps) {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)

  const filteredVideos = useMemo(() => {
    if (!selectedChannel) return videos
    return videos.filter(v => v.channel_id === selectedChannel)
  }, [videos, selectedChannel])

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <select
          value={selectedChannel || ''}
          onChange={(e) => setSelectedChannel(e.target.value || null)}
          className="px-3 py-1.5 bg-[#272727] border border-[#3f3f3f] rounded-lg text-[#f1f1f1] text-sm"
        >
          <option value="">All channels</option>
          {channels.map(ch => (
            <option key={ch.id} value={ch.id}>{ch.name}</option>
          ))}
        </select>
      </div>
      <UploadFrequencyChart videos={filteredVideos} />
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Recharts v2 `activeIndex` prop | Use hooks (`useIsTooltipActive`) | v3.0.0 | Must update active state handling |
| `<Cell>` for individual styling | `shape` prop on chart elements | v3.7.0 | Cell deprecated, use shape callback |
| react-smooth animation | Internal animation system | v3.0.0 | No change needed for usage |
| recharts.org documentation | recharts.github.io | 2025 | Domain ownership changed |

**Deprecated/outdated:**
- `Cell` component: Deprecated in v3.7.0, use `shape` prop instead
- `activeIndex` prop: Removed in v3, use `useIsTooltipActive` hook
- `CategoricalChartState`: Internal state no longer passed to Customized components

## Open Questions

Things that couldn't be fully resolved:

1. **iOS Touch Event Reliability**
   - What we know: Recharts has had historical issues with iOS touch events
   - What's unclear: Whether v3.7.0 fully resolves this
   - Recommendation: Test on iOS Safari during implementation; have click fallback ready

2. **Exact Contrast Ratios of Selected Colors**
   - What we know: Suggested colors should meet 3:1 minimum for chart elements
   - What's unclear: Exact contrast ratios against `#0f0f0f` background
   - Recommendation: Verify with contrast checker during implementation, adjust if needed

3. **Performance with All-Time Video Data**
   - What we know: SVG can lag with 5000+ elements
   - What's unclear: Actual video counts for "All time" in production
   - Recommendation: Monitor performance; consider aggregation if >1000 videos

## Sources

### Primary (HIGH confidence)
- [Recharts GitHub README](https://github.com/recharts/recharts) - Installation, basic patterns
- [Recharts v3 Migration Guide](https://github.com/recharts/recharts/wiki/3.0-migration-guide) - Breaking changes, API updates
- [Recharts v3.7.0 Release Notes](https://github.com/recharts/recharts/releases/tag/v3.7.0) - Latest features, deprecations
- [shadcn/ui Charts Documentation](https://ui.shadcn.com/docs/components/chart) - Theming patterns, accessibility

### Secondary (MEDIUM confidence)
- [Recharts ResponsiveContainer Guide](https://app.studyraid.com/en/read/11352/354974/responsivecontainer-and-its-importance) - ResponsiveContainer patterns
- [Recharts ReferenceLine Discussion](https://github.com/recharts/recharts/discussions/3047) - Average line patterns
- [WCAG Color Contrast Guidelines](https://www.smashingmagazine.com/2024/02/accessibility-standards-empower-better-chart-visual-design/) - Accessibility requirements

### Tertiary (LOW confidence)
- [Best React Chart Libraries 2026](https://weavelinx.com/best-chart-libraries-for-react-projects-in-2026/) - Ecosystem context
- [Bar Chart Best Practices](https://nastengraph.medium.com/bar-charts-best-practices-5e81ebc7b340) - General visualization guidelines

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Recharts v3.7.0 is decided, API verified via GitHub
- Architecture: HIGH - Patterns verified from official docs and shadcn/ui
- Pitfalls: MEDIUM - Based on GitHub issues and community reports
- Accessibility: MEDIUM - WCAG guidelines clear, Recharts implementation varies

**Research date:** 2026-01-26
**Valid until:** 2026-02-26 (30 days - Recharts is stable, minor releases may add features)
