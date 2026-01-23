# Requirements

> Extracted from PRD v1.0 (2026-01-23)

## Functional Requirements

### Channel Management

| ID         | Requirement                                                                                | Priority | Source         |
| ---------- | ------------------------------------------------------------------------------------------ | -------- | -------------- |
| REQ-CH-001 | Add YouTube channel by URL supporting /channel/, /@handle, /c/ formats and raw channel ID  | P0       | US-1.1         |
| REQ-CH-002 | Display all tracked channels in responsive grid (1 col mobile, 2 tablet, 3-4 desktop)      | P0       | US-1.2, FR-1.2 |
| REQ-CH-003 | Show channel card with thumbnail (88x88px), name, subscriber count, added by, created date | P0       | FR-1.2         |
| REQ-CH-004 | Delete channel with confirmation dialog; cascade delete videos and ideas                   | P0       | US-1.3, FR-1.3 |
| REQ-CH-005 | Real-time sync: new/deleted channels appear for all users within 2 seconds                 | P0       | US-1.4, FR-4.1 |
| REQ-CH-006 | Prevent duplicate channel additions                                                        | P0       | FR-1.1         |
| REQ-CH-007 | Show error toast for invalid URLs                                                          | P0       | FR-1.1         |

### Video Retrieval

| ID          | Requirement                                                                                                     | Priority | Source         |
| ----------- | --------------------------------------------------------------------------------------------------------------- | -------- | -------------- |
| REQ-VID-001 | Fetch latest 50 videos from channel's uploads playlist                                                          | P0       | FR-2.1         |
| REQ-VID-002 | Filter out Shorts (duration < 180 seconds)                                                                      | P0       | US-2.2, FR-2.1 |
| REQ-VID-003 | Display top 20 long-form videos sorted by publish date (newest first)                                           | P0       | US-2.1, FR-2.1 |
| REQ-VID-004 | Show video thumbnail (16:9), duration badge, title (max 2 lines), view count (formatted), relative publish date | P0       | US-2.3, FR-2.2 |
| REQ-VID-005 | Click thumbnail opens YouTube video in new tab                                                                  | P0       | US-2.5, FR-2.3 |
| REQ-VID-006 | Manual refresh button with last updated timestamp                                                               | P1       | US-2.4         |
| REQ-VID-007 | Cache videos in database; auto-refresh if data older than 24 hours                                              | P1       | FR-2.1         |
| REQ-VID-008 | Show "Save Idea" button on each video card                                                                      | P0       | FR-2.2         |

### Ideas Management

| ID          | Requirement                                                                                               | Priority | Source         |
| ----------- | --------------------------------------------------------------------------------------------------------- | -------- | -------------- |
| REQ-IDX-001 | Save idea via modal with video thumbnail/title (read-only), note textarea (min 10 chars), added by field  | P0       | US-3.1, FR-3.1 |
| REQ-IDX-002 | Ideas page with chronological list view (newest first)                                                    | P0       | US-3.2, FR-3.2 |
| REQ-IDX-003 | Idea card shows note text, source video thumbnail/title, channel name, added by, timestamp, delete button | P0       | FR-3.2         |
| REQ-IDX-004 | Delete idea with confirmation dialog                                                                      | P1       | US-3.3         |
| REQ-IDX-005 | Real-time sync: new/deleted ideas visible within 2 seconds; toast notification for teammate additions     | P0       | US-3.4, FR-4.1 |
| REQ-IDX-006 | Search box filters by note text and video title (client-side)                                             | P2       | US-3.5, FR-3.3 |
| REQ-IDX-007 | Channel filter dropdown showing channels with saved ideas                                                 | P2       | US-3.5, FR-3.3 |
| REQ-IDX-008 | "My Ideas" toggle to show only current user's ideas                                                       | P2       | FR-3.3         |

## Non-Functional Requirements

### Performance

| ID          | Requirement               | Target            | Source  |
| ----------- | ------------------------- | ----------------- | ------- |
| REQ-NFR-001 | Initial page load time    | < 3 seconds on 3G | NFR 5.1 |
| REQ-NFR-002 | Time to interactive       | < 2 seconds       | NFR 5.1 |
| REQ-NFR-003 | Real-time update latency  | < 2 seconds       | NFR 5.1 |
| REQ-NFR-004 | YouTube API response time | < 5 seconds       | NFR 5.1 |

### Scalability

| ID          | Requirement       | Target          | Source  |
| ----------- | ----------------- | --------------- | ------- |
| REQ-NFR-005 | Concurrent users  | 20 simultaneous | NFR 5.2 |
| REQ-NFR-006 | Channels per team | Up to 100       | NFR 5.2 |
| REQ-NFR-007 | Cached videos     | Up to 2,000     | NFR 5.2 |
| REQ-NFR-008 | Stored ideas      | Up to 5,000     | NFR 5.2 |

### UI/UX

| ID         | Requirement                                                               | Priority | Source        |
| ---------- | ------------------------------------------------------------------------- | -------- | ------------- |
| REQ-UI-001 | Dark theme matching YouTube aesthetic (background #0f0f0f, cards #272727) | P0       | Design System |
| REQ-UI-002 | Responsive design: mobile, tablet, desktop                                | P0       | NFR 5.5       |
| REQ-UI-003 | Loading skeleton states for async operations                              | P1       | NFR 5.5       |
| REQ-UI-004 | Toast notifications for errors                                            | P0       | NFR 5.5       |
| REQ-UI-005 | Empty states with helpful messaging                                       | P1       | NFR 5.5       |
| REQ-UI-006 | Navigation: Channels page, Ideas page with count badge                    | P0       | IA 7.1        |

### Technical Constraints

| ID         | Constraint                                                        | Source         |
| ---------- | ----------------------------------------------------------------- | -------------- |
| REQ-TC-001 | Frontend: React 18 + Vite                                         | Tech Stack 6.1 |
| REQ-TC-002 | Styling: Tailwind CSS                                             | Tech Stack 6.1 |
| REQ-TC-003 | Database: Supabase (PostgreSQL) with real-time subscriptions      | Tech Stack 6.1 |
| REQ-TC-004 | API: YouTube Data API v3                                          | Tech Stack 6.1 |
| REQ-TC-005 | Hosting: Vercel                                                   | Tech Stack 6.1 |
| REQ-TC-006 | API keys stored in environment variables, never exposed to client | NFR 5.4        |
| REQ-TC-007 | All traffic over HTTPS                                            | NFR 5.4        |

## Data Model

| ID         | Table    | Description                                                                                                   |
| ---------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| REQ-DM-001 | channels | id, youtube_id, name, thumbnail_url, subscriber_count, added_by, created_at                                   |
| REQ-DM-002 | videos   | id, channel_id (FK), youtube_id, title, thumbnail_url, duration_seconds, view_count, published_at, fetched_at |
| REQ-DM-003 | ideas    | id, video_id (FK), note, added_by, created_at                                                                 |

---

## Traceability Matrix

| Phase               | Requirements Covered                                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Phase 1: Foundation | REQ-CH-001 through REQ-CH-007, REQ-TC-001 through REQ-TC-007, REQ-DM-001, REQ-UI-001, REQ-UI-002, REQ-UI-004, REQ-UI-006 |
| Phase 2: Videos     | REQ-VID-001 through REQ-VID-008, REQ-DM-002                                                                              |
| Phase 3: Ideas      | REQ-IDX-001 through REQ-IDX-008, REQ-DM-003                                                                              |
| Phase 4: Polish     | REQ-UI-003, REQ-UI-005, REQ-NFR-001 through REQ-NFR-004                                                                  |

---

_Generated: 2026-01-23_
