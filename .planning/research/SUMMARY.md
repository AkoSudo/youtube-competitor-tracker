# Research Summary

**Project:** YouTube Competitor Tracker v1.1 Analytics Dashboard
**Domain:** React Analytics Dashboard
**Synthesized:** 2026-01-26
**Confidence:** HIGH

## Executive Summary

Adding analytics to YouTube Competitor Tracker is a low-risk, high-value enhancement. The existing React/Supabase architecture already contains all the data needed (channels and videos tables with view counts, durations, and publish dates). The recommended approach is to add a single dependency (Recharts v3.7.0), create pure calculation functions in a new `lib/analytics.ts`, and build chart components that derive metrics on-demand from cached data. No database schema changes are required for the v1.1 feature set.

The key risks are performance degradation from unmemoized calculations with larger datasets and YouTube API quota exhaustion if analytics inadvertently trigger fresh data fetches. Both are preventable: use `useMemo` consistently for all derived calculations, and enforce a strict rule that analytics code never imports from the YouTube API layer. The 24-hour video cache already in place provides sufficient data freshness for competitive analysis.

The proposed features align well with industry expectations. Channel overview cards, video sorting, upload frequency patterns, and duration analysis are all table stakes or strong differentiators. View velocity (views/day since publish) can be approximated from existing data without schema changes. Team-shared insights and content gap analysis should be deferred to v2+ as they require significant new infrastructure.

## Stack Additions

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| Recharts | ^3.7.0 | All chart visualization | SVG-based (CSS variables work for dark theme), React-native composable components, 7M+ weekly npm downloads, React 18 fully supported |

**No new dependencies needed for:** Date formatting (date-fns already installed), duration parsing (iso8601-duration already installed), notifications (sonner already installed).

**Skip:** Tremor (requires Tailwind v3.4, project uses v4.0), Chart.js (canvas-based, no CSS variable support), shadcn/ui charts (adds complexity just for charts).

## Feature Table Stakes

Features users expect from any analytics dashboard:

| Feature | Complexity | Notes |
|---------|------------|-------|
| Channel Overview Cards | Low | Subscriber count, video count, latest upload per channel |
| Video Sorting (Recent/Views) | Low | Most recent, most views, ascending/descending toggle |
| Basic Metrics Display | Low | Views, duration, publish date (already in v1.0) |
| Time Period Filtering | Medium | 7/30/90 days, all time - client-side filter on published_at |
| Cross-Channel Comparison | Medium | Side-by-side benchmarking - core use case |
| Export Data (CSV) | Low | Teams need to share insights in reports |

## Key Differentiators

Features that set this product apart:

| Feature | Complexity | Value |
|---------|------------|-------|
| Upload Frequency Patterns | Medium | Reveals competitor posting schedules; helps teams plan content calendar |
| Video Duration Analysis | Medium | Shows what video lengths perform for each competitor |
| View Velocity (Simple) | Low | Views per day since publish - uses existing data, no schema change |

**Defer to v2+:** Accurate view velocity (requires historical snapshots), team-shared insights (requires new table + real-time sync), content gap identification (requires NLP/AI).

## Architecture Approach

The existing codebase follows a clean pattern: custom hooks for data fetching with real-time subscriptions, presentational components, and a thin service layer. Analytics integrates naturally by extending these patterns:

**New Layer Structure:**
1. **`lib/analytics.ts`** - Pure calculation functions (no side effects)
2. **Analytics hooks** - `useChannelAnalytics`, `useVideoSorting`, `useUploadPatterns`, `useDurationAnalysis`, `useViewVelocity` - all using `useMemo`
3. **Chart components** - `UploadFrequencyChart`, `DurationDistributionChart`, `ViewVelocityChart` using Recharts
4. **`AnalyticsPage`** - New route at `/analytics` coordinating data and components

**Key decisions:**
- Client-side calculation (sufficient for <100 data points per channel)
- No new database tables or views required
- No new Supabase subscriptions (analytics don't need real-time)
- Compute on-demand from existing cached video data

## Critical Pitfalls

| Pitfall | Risk | Prevention |
|---------|------|------------|
| **YouTube API Quota Exhaustion** | Critical | Analytics MUST work exclusively from cached Supabase data. Never add API calls for analytics calculations. View velocity = view_count / hours_since_published using existing stored data. |
| **Cache Invalidation Confusion** | Critical | Never cache computed analytics separately. Use `useMemo` with proper dependencies including source data's `fetched_at`. Display "Data as of [timestamp]" on all analytics. |
| **Chart Re-render Performance** | High | Memoize chart data with `useMemo`. Isolate chart components with `React.memo`. Profile before optimizing but start with memoization. |
| **Timezone Display Inconsistency** | High | Define explicitly: all analytics use UTC for consistency. Label all time-based charts clearly: "Upload times (UTC)". |
| **Dark Theme Chart Accessibility** | Medium | Create dedicated dark-mode color palette. Test contrast ratios (3:1 for lines/bars, 4.5:1 for text). Limit to 3-5 distinguishable colors per chart. |
| **Misleading Empty/Zero States** | Medium | Distinguish between loading, loaded-empty, loaded-with-data, error. Never show a chart with all-zero data. Display "Data from X videos" count. |

## Recommended Phase Structure

### Phase 1: Foundation
**Rationale:** Establishes calculation layer and routing before any visual components. Defines timezone strategy and data contracts upfront.
**Delivers:** Analytics page shell, pure calculation functions, type definitions, chart color palette
**Addresses:** Navigation to analytics, data layer setup
**Avoids:** Cache invalidation confusion (by establishing compute-on-demand pattern), timezone bugs (by defining UTC strategy upfront), dark theme accessibility (by defining palette first)

**Build order:**
1. `lib/analytics.ts` - Pure calculation functions
2. `lib/types.ts` additions - Analytics types
3. `lib/formatters.ts` additions - Analytics formatters
4. Chart color palette in `index.css`
5. `AnalyticsPage` shell with route
6. `Nav.tsx` modification

### Phase 2: Channel Overview
**Rationale:** Highest value with no external dependencies. Users see actionable data quickly.
**Delivers:** At-a-glance competitive awareness across all tracked channels
**Addresses:** Channel overview cards (table stakes)
**Uses:** Existing channels/videos data

**Build order:**
1. `useAnalyticsData` hook
2. `useChannelAnalytics` hook
3. `ChannelOverviewCard` component
4. `ChannelOverviewSkeleton` component
5. `ChannelOverviewGrid` component

### Phase 3: Video Sorting
**Rationale:** Quick win reusing existing VideoGrid/VideoCard. Minimal new UI, high utility.
**Delivers:** Multi-criteria video sorting with sort controls
**Addresses:** Video sorting (table stakes)

**Build order:**
1. `useVideoSorting` hook
2. `SortControls` component
3. `VideoAnalyticsGrid` component

### Phase 4: Charts
**Rationale:** Highest complexity, builds on foundation. Each chart is independent, can be delivered incrementally.
**Delivers:** Upload frequency chart, duration distribution chart, view velocity chart
**Addresses:** Upload frequency patterns, duration analysis, view velocity (differentiators)
**Uses:** Recharts library

**Build order:**
1. Install Recharts
2. `AnalyticsCard` wrapper component
3. `ChartSkeleton` component
4. `useUploadPatterns` hook + `UploadFrequencyChart`
5. `useDurationAnalysis` hook + `DurationDistributionChart`
6. `useViewVelocity` hook + `ViewVelocityChart`

### Phase 5: Polish
**Rationale:** Final touches after core functionality proven
**Delivers:** Time period filtering, data freshness indicators, CSV export
**Addresses:** Time period filter (table stakes), export data (table stakes)

**Build order:**
1. Time period filter component
2. Data freshness display
3. CSV export functionality

### Phase Ordering Rationale

- **Foundation first:** All charts and components depend on calculation layer and types
- **Channel overview before charts:** Provides immediate value without Recharts dependency
- **Sorting before charts:** Quick win that validates data flow patterns
- **Charts grouped together:** All depend on Recharts, can be built incrementally
- **Polish last:** Refinements after core proven

### Research Flags

**Phases with standard patterns (skip research-phase):**
- Phase 1 (Foundation): Well-established React patterns, existing codebase conventions
- Phase 2 (Channel Overview): Standard component composition
- Phase 3 (Video Sorting): Standard sorting patterns

**Phases that may need verification during implementation:**
- Phase 4 (Charts): Recharts responsive container behavior on mobile breakpoints should be tested early

## Open Questions

1. **Time period filter scope:** Should filtering apply to all charts simultaneously or per-chart?
2. **Chart interactivity:** Click on chart data point to see video details? Or keep charts display-only?
3. **Mobile layout:** Stack charts vertically or use tabs on mobile?

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Official npm registry, GitHub releases, compatibility verified |
| Features | HIGH | Industry tools (VidIQ, TubeBuddy, Social Blade) validated feature categories |
| Architecture | HIGH | Based on existing codebase patterns, standard React patterns |
| Pitfalls | HIGH | Multiple sources, common patterns in analytics dashboards |

**Overall confidence:** HIGH

### Gaps to Address

- **Mobile chart responsiveness:** Recharts ResponsiveContainer behavior needs testing on actual mobile devices
- **Chart color palette:** Specific hex values for dark theme need design validation
- **Export format:** CSV is clear, but exact columns/formatting to be determined during implementation

## Sources

### Primary (HIGH confidence)
- Recharts GitHub Releases v3.7.0 (Jan 2025)
- npm registry (7M+ weekly downloads)
- Existing codebase review (hooks, components, service layer patterns)

### Secondary (MEDIUM confidence)
- VidIQ, TubeBuddy, Social Blade feature comparisons
- React architecture pattern articles (Bacancy, SayOne, GeeksforGeeks)
- LogRocket React chart library comparison 2025

### Tertiary (validated during implementation)
- Dark mode data visualization patterns
- Timezone handling best practices

---
*Research completed: 2026-01-26*
*Synthesized from: STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md*
*Ready for roadmap: yes*
