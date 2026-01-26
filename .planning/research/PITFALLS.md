# Pitfalls Research

**Domain:** Adding Analytics to YouTube Tracker
**Researched:** 2026-01-26
**Confidence:** HIGH

This document catalogs pitfalls specific to adding analytics/charting features to the existing YouTube Competitor Tracker, which has real-time Supabase subscriptions, 24-hour cached video data, and YouTube API rate limits.

---

## Critical Pitfalls

These mistakes cause rewrites, data corruption, or broken user experiences.

### Pitfall 1: Subscription Leak Cascade

**What goes wrong:** The existing app uses Supabase real-time subscriptions for channels, videos, and ideas. Adding analytics components with their own subscriptions (e.g., for live metric updates) creates cumulative memory leaks. Each navigation between views opens new subscriptions without cleaning up old ones. After 30-60 minutes of active use, the browser consumes 1-2GB of memory and becomes unresponsive.

**Why it happens:** Analytics dashboards often need multiple data streams (channel stats, video performance, trend data). Developers add subscriptions in `useEffect` but:
- Forget cleanup functions in `useEffect` return
- Create subscriptions inside loops or callbacks
- React Strict Mode triggers double-mounting, causing duplicate subscriptions
- The existing `useChannels` pattern uses `Date.now()` for unique channel names, but analytics code may copy this pattern incorrectly

**How to avoid:**
1. Audit all existing subscriptions before adding new ones
2. Create a centralized subscription manager or context that tracks all active subscriptions
3. Use the established pattern from `useChannels.ts` (line 46-85) consistently
4. Test with React DevTools Profiler for memory growth
5. Consider whether analytics truly need real-time updates (24hr cache suggests they don't)

**Warning signs:**
- "Channel is Already Subscribed" errors in console
- Browser memory climbing steadily during session
- Slow UI after extended use
- Multiple subscription callbacks firing for single events

**Phase to address:** Phase 1 (Foundation) - Establish analytics data layer before building any charts

---

### Pitfall 2: YouTube API Quota Exhaustion via Analytics

**What goes wrong:** With only 10,000 daily quota units, adding analytics features that trigger fresh API calls quickly exhausts the quota. A single `search.list` call costs 100 units - meaning only 100 searches per day across all users. Analytics dashboards that "refresh" on load, auto-update, or let users filter by date range can burn through quota within hours.

**Why it happens:** The existing app has a 24-hour cache (`fetchChannelVideos` with `forceRefresh` flag), but analytics features often bypass this:
- "View velocity" calculations tempt developers to fetch current view counts (API call per video)
- "Compare channels" feature might fetch fresh data for all selected channels
- Date range filters might request historical data that isn't cached
- Dashboard auto-refresh intervals calling the API directly

**How to avoid:**
1. Analytics MUST work exclusively from cached Supabase data (videos table)
2. Never add API calls for analytics calculations - use stored `view_count` and `published_at`
3. View velocity = `view_count / hours_since_published` using existing data
4. Upload frequency = aggregate `published_at` from stored videos
5. Add quota tracking/warning if any new API integration is considered
6. Document that analytics are "point-in-time" snapshots, not live YouTube data

**Warning signs:**
- Network tab shows calls to `supabase.functions.invoke('fetch-channel-videos')` when viewing analytics
- "Refresh" buttons or auto-update timers in analytics components
- Any code importing from `lib/youtube.ts` in analytics features

**Phase to address:** Phase 1 (Foundation) - Define data contracts that explicitly prohibit API calls from analytics

---

### Pitfall 3: Cache Invalidation Confusion for Derived Metrics

**What goes wrong:** The app caches video data with 24hr TTL. Analytics computed from this data (averages, trends, rankings) become stale but aren't invalidated when source data refreshes. Users see conflicting numbers - the video list shows updated view counts, but the "top performing videos" chart shows yesterday's ranking.

**Why it happens:** Cache invalidation for aggregated/derived data is notoriously difficult. When a user refreshes channel videos:
- Individual video records update in `videos` table
- But pre-computed analytics (stored in state, localStorage, or computed once) aren't notified
- Charts continue showing stale aggregations
- Users lose trust when numbers don't match

**How to avoid:**
1. Never cache computed analytics separately - compute on-demand from source data
2. Use `useMemo` with proper dependencies that include the source data's `fetched_at` timestamp
3. Display "Data as of [timestamp]" prominently on all analytics
4. When source data refreshes, all derived computations must recompute
5. Consider a "data version" number that increments on any refresh

**Warning signs:**
- Analytics values don't change after manual refresh
- Video list shows different view counts than analytics charts
- "Top video" differs between list view and analytics view
- User reports of "wrong numbers"

**Phase to address:** Phase 2 (Charts) - Build chart components with proper data dependency chains

---

### Pitfall 4: Timezone Display Inconsistency

**What goes wrong:** YouTube's `published_at` is in UTC. The existing app displays videos with `date-fns` formatting. Analytics features like "upload frequency by day of week" or "posting time patterns" can produce completely wrong insights if timezone handling is inconsistent.

**Why it happens:**
- JavaScript `Date` uses local timezone by default
- "Videos published on Monday" depends on WHOSE Monday (creator's, viewer's, or UTC?)
- The existing app stores UTC but may display in local time
- Charts aggregating by day/hour inherit this ambiguity

**How to avoid:**
1. Define explicitly: all analytics use UTC for consistency
2. Or: convert to user's local timezone consistently (requires detecting/storing timezone)
3. Label all time-based charts clearly: "Upload times (UTC)" or "Upload times (Your timezone)"
4. Use `date-fns-tz` or explicit UTC formatting for all date aggregations
5. Test with users in different timezones to verify charts make sense

**Warning signs:**
- "Most videos uploaded on Sunday" when creators clearly post on weekdays
- Off-by-one day errors in upload frequency charts
- Different results when viewing from different timezones
- Hour-based charts showing unusual patterns (e.g., uploads at 3am)

**Phase to address:** Phase 1 (Foundation) - Establish timezone strategy before any time-based analytics

---

### Pitfall 5: Chart Re-render Performance Death Spiral

**What goes wrong:** Chart libraries like Recharts re-render when props change. React's re-render cascade causes charts to redraw on every keystroke, filter change, or unrelated state update. With 100 channels and potentially thousands of video data points, this causes visible lag and dropped frames.

**Why it happens:**
- Chart data arrays recreated on every render (no `useMemo`)
- Chart configuration objects recreated (no stable references)
- Parent component re-renders propagate to chart children
- Real-time subscriptions trigger state updates that cascade to charts
- SVG-based charts (Recharts default) struggle with large datasets

**How to avoid:**
1. Memoize chart data with `useMemo`, including transformation logic
2. Memoize chart configuration objects
3. Isolate chart components with `React.memo`
4. Consider Canvas-based rendering for charts with 1000+ data points
5. Profile BEFORE optimizing - don't add `useMemo` everywhere preemptively
6. Debounce filter inputs that affect chart data
7. Virtualize or paginate if showing many charts

**Warning signs:**
- Visible chart flicker on typing in search/filter
- React DevTools Profiler shows chart components re-rendering frequently
- High "Rendering" time in DevTools Performance tab
- User complaints about laggy interface

**Phase to address:** Phase 2 (Charts) - Implement with memoization from the start, but measure to verify

---

### Pitfall 6: Dark Theme Chart Accessibility Failures

**What goes wrong:** The app uses YouTube's dark theme (#0f0f0f background). Default chart library colors are designed for light backgrounds. Charts become unreadable - data series blend together, axis labels disappear, legends are invisible.

**Why it happens:**
- Most chart libraries assume light backgrounds
- Simple color inversion doesn't work (saturated colors look wrong on dark)
- Contrast ratios that pass on light fail on dark
- Multi-series charts need distinguishable colors that all work on #0f0f0f
- Text on chart elements may fall below 4.5:1 contrast ratio

**How to avoid:**
1. Create a dedicated dark-mode color palette for charts (don't just invert)
2. Test contrast ratios: lines/bars need 3:1 against background, text needs 4.5:1
3. Use visual separators between adjacent data (2px borders on bar charts)
4. Limit to 3-5 distinguishable colors per chart
5. Add patterns/textures in addition to color for accessibility
6. Test with color blindness simulators
7. Use slightly desaturated colors (bright neons are harsh on dark backgrounds)

**Warning signs:**
- "I can't see the difference between these lines" feedback
- Squinting required to read axis labels
- Chart colors that look good individually but blend together
- Pie/donut chart segments that look identical

**Phase to address:** Phase 1 (Foundation) - Define chart color palette before building any charts

---

### Pitfall 7: Misleading Empty/Zero States

**What goes wrong:** Analytics showing "0 views" or empty charts when data hasn't loaded yet (vs. when data is truly zero/empty) misleads users. A channel with no cached videos shows "Average views: 0" instead of "No data available."

**Why it happens:**
- Default numeric value is 0/undefined
- Loading states show skeleton, but once "loaded" with empty array, shows computed "0"
- "No videos" vs "videos haven't been fetched" is ambiguous
- Divide by zero in averages produces NaN which renders strangely

**How to avoid:**
1. Distinguish between: loading, loaded-empty, loaded-with-data, error
2. For new channels, show "Fetch videos to see analytics" not zeros
3. Guard against divide-by-zero: `videos.length > 0 ? sum/count : null`
4. Display "N/A" or "Insufficient data" for incalculable metrics
5. Show "Data from X videos" count so users know sample size
6. Never show a chart with all-zero data - show an empty state instead

**Warning signs:**
- Analytics showing 0 for freshly added channels
- NaN appearing in the UI
- Users confused about whether analytics are "working"
- Charts rendering flat lines at zero

**Phase to address:** Phase 2 (Charts) - Every chart must have loading, empty, and populated states

---

## Performance Traps

Patterns that work at small scale but fail as usage grows (100 channels, 5000 ideas).

### Trap 1: Computing Analytics on Every Render

**Symptoms:** Acceptable performance with 5 channels, noticeable lag with 20, unusable with 50.

**Root cause:** Calculating aggregations (avg views, upload frequency, duration distribution) inline without memoization. With 100 channels x 50 videos each = 5000 videos to process on every render.

**Solution:**
- Compute aggregations in `useMemo` with video array as dependency
- Consider pre-computing aggregations on data fetch, storing in state
- For cross-channel analytics, aggregate at the channel level first

### Trap 2: Rendering All Data Points

**Symptoms:** Charts that are smooth with 100 data points but freeze with 1000.

**Root cause:** SVG-based charts rendering individual elements for each data point. A scatter plot with 5000 points creates 5000 SVG circles.

**Solution:**
- Data decimation: sample or aggregate to max 200-500 points per chart
- Canvas rendering for large datasets
- Show aggregated view (weekly instead of daily) by default, allow drill-down

### Trap 3: Unthrottled Real-time Updates to Charts

**Symptoms:** Chart flickers and browser becomes unresponsive during active real-time sync.

**Root cause:** Supabase real-time can fire multiple events per second during bulk operations. Each event triggers state update, triggering chart re-render.

**Solution:**
- Batch real-time updates: collect for 200-500ms before applying
- Or: don't use real-time for analytics - refresh on demand only
- Debounce chart updates separately from list updates

### Trap 4: Loading All Videos for Cross-Channel Analytics

**Symptoms:** "Compare all channels" view takes 30+ seconds to load, memory spikes.

**Root cause:** Fetching all videos from all channels into memory simultaneously.

**Solution:**
- Paginate or virtualize channel comparisons
- Pre-aggregate channel-level stats in the database
- "Top 10 channels by X" instead of "All 100 channels compared"

---

## UX Pitfalls

Common analytics dashboard UX mistakes to avoid.

### Pitfall: Information Overload on First View

**Mistake:** Dashboard shows 10 charts, 20 metrics, 5 filters immediately.
**Better:** Progressive disclosure - summary stats first, expand for details.

### Pitfall: Filters That Reset Unexpectedly

**Mistake:** Navigating away and back resets all filter selections.
**Better:** Persist filter state in URL params or localStorage.

### Pitfall: No Explanation of Metrics

**Mistake:** Showing "View Velocity: 1,234" without explaining what that number means.
**Better:** Tooltips or info icons explaining each metric's calculation and significance.

### Pitfall: Inconsistent Number Formatting

**Mistake:** "1234567" views in one place, "1.2M" in another.
**Better:** Consistent formatting (use existing `formatters.ts` patterns throughout).

### Pitfall: Charts Without Context

**Mistake:** Line chart showing "views over time" without comparison baseline.
**Better:** Show channel average, competitor comparison, or trend indicators.

### Pitfall: Misleading Y-Axis Scales

**Mistake:** Y-axis starting at non-zero making small differences look dramatic.
**Better:** Start at zero by default, or clearly indicate truncated axis.

### Pitfall: No Data Freshness Indicator

**Mistake:** Users don't know if they're seeing current data or week-old cache.
**Better:** "Last updated: 3 hours ago" prominently displayed.

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

### Chart Implementation
- [ ] Has loading skeleton state
- [ ] Has empty state (no data) distinct from zero values
- [ ] Has error state
- [ ] Properly memoized to prevent re-render cascade
- [ ] Tested with maximum expected data volume (100 channels)
- [ ] Colors meet contrast requirements on #0f0f0f background
- [ ] Responsive at mobile breakpoints
- [ ] Accessible to screen readers (has aria labels or description)

### Analytics Calculation
- [ ] Handles divide-by-zero gracefully
- [ ] Handles null/undefined input values
- [ ] Documented what the metric means
- [ ] Specifies timezone for time-based calculations
- [ ] Uses cached data only (no new API calls)
- [ ] Recomputes when source data refreshes

### Data Integration
- [ ] No new Supabase subscriptions (or properly cleaned up)
- [ ] No YouTube API calls
- [ ] Tested with stale cache (>24hr old data)
- [ ] Tested with fresh cache (just refreshed data)
- [ ] Doesn't break existing real-time sync

### User Experience
- [ ] Metric has explanation/tooltip
- [ ] Filter state persists on navigation
- [ ] Loading time acceptable (<500ms for initial render)
- [ ] Works with 0 channels (new user state)
- [ ] Works with 1 channel
- [ ] Works with 100 channels
- [ ] Clear indication of data freshness

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Data aggregation layer | Cache invalidation confusion | Compute on-demand, never store derived data |
| Chart component library | Performance with scale | Start with memoization, profile early |
| Upload frequency charts | Timezone bugs | Define UTC strategy upfront, label clearly |
| View velocity metric | API quota temptation | Document that it uses stored data only |
| Duration analysis | Chart color accessibility | Create dark theme palette first |
| Cross-channel comparison | Memory/performance issues | Limit comparisons, pre-aggregate |
| Real-time updates | Subscription leaks | Audit existing subscriptions, centralize |
| Filter UI | State persistence | Use URL params from the start |

---

## Sources

### Performance and Memory
- [React Memory Leaks - FreeCodeCamp](https://www.freecodecamp.org/news/fix-memory-leaks-in-react-apps/)
- [5 React Memory Leaks - CodeWalnut](https://www.codewalnut.com/insights/5-react-memory-leaks-that-kill-performance)
- [Recharts Performance Guide](https://recharts.github.io/en-US/guide/performance/)
- [Recharts GitHub Issue #281 - Deep Compare Performance](https://github.com/recharts/recharts/issues/281)

### Supabase Real-time
- [Supabase Realtime Channel Already Subscribed](https://drdroid.io/stack-diagnosis/supabase-realtime-channel-already-subscribed)
- [React Strict Mode Subscription Issues - GitHub](https://github.com/supabase/realtime-js/issues/169)
- [Multiple Subscriptions on Same Table - GitHub](https://github.com/supabase/supabase-js/issues/419)

### YouTube API
- [YouTube API Limits and Quota - Phyllo](https://www.getphyllo.com/post/youtube-api-limits-how-to-calculate-api-usage-cost-and-fix-exceeded-api-quota)
- [YouTube API Quota Guide - GetLate](https://getlate.dev/blog/youtube-api-limits-how-to-calculate-api-usage-cost-and-fix-exceeded-api-quota)
- [YouTube Data API Overview - Google Developers](https://developers.google.com/youtube/v3/getting-started)

### Data Quality and Caching
- [Stale Data Leads to Bad Decisions - Metaplane](https://www.metaplane.dev/blog/stale-data-leads-to-bad-business-decisions)
- [Common Data Aggregation Mistakes - Intertrust](https://www.intertrust.com/blog/data-aggregation-mistakes/)
- [Cache Invalidation Strategies - Medium](https://medium.com/@shivanimutke2501/day-48-system-design-concept-cache-invalidation-strategies-de15e32020cf)

### Visualization and Accessibility
- [Dark Mode Data Visualization - Medium](https://ananyadeka.medium.com/implementing-dark-mode-for-data-visualizations-design-considerations-66cd1ff2ab67)
- [Color Palettes for Data Viz - Carbon Design](https://medium.com/carbondesign/color-palettes-and-accessibility-features-for-data-visualization-7869f4874fca)
- [Data Viz Color Contrast - Data Soapbox](https://datasoapbox.com/color-contrast/)

### Timezones
- [Database Timestamps Best Practices - Tinybird](https://www.tinybird.co/blog/database-timestamps-timezones)
- [Metabase Timezone Documentation](https://www.metabase.com/docs/latest/configuring-metabase/timezones)

### UX Patterns
- [Empty State UX - Toptal](https://www.toptal.com/designers/ux/empty-state-ux-design)
- [UI/UX Mistakes with Loading States - DM Letter Studio](https://dmletterstudio.com/ui-ux-mistakes-with-loading-states/)
- [Empty States Pattern - Carbon Design System](https://carbondesignsystem.com/patterns/empty-states-pattern/)
