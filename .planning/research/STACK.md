# Stack Research

**Domain:** React Analytics Dashboard
**Researched:** 2026-01-26
**Confidence:** HIGH

## Recommended Stack

### Core Chart Library

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Recharts | ^3.7.0 | All chart types (line, bar, area, pie) | React-native composable components, SVG-based for CSS variable theming, works with React 18/19, 7M+ weekly npm downloads, excellent TypeScript support |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| date-fns | ^4.1.0 (already installed) | Format dates for chart axis labels | Upload frequency patterns, time-series charts |
| recharts | ^3.7.0 | All chart visualization | LineChart, BarChart, AreaChart, PieChart components |

### No New Dependencies Needed For

| Feature | Existing Solution | Notes |
|---------|-------------------|-------|
| Date formatting | date-fns ^4.1.0 | Already installed, use `format()` for axis labels |
| Duration parsing | iso8601-duration ^2.1.3 | Already installed for video duration analysis |
| Toast notifications | sonner ^1.7.0 | Already installed for analytics action feedback |

## Installation

```bash
# Only new dependency needed
npm install recharts
```

That's it. One dependency.

## Why Recharts Over Alternatives

### Recharts (RECOMMENDED)

**Strengths:**
- Composable React components (not wrapper library)
- SVG-based rendering = CSS variable support for dark theme
- Excellent React 18+ compatibility (v3.7.0 released Jan 2025)
- Strong TypeScript support with exported types
- Most popular React chart library (7M weekly downloads)
- Smooth learning curve

**For This Project:**
- Dark theme via CSS variables: `fill="var(--color-chart-1)"` works directly
- Matches React component patterns already in codebase
- No configuration file needed (unlike Chart.js)

### Chart.js + react-chartjs-2 (NOT RECOMMENDED)

**Why Not:**
- Canvas-based rendering = CSS variables don't work directly
- Requires manual theme config object for dark mode
- Extra wrapper library (react-chartjs-2)
- Imperative configuration pattern doesn't match React patterns

### Nivo (ALTERNATIVE)

**Why Not Primary:**
- More opinionated theming system (requires theme object)
- Heavier bundle size
- Better for highly styled/branded dashboards
- Currently at v0.99.0 (pre-1.0)

**When to Consider:**
- If needing specialized charts (calendar, waffle, chord diagrams)
- If building standalone visualization product

### Tremor (NOT COMPATIBLE)

**Why Not:**
- @tremor/react npm package requires Tailwind CSS v3.4+
- Project uses Tailwind CSS v4.0
- Compatibility issue confirmed in GitHub discussion #1010
- Would require downgrading Tailwind or using copy-paste approach

### shadcn/ui Charts (ALTERNATIVE APPROACH)

**Why Not Primary:**
- Built on Recharts (same underlying library)
- Requires shadcn/ui initialization and component structure
- Adds complexity for just charts
- Better if already using shadcn/ui for other components

**When to Consider:**
- If planning to adopt shadcn/ui for other UI components
- If wanting pre-styled chart components

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| @tremor/react | Requires Tailwind v3.4+, project uses v4.0 | Recharts directly |
| Chart.js | Canvas-based, CSS variables don't work for theming | Recharts (SVG-based) |
| D3.js directly | Too low-level, requires significant boilerplate | Recharts (built on D3) |
| Victory | Less active development, smaller community | Recharts |
| visx | Steeper learning curve, too low-level for simple dashboards | Recharts (unless needing custom viz) |

## Integration Notes

### Dark Theme Integration

Recharts SVG components accept CSS variables directly:

```tsx
// Works with existing CSS custom properties in index.css
<Line
  stroke="var(--color-accent)"  // #ff0000 from :root
  fill="var(--color-surface)"   // #272727 from :root
/>

// Or define chart-specific colors
<BarChart>
  <Bar fill="var(--color-chart-primary)" />
  <Bar fill="var(--color-chart-secondary)" />
</BarChart>
```

Add chart colors to `src/index.css`:

```css
:root {
  /* Existing colors... */

  /* Chart-specific colors (YouTube-inspired) */
  --color-chart-primary: #ff0000;    /* YouTube red */
  --color-chart-secondary: #065fd4;  /* YouTube blue */
  --color-chart-tertiary: #2ba640;   /* YouTube green */
  --color-chart-quaternary: #ff9000; /* Orange accent */
  --color-chart-muted: #606060;      /* Muted gray */
}
```

### Tailwind CSS v4 Compatibility

Recharts has no Tailwind dependency - it's pure React/SVG. Works perfectly alongside Tailwind v4:

- Chart container sizing via Tailwind classes: `className="w-full h-64"`
- Responsive wrapper: use Recharts `ResponsiveContainer`
- No configuration file conflicts

### React 18 Patterns

Recharts v3.7.0 fully supports React 18:

```tsx
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// Composable pattern matches existing component style
export function UploadFrequencyChart({ data }: { data: ChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="date" stroke="var(--color-text-secondary)" />
        <YAxis stroke="var(--color-text-secondary)" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)'
          }}
        />
        <Line
          type="monotone"
          dataKey="uploads"
          stroke="var(--color-accent)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

### Chart Types for Project Features

| Feature | Chart Type | Recharts Components |
|---------|------------|---------------------|
| Channel performance overview | Metric cards (no chart) | N/A - use existing components |
| Video views ranking | Horizontal bar chart | `BarChart`, `Bar`, `layout="vertical"` |
| Upload frequency patterns | Line/Area chart | `LineChart` or `AreaChart` |
| Video duration distribution | Bar chart or histogram | `BarChart`, `Bar` |
| View velocity (growth) | Area chart with gradient | `AreaChart`, `Area`, `linearGradient` |

### Performance Considerations

Recharts is SVG-based, which can slow down with thousands of data points. For this project:

- YouTube API returns max 50 videos per channel
- Tracking ~5-10 channels = 250-500 data points max
- Well within Recharts comfortable range (issues start at 1000+)

No performance optimizations needed for expected data volumes.

## Sources

**Recharts (HIGH confidence - official + npm):**
- [GitHub Releases - v3.7.0](https://github.com/recharts/recharts/releases) - Latest version Jan 21, 2025
- [npm registry](https://www.npmjs.com/package/recharts) - 7M+ weekly downloads

**Tremor Compatibility (HIGH confidence - GitHub discussion):**
- [GitHub Discussion #1010](https://github.com/tremorlabs/tremor-npm/discussions/1010) - Tailwind v4 incompatibility confirmed

**shadcn/ui Charts (HIGH confidence - official docs):**
- [shadcn/ui Chart Component](https://ui.shadcn.com/docs/components/chart) - Built on Recharts
- [shadcn/ui Tailwind v4 Guide](https://ui.shadcn.com/docs/tailwind-v4) - Full v4 support

**React Chart Library Comparisons (MEDIUM confidence - multiple sources):**
- [LogRocket Best React Chart Libraries 2025](https://blog.logrocket.com/best-react-chart-libraries-2025/)
- [Technostacks React Chart Libraries 2026](https://technostacks.com/blog/react-chart-libraries/)

**Dark Theme Implementation (MEDIUM confidence - community patterns):**
- [Reshaped Recharts Guidelines](https://www.reshaped.so/docs/getting-started/guidelines/recharts) - CSS variable usage

## Summary

**Add one dependency:** `recharts ^3.7.0`

**Rationale:**
1. SVG-based = CSS variables work for dark theme
2. React-native components match existing codebase patterns
3. React 18 fully supported (v3.7.0 released Jan 2025)
4. Works alongside Tailwind v4 (no configuration conflicts)
5. date-fns already installed for date formatting
6. Most popular React chart library with excellent TypeScript support

**Skip Tremor** (Tailwind v4 incompatible), **skip Chart.js** (canvas-based, no CSS variable support), **skip shadcn/ui charts** (adds complexity just for charts).
