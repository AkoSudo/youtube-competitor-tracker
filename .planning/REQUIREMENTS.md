# Requirements: YouTube Competitor Tracker

**Defined:** 2026-01-26
**Core Value:** Spot content opportunities by analyzing competitor performance patterns

## v1.1 Requirements

Requirements for Analytics Dashboard milestone. Each maps to roadmap phases.

### Analytics Foundation

- [ ] **ANLY-01**: User can navigate to dedicated Analytics page from main navigation
- [ ] **ANLY-02**: Analytics page displays dark theme consistent with existing app (#0f0f0f, #272727)
- [ ] **ANLY-03**: Analytics page shows loading skeleton while data loads
- [ ] **ANLY-04**: Analytics page shows empty state when no channels tracked

### Channel Overview

- [ ] **CHAN-01**: User can view all tracked channels as overview cards
- [ ] **CHAN-02**: Each channel card displays subscriber count
- [ ] **CHAN-03**: Each channel card displays total video count (from fetched videos)
- [ ] **CHAN-04**: Each channel card displays latest upload date
- [ ] **CHAN-05**: Channel cards are responsive (grid layout: 1 col mobile, 2 tablet, 3+ desktop)

### Video Sorting

- [ ] **SORT-01**: User can sort videos by most recent (publish date descending)
- [ ] **SORT-02**: User can sort videos by most views (view count descending)
- [ ] **SORT-03**: User can toggle sort direction (ascending/descending)
- [ ] **SORT-04**: Sort selection persists during session
- [ ] **SORT-05**: Current sort criteria is visually indicated

### Time Period Filtering

- [ ] **TIME-01**: User can filter analytics by time period (7 days, 30 days, 90 days, all time)
- [ ] **TIME-02**: Default time period is 30 days
- [ ] **TIME-03**: Time filter applies to all analytics on the page
- [ ] **TIME-04**: Current time filter is visually indicated
- [ ] **TIME-05**: Filtered view shows video count within period

### Upload Frequency Patterns

- [ ] **FREQ-01**: User can view upload frequency as day-of-week distribution
- [ ] **FREQ-02**: Chart shows which days competitors upload most frequently
- [ ] **FREQ-03**: User can view combined frequency across all channels
- [ ] **FREQ-04**: User can filter frequency chart by specific channel
- [ ] **FREQ-05**: Chart displays using colors accessible on dark theme

### Video Duration Analysis

- [ ] **DURA-01**: User can view video duration vs views as scatter plot
- [ ] **DURA-02**: Each dot represents a video (x: duration, y: views)
- [ ] **DURA-03**: User can hover/tap dot to see video details (title, channel)
- [ ] **DURA-04**: Chart includes visual indicator of average duration
- [ ] **DURA-05**: Chart is responsive and readable on mobile

### Polish

- [ ] **POLI-01**: All charts have proper axis labels and legends
- [ ] **POLI-02**: Data freshness indicator shows when data was last fetched
- [ ] **POLI-03**: Empty chart states show helpful messaging
- [ ] **POLI-04**: Charts respect prefers-reduced-motion for animations

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
| ANLY-01 | TBD | Pending |
| ANLY-02 | TBD | Pending |
| ANLY-03 | TBD | Pending |
| ANLY-04 | TBD | Pending |
| CHAN-01 | TBD | Pending |
| CHAN-02 | TBD | Pending |
| CHAN-03 | TBD | Pending |
| CHAN-04 | TBD | Pending |
| CHAN-05 | TBD | Pending |
| SORT-01 | TBD | Pending |
| SORT-02 | TBD | Pending |
| SORT-03 | TBD | Pending |
| SORT-04 | TBD | Pending |
| SORT-05 | TBD | Pending |
| TIME-01 | TBD | Pending |
| TIME-02 | TBD | Pending |
| TIME-03 | TBD | Pending |
| TIME-04 | TBD | Pending |
| TIME-05 | TBD | Pending |
| FREQ-01 | TBD | Pending |
| FREQ-02 | TBD | Pending |
| FREQ-03 | TBD | Pending |
| FREQ-04 | TBD | Pending |
| FREQ-05 | TBD | Pending |
| DURA-01 | TBD | Pending |
| DURA-02 | TBD | Pending |
| DURA-03 | TBD | Pending |
| DURA-04 | TBD | Pending |
| DURA-05 | TBD | Pending |
| POLI-01 | TBD | Pending |
| POLI-02 | TBD | Pending |
| POLI-03 | TBD | Pending |
| POLI-04 | TBD | Pending |

**Coverage:**
- v1.1 requirements: 33 total
- Mapped to phases: 0
- Unmapped: 33 (pending roadmap creation)

---
*Requirements defined: 2026-01-26*
*Last updated: 2026-01-26 after initial definition*
