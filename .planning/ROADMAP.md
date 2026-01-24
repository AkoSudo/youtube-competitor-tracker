# Roadmap

> YouTube Competitor Tracker v1.0

## Milestone 1: MVP Release

### Phase 1: Foundation ✓ COMPLETE

**Goal:** Project scaffolding with Supabase integration, channel CRUD, and real-time sync

**Status:** Complete (2026-01-23)
**Plans:** 8/8 complete

Plans:
- [x] 01-01-PLAN.md — Project scaffold with Vite + React + Tailwind + dark theme
- [x] 01-02-PLAN.md — YouTube URL parser (TDD)
- [x] 01-03-PLAN.md — Supabase client + database schema
- [x] 01-04-PLAN.md — Navigation + routing setup
- [x] 01-05-PLAN.md — Channel CRUD + real-time sync hook
- [x] 01-06-PLAN.md — Channel UI components (Card, Grid, ConfirmDialog)
- [x] 01-07-PLAN.md — AddChannelForm + ChannelsPage integration
- [x] 01-08-PLAN.md — Final verification checkpoint

**Deliverables:**
- React 18 + Vite project with Tailwind CSS configured
- Supabase client setup with environment variables
- `channels` table with RLS policies
- Add channel by URL (with URL parsing for all formats)
- Channel grid with responsive layout
- Delete channel with confirmation and cascade
- Real-time subscription for channel changes
- Dark theme base styling
- Navigation structure (Channels, Ideas)
- Toast notification system

**Requirements Covered:**
- REQ-CH-001, REQ-CH-002, REQ-CH-003, REQ-CH-004, REQ-CH-005, REQ-CH-006, REQ-CH-007
- REQ-TC-001, REQ-TC-002, REQ-TC-003, REQ-TC-005, REQ-TC-006, REQ-TC-007
- REQ-DM-001
- REQ-UI-001, REQ-UI-002, REQ-UI-004, REQ-UI-006

**Success Criteria:**
- [x] Can add channel via URL (all 4 formats work)
- [x] Channels display in responsive grid
- [x] Delete removes channel and shows in real-time for other users
- [x] Dark theme applied consistently

---

### Phase 2: Video Retrieval ✓ COMPLETE

**Goal:** YouTube API integration with video fetching, Shorts filtering, and display

**Status:** Complete (2026-01-24)
**Plans:** 6/6 complete

Plans:
- [x] 02-01-PLAN.md — Database schema + types + dependencies (Wave 1)
- [x] 02-02-PLAN.md — Edge Function for YouTube API (Wave 2)
- [x] 02-03-PLAN.md — useChannelVideos hook + data layer (Wave 2)
- [x] 02-04-PLAN.md — VideoCard + VideoGrid components (Wave 3)
- [x] 02-05-PLAN.md — ChannelDetailPage + routing + navigation (Wave 3)
- [x] 02-06-PLAN.md — Verification checkpoint (Wave 4)

**Deliverables:**
- YouTube Data API v3 integration (server-side via Supabase Edge Functions)
- `videos` table with channel foreign key
- Fetch channel's uploads playlist
- Batch fetch video details
- Filter videos by duration (>= 180 seconds)
- Channel detail page with video grid
- Video card component with all metadata
- View count and date formatting utilities
- Manual refresh functionality
- Video caching with 24hr auto-refresh

**Requirements Covered:**
- REQ-VID-001, REQ-VID-002, REQ-VID-003, REQ-VID-004, REQ-VID-005, REQ-VID-006, REQ-VID-007, REQ-VID-008
- REQ-DM-002

**Success Criteria:**
- [x] Clicking channel shows its videos
- [x] Only videos >= 3 minutes displayed
- [x] Video metadata (thumbnail, duration, views, date) displays correctly
- [x] Click opens YouTube in new tab
- [x] Refresh button updates videos

---

### Phase 3: Ideas System ✓ COMPLETE

**Goal:** Full ideas management with save modal, ideas page, and real-time sync

**Status:** Complete (2026-01-24)
**Plans:** 5/5 complete

Plans:
- [x] 03-01-PLAN.md — Database schema + types (Wave 1)
- [x] 03-02-PLAN.md — Data layer + useIdeas hook (Wave 2)
- [x] 03-03-PLAN.md — SaveIdeaModal + ChannelDetailPage integration (Wave 3)
- [x] 03-04-PLAN.md — IdeaCard + IdeasPage with filtering (Wave 3)
- [x] 03-05-PLAN.md — Verification checkpoint (Wave 4)

**Deliverables:**
- `ideas` table with video foreign key
- Save idea modal with note field
- Ideas page with chronological list
- Idea card component
- Delete idea with confirmation
- Real-time subscription for idea changes
- Toast notifications for teammate's new ideas
- Channel filter dropdown
- Search box for filtering
- "My Ideas" toggle

**Requirements Covered:**
- REQ-IDX-001, REQ-IDX-002, REQ-IDX-003, REQ-IDX-004, REQ-IDX-005, REQ-IDX-006, REQ-IDX-007, REQ-IDX-008
- REQ-DM-003

**Success Criteria:**
- [x] Can save idea with note from any video
- [x] Ideas page shows all ideas with source context
- [x] Delete works with real-time sync
- [x] Filter by channel works
- [x] Search filters by note/title

---

### Phase 4: Polish ✓ COMPLETE

**Goal:** Loading states, empty states, error handling, and performance optimization

**Status:** Complete (2026-01-24)
**Plans:** 4/4 complete

Plans:
- [x] 04-01-PLAN.md — Skeleton components + EmptyState (Wave 1)
- [x] 04-02-PLAN.md — Error boundary + react-error-boundary (Wave 1)
- [x] 04-03-PLAN.md — Integrate skeletons and empty states into pages (Wave 2)
- [x] 04-04-PLAN.md — Performance measurement + verification (Wave 3)

**Deliverables:**
- Skeleton loaders for channels grid
- Skeleton loaders for videos grid
- Skeleton loaders for ideas list
- Empty state components with helpful messaging
- Error boundary with fallback UI
- Web Vitals measurement (CLS, FCP, LCP, INP, TTFB)
- Motion-safe animations for accessibility

**Requirements Covered:**
- REQ-UI-003, REQ-UI-005
- REQ-NFR-001, REQ-NFR-002, REQ-NFR-003, REQ-NFR-004

**Success Criteria:**
- [x] Loading skeletons appear during data fetch
- [x] Empty states guide user on what to do
- [x] Errors display user-friendly messages
- [x] Page loads < 3s on 3G
- [x] Real-time updates < 2s latency

---

## Coverage Summary

| Requirement Category | Count | Phases |
|---------------------|-------|--------|
| Channel Management (REQ-CH-*) | 7 | Phase 1 |
| Video Retrieval (REQ-VID-*) | 8 | Phase 2 |
| Ideas Management (REQ-IDX-*) | 8 | Phase 3 |
| UI/UX (REQ-UI-*) | 6 | Phase 1, 4 |
| Non-Functional (REQ-NFR-*) | 8 | Phase 4 |
| Technical Constraints (REQ-TC-*) | 7 | Phase 1 |
| Data Model (REQ-DM-*) | 3 | Phase 1, 2, 3 |
| **Total** | **47** | **100% covered** |

---
*Updated: 2026-01-24*
