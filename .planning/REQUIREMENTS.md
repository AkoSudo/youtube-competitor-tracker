# Requirements: YouTube Competitor Tracker

**Defined:** 2026-01-26
**Core Value:** Spot content opportunities by analyzing competitor performance patterns

## v1.1 Requirements

Requirements for Analytics Dashboard milestone. Each maps to roadmap phases.

### Analytics Foundation

- [x] **ANLY-01**: User can navigate to dedicated Analytics page from main navigation
- [x] **ANLY-02**: Analytics page displays dark theme consistent with existing app (#0f0f0f, #272727)
- [x] **ANLY-03**: Analytics page shows loading skeleton while data loads
- [x] **ANLY-04**: Analytics page shows empty state when no channels tracked

### Channel Overview

- [x] **CHAN-01**: User can view all tracked channels as overview cards
- [x] **CHAN-02**: Each channel card displays subscriber count
- [x] **CHAN-03**: Each channel card displays total video count (from fetched videos)
- [x] **CHAN-04**: Each channel card displays latest upload date
- [x] **CHAN-05**: Channel cards are responsive (grid layout: 1 col mobile, 2 tablet, 3+ desktop)

### Video Sorting

- [x] **SORT-01**: User can sort videos by most recent (publish date descending)
- [x] **SORT-02**: User can sort videos by most views (view count descending)
- [x] **SORT-03**: User can toggle sort direction (ascending/descending)
- [x] **SORT-04**: Sort selection persists during session
- [x] **SORT-05**: Current sort criteria is visually indicated

### Time Period Filtering

- [x] **TIME-01**: User can filter analytics by time period (7 days, 30 days, 90 days, all time)
- [x] **TIME-02**: Default time period is 30 days
- [x] **TIME-03**: Time filter applies to all analytics on the page
- [x] **TIME-04**: Current time filter is visually indicated
- [x] **TIME-05**: Filtered view shows video count within period

### Upload Frequency Patterns

- [x] **FREQ-01**: User can view upload frequency as day-of-week distribution
- [x] **FREQ-02**: Chart shows which days competitors upload most frequently
- [x] **FREQ-03**: User can view combined frequency across all channels
- [x] **FREQ-04**: User can filter frequency chart by specific channel
- [x] **FREQ-05**: Chart displays using colors accessible on dark theme

### Video Duration Analysis

- [x] **DURA-01**: User can view video duration vs views as scatter plot
- [x] **DURA-02**: Each dot represents a video (x: duration, y: views)
- [x] **DURA-03**: User can hover/tap dot to see video details (title, channel)
- [x] **DURA-04**: Chart includes visual indicator of average duration
- [x] **DURA-05**: Chart is responsive and readable on mobile

### Polish

- [x] **POLI-01**: All charts have proper axis labels and legends
- [x] **POLI-02**: Data freshness indicator shows when data was last fetched
- [x] **POLI-03**: Empty chart states show helpful messaging
- [x] **POLI-04**: Charts respect prefers-reduced-motion for animations

## Future Requirements

Deferred to later milestones. Tracked but not in current roadmap.

### v1.2 Candidates

- **VELC-01**: User can view video velocity (views per day since publish)
- **COMP-01**: User can compare two channels side-by-side
- **EXPRT-01**: User can export current analytics view as CSV
- **HOUR-01**: User can view upload time-of-day distribution

### v2+ Candidates

- **SNAP-01**: System captures video view snapshots at intervals for accurate velocity
- **INSG-01**: User can add annotations to data points shared with team
- **ALRT-01**: User receives notification when competitor exceeds threshold

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Predicted performance scores | Unreliable; creates false confidence |
| Real-time view updates | API quota exhaustion; YouTube rate limits |
| Revenue estimates | Highly inaccurate; legal concerns |
| Cross-platform analytics | Scope creep; YouTube only per v1.0 decision |
| Historical data beyond 20 videos | API quota; diminishing returns |
| Automated content recommendations | Generic; removes human judgment |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| ANLY-01 | Phase 5 | Complete |
| ANLY-02 | Phase 5 | Complete |
| ANLY-03 | Phase 5 | Complete |
| ANLY-04 | Phase 5 | Complete |
| CHAN-01 | Phase 6 | Complete |
| CHAN-02 | Phase 6 | Complete |
| CHAN-03 | Phase 6 | Complete |
| CHAN-04 | Phase 6 | Complete |
| CHAN-05 | Phase 6 | Complete |
| SORT-01 | Phase 7 | Complete |
| SORT-02 | Phase 7 | Complete |
| SORT-03 | Phase 7 | Complete |
| SORT-04 | Phase 7 | Complete |
| SORT-05 | Phase 7 | Complete |
| TIME-01 | Phase 7 | Complete |
| TIME-02 | Phase 7 | Complete |
| TIME-03 | Phase 7 | Complete |
| TIME-04 | Phase 7 | Complete |
| TIME-05 | Phase 7 | Complete |
| FREQ-01 | Phase 8 | Complete |
| FREQ-02 | Phase 8 | Complete |
| FREQ-03 | Phase 8 | Complete |
| FREQ-04 | Phase 8 | Complete |
| FREQ-05 | Phase 8 | Complete |
| DURA-01 | Phase 8 | Complete |
| DURA-02 | Phase 8 | Complete |
| DURA-03 | Phase 8 | Complete |
| DURA-04 | Phase 8 | Complete |
| DURA-05 | Phase 8 | Complete |
| POLI-01 | Phase 9 | Complete |
| POLI-02 | Phase 9 | Complete |
| POLI-03 | Phase 9 | Complete |
| POLI-04 | Phase 9 | Complete |

**Coverage:**
- v1.1 requirements: 33 total
- Mapped to phases: 33
- Unmapped: 0

---
*Requirements defined: 2026-01-26*
*Last updated: 2026-01-26 - Phase 9 requirements (POLI-*) marked complete - v1.1 milestone complete*
