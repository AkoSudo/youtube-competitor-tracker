# Roadmap: YouTube Competitor Tracker

## Milestones

- v1.0 MVP - Phases 1-4 (shipped 2026-01-24)
- v1.1 Analytics Dashboard - Phases 5-9 (in progress)

## Overview

v1.1 adds analytics capabilities to help users spot content opportunities through competitor performance patterns. The milestone progresses from establishing the analytics foundation (routing, types, chart library) through channel overview cards, video sorting and time filtering, visual charts for upload patterns and duration analysis, and concludes with polish for a production-ready analytics experience. All analytics compute client-side from existing cached video data - no database changes required.

## Phases

<details>
<summary>v1.0 MVP (Phases 1-4) - SHIPPED 2026-01-24</summary>

See `.planning/milestones/v1.0-ROADMAP.md` for full details.

- Phase 1: Foundation
- Phase 2: Channel Management
- Phase 3: Video & Ideas
- Phase 4: Polish

</details>

### v1.1 Analytics Dashboard (In Progress)

**Milestone Goal:** Enable users to analyze competitor performance patterns through visual analytics

- [x] **Phase 5: Foundation** - Analytics page shell, routing, types, chart library setup
- [ ] **Phase 6: Channel Overview** - At-a-glance channel cards with key metrics
- [ ] **Phase 7: Video Analytics** - Sorting and time period filtering for videos
- [ ] **Phase 8: Charts** - Upload frequency and duration analysis visualizations
- [ ] **Phase 9: Polish** - Labels, freshness indicators, empty states, motion

## Phase Details

### Phase 5: Foundation
**Goal**: Users can navigate to a functional analytics page with proper loading and empty states
**Depends on**: Phase 4 (v1.0 complete)
**Requirements**: ANLY-01, ANLY-02, ANLY-03, ANLY-04

**Success Criteria** (what must be TRUE):
1. User can click Analytics link in navigation and arrive at /analytics route
2. Analytics page displays loading skeleton while fetching channel/video data
3. Analytics page shows helpful empty state when user has no tracked channels
4. Analytics page matches existing dark theme (#0f0f0f background, #272727 cards)

**Plans:** 1 plan

Plans:
- [x] 05-01-PLAN.md — Analytics page with routing, navigation, loading skeleton, and empty state

### Phase 6: Channel Overview
**Goal**: Users can see all tracked channels with key performance metrics at a glance
**Depends on**: Phase 5
**Requirements**: CHAN-01, CHAN-02, CHAN-03, CHAN-04, CHAN-05

**Success Criteria** (what must be TRUE):
1. User sees all tracked channels as cards in a responsive grid layout
2. Each channel card displays subscriber count, total video count, and latest upload date
3. Grid adapts from 1 column on mobile to 2 on tablet to 3+ on desktop
4. Channel cards load with skeleton state and transition smoothly to content

**Plans:** 1 plan

Plans:
- [ ] 06-01-PLAN.md — Channel overview cards with responsive grid, aggregated metrics, and skeleton loading

### Phase 7: Video Analytics
**Goal**: Users can sort and filter videos to find patterns across time periods
**Depends on**: Phase 6
**Requirements**: SORT-01, SORT-02, SORT-03, SORT-04, SORT-05, TIME-01, TIME-02, TIME-03, TIME-04, TIME-05

**Success Criteria** (what must be TRUE):
1. User can sort videos by most recent or most views with ascending/descending toggle
2. Current sort criteria is visually indicated and persists during session
3. User can filter analytics by time period (7d, 30d, 90d, all time) with 30d default
4. Time filter applies to all analytics on the page with visual indicator
5. Filtered view shows count of videos within the selected time period

**Plans**: TBD

Plans:
- [ ] 07-01: TBD
- [ ] 07-02: TBD

### Phase 8: Charts
**Goal**: Users can visualize upload frequency patterns and duration vs performance relationships
**Depends on**: Phase 7
**Requirements**: FREQ-01, FREQ-02, FREQ-03, FREQ-04, FREQ-05, DURA-01, DURA-02, DURA-03, DURA-04, DURA-05

**Success Criteria** (what must be TRUE):
1. User can view day-of-week upload frequency chart showing which days competitors post most
2. User can toggle between combined frequency (all channels) and single-channel filter
3. User can view scatter plot of video duration vs views with hover details (title, channel)
4. Scatter plot includes visual indicator of average duration
5. Charts use accessible colors on dark theme and are readable on mobile

**Plans**: TBD

Plans:
- [ ] 08-01: TBD
- [ ] 08-02: TBD

### Phase 9: Polish
**Goal**: Analytics dashboard is production-ready with proper labels, indicators, and accessibility
**Depends on**: Phase 8
**Requirements**: POLI-01, POLI-02, POLI-03, POLI-04

**Success Criteria** (what must be TRUE):
1. All charts have proper axis labels and legends
2. User can see data freshness indicator showing when data was last fetched
3. Empty chart states display helpful messaging (not blank or zero-filled charts)
4. Chart animations respect prefers-reduced-motion setting

**Plans**: TBD

Plans:
- [ ] 09-01: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 3/3 | Complete | 2026-01-23 |
| 2. Channel Management | v1.0 | 3/3 | Complete | 2026-01-23 |
| 3. Video & Ideas | v1.0 | 2/2 | Complete | 2026-01-24 |
| 4. Polish | v1.0 | 4/4 | Complete | 2026-01-24 |
| 5. Foundation | v1.1 | 1/1 | Complete | 2026-01-26 |
| 6. Channel Overview | v1.1 | 0/1 | Not started | - |
| 7. Video Analytics | v1.1 | 0/? | Not started | - |
| 8. Charts | v1.1 | 0/? | Not started | - |
| 9. Polish | v1.1 | 0/? | Not started | - |

---
*Roadmap created: 2026-01-26*
*Milestone: v1.1 Analytics Dashboard*
*Requirements mapped: 33/33*
