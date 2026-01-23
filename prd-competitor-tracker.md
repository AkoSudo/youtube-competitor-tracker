# Product Requirements Document (PRD)

## YouTube Competitor Tracker

**Version:** 1.0  
**Date:** January 23, 2026  
**Author:** Chan  
**Status:** Draft

---

## 1. Executive Summary

YouTube Competitor Tracker is a real-time collaborative web application that enables teams to monitor competitor YouTube channels, analyze their content strategies, and collect actionable content ideas. The application addresses the growing need for content teams to systematically track and learn from competitor performance in an increasingly competitive YouTube landscape.

### 1.1 Problem Statement

Content teams face significant challenges in tracking competitor YouTube channels effectively:

- Manual tracking of multiple channels is time-consuming and inconsistent
- Teams lack a centralized system to bookmark and organize competitor channels
- Insights from competitor videos are scattered across individual notes and tools
- No real-time collaboration means team members work in silos, missing valuable insights
- Short-form content (Shorts) clutters analysis when teams need to focus on long-form strategy

### 1.2 Solution Overview

A web-based application that allows teams to bookmark YouTube channels, automatically fetch recent long-form videos (excluding Shorts), and collaboratively save content ideas with real-time synchronization across all team members.

### 1.3 Target Users

- Content marketing teams
- Social media managers
- YouTube content creators and strategists
- Competitive intelligence analysts
- Digital marketing agencies

---

## 2. Goals & Success Metrics

### 2.1 Business Goals

| Goal | Description |
|------|-------------|
| Streamline competitor research | Reduce time spent on manual competitor tracking by 70% |
| Improve team collaboration | Enable real-time sharing of competitive insights across teams |
| Centralize competitive intelligence | Create single source of truth for competitor content analysis |
| Accelerate content ideation | Speed up the process of finding and documenting content ideas |

### 2.2 Success Metrics (KPIs)

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Channels tracked per team | 20+ active channels | Database query |
| Ideas saved per week | 15+ ideas per team | Database query |
| Real-time sync latency | Less than 2 seconds | Performance monitoring |
| User adoption | 80% daily active users within team | Analytics |
| Time to add channel | Less than 30 seconds | User testing |

### 2.3 Non-Goals (Out of Scope for v1.0)

- User authentication and access control
- Analytics dashboard with charts and trends
- Automated notifications or alerts
- Mobile native applications
- Integration with other platforms (TikTok, Instagram)
- AI-powered content recommendations

---

## 3. User Stories & Requirements

### 3.1 User Personas

**Primary Persona: Content Strategist (Sarah)**
- Role: Senior Content Strategist at a digital marketing agency
- Goals: Track 15+ competitor channels for multiple clients, share insights with team
- Pain points: Spends 5+ hours weekly manually checking competitor channels
- Technical proficiency: Moderate

**Secondary Persona: Social Media Manager (Alex)**
- Role: Social Media Manager at a SaaS company
- Goals: Find content inspiration from industry leaders, save ideas for weekly content planning
- Pain points: Ideas get lost in scattered notes, hard to share with teammates
- Technical proficiency: Low to moderate

### 3.2 User Stories

#### Epic 1: Channel Management

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| US-1.1 | As a user, I want to add a YouTube channel by pasting its URL so that I can start tracking it | P0 | Supports all URL formats: /channel/, /@handle, /c/. Extracts channel info automatically. |
| US-1.2 | As a user, I want to see all tracked channels in a grid view so that I can quickly browse them | P0 | Grid displays thumbnail, name, subscriber count, who added it, and date added |
| US-1.3 | As a user, I want to delete a channel so that I can remove irrelevant competitors | P0 | Confirmation dialog before deletion. Channel and associated videos removed. |
| US-1.4 | As a team member, I want to see channels added by teammates in real-time so that we stay synchronized | P0 | New channels appear within 2 seconds without page refresh |

#### Epic 2: Video Retrieval

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| US-2.1 | As a user, I want to view the latest 20 videos from a channel so that I can analyze recent content | P0 | Videos sorted by publish date (newest first) |
| US-2.2 | As a user, I want Shorts (under 3 min) filtered out so that I can focus on long-form content | P0 | Only videos with duration ≥ 180 seconds displayed |
| US-2.3 | As a user, I want to see video thumbnails, titles, view counts, and publish dates so that I can quickly assess performance | P0 | All metadata displayed. View counts formatted (1.2M). Dates relative (3 days ago). |
| US-2.4 | As a user, I want to refresh videos on demand so that I can get the latest content | P1 | Manual refresh button. Shows last updated timestamp. |
| US-2.5 | As a user, I want to click a video to open it on YouTube so that I can watch the full content | P0 | Opens in new tab |

#### Epic 3: Ideas Management

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| US-3.1 | As a user, I want to save an idea from a video with my notes so that I can reference it later | P0 | Modal with note field. Links to source video. Records who added and when. |
| US-3.2 | As a user, I want to view all saved ideas in a dedicated page so that I can review team insights | P0 | List view with note, video source, channel, author, and date |
| US-3.3 | As a user, I want to delete an idea so that I can remove outdated or irrelevant ones | P1 | Confirmation dialog. Removal syncs in real-time. |
| US-3.4 | As a team member, I want to see ideas added by teammates in real-time so that I don't miss insights | P0 | New ideas appear within 2 seconds. Toast notification for teammate additions. |
| US-3.5 | As a user, I want to filter ideas by channel or search by keyword so that I can find specific insights | P2 | Filter dropdown by channel. Search box filters by note text and video title. |

---

## 4. Functional Requirements

### 4.1 Channel Management

**FR-1.1: Add Channel**
- Input: YouTube channel URL or channel ID
- Supported URL formats:
  - `https://www.youtube.com/channel/UC...`
  - `https://www.youtube.com/@handle`
  - `https://www.youtube.com/c/ChannelName`
  - Raw channel ID (e.g., `UCxxxxxx`)
- Process: Extract channel ID → Fetch channel info from YouTube API → Save to database
- Output: Channel card appears in grid
- Error handling: Invalid URL shows error toast. Duplicate channel prevented.

**FR-1.2: Display Channels**
- Grid layout: Responsive (1 column mobile, 2 tablet, 3-4 desktop)
- Card content: Thumbnail (88x88px), channel name, subscriber count (formatted), added by, created date
- Real-time updates: Subscribe to database changes, update UI without refresh

**FR-1.3: Delete Channel**
- Trigger: Click delete button on channel card
- Confirmation: Modal dialog with channel name
- Cascade: Associated videos and ideas also deleted
- Real-time: Removal reflected for all team members

### 4.2 Video Retrieval

**FR-2.1: Fetch Videos**
- Trigger: User clicks on channel card or refresh button
- Process:
  1. Get channel's uploads playlist ID
  2. Fetch latest 50 video IDs from playlist
  3. Batch fetch video details (title, thumbnail, duration, views, publish date)
  4. Filter out videos with duration < 180 seconds
  5. Return top 20 results sorted by publish date
- Storage: Cache videos in database with fetched_at timestamp
- Auto-refresh: Fetch if data older than 24 hours

**FR-2.2: Display Videos**
- Grid layout: 2-3 columns depending on screen width
- Card content:
  - Thumbnail (16:9 aspect ratio)
  - Duration badge overlay (bottom-right)
  - Title (max 2 lines, truncated)
  - View count (formatted: 1.2M, 450K)
  - Publish date (relative: "3 days ago")
  - "Save Idea" button

**FR-2.3: Video Interaction**
- Click thumbnail: Opens YouTube video in new tab
- Click "Save Idea": Opens idea modal

### 4.3 Ideas Management

**FR-3.1: Save Idea**
- Trigger: Click "Save Idea" on video card
- Modal content:
  - Video thumbnail and title (read-only)
  - Note textarea (required, min 10 characters)
  - "Added by" field (pre-filled from localStorage)
- Save: Insert to database with video reference
- Real-time: Idea appears for all team members

**FR-3.2: Ideas Page**
- List view: Chronological (newest first)
- Card content:
  - Idea note text
  - Source video thumbnail (small) and title
  - Source channel name
  - Added by and timestamp
  - Delete button
- Real-time updates: Subscribe to INSERT and DELETE events

**FR-3.3: Filter & Search**
- Search box: Filters by note text and video title (client-side)
- Channel filter: Dropdown with all channels that have saved ideas
- "My Ideas" toggle: Shows only ideas added by current user

### 4.4 Real-Time Synchronization

**FR-4.1: Real-Time Requirements**
- Latency: Updates visible to all users within 2 seconds
- Events:
  - Channel INSERT: New card appears
  - Channel DELETE: Card removed
  - Idea INSERT: New idea appears, toast notification
  - Idea DELETE: Idea removed
- Connection: Auto-reconnect on disconnect

---

## 5. Non-Functional Requirements

### 5.1 Performance

| Requirement | Specification |
|-------------|---------------|
| Initial page load | Less than 3 seconds on 3G connection |
| Time to interactive | Less than 2 seconds |
| Real-time update latency | Less than 2 seconds |
| YouTube API response | Less than 5 seconds for video fetch |

### 5.2 Scalability

| Requirement | Specification |
|-------------|---------------|
| Concurrent users | Support 20 simultaneous team members |
| Channels per team | Up to 100 channels |
| Videos cached | Up to 2,000 videos (20 per channel × 100 channels) |
| Ideas stored | Up to 5,000 ideas |

### 5.3 Reliability

| Requirement | Specification |
|-------------|---------------|
| Uptime | 99.5% availability |
| Data persistence | All data persisted to database |
| Error recovery | Graceful error handling with user-friendly messages |
| Offline behavior | Show cached data, disable write operations |

### 5.4 Security

| Requirement | Specification |
|-------------|---------------|
| API keys | Stored in environment variables, never exposed to client |
| Database access | Row-level security enabled (open for v1.0, auth-gated in v2.0) |
| Input validation | Sanitize all user inputs |
| HTTPS | All traffic encrypted |

### 5.5 Usability

| Requirement | Specification |
|-------------|---------------|
| Responsive design | Fully functional on mobile, tablet, desktop |
| Accessibility | WCAG 2.1 AA compliance |
| Loading states | Skeleton loaders for async operations |
| Error feedback | Toast notifications for all errors |
| Empty states | Helpful messaging when no data exists |

---

## 6. Technical Architecture

### 6.1 Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | React 18 + Vite | Fast development, modern tooling |
| Styling | Tailwind CSS | Rapid UI development, dark theme |
| Database | Supabase (PostgreSQL) | Real-time subscriptions, free tier |
| API | YouTube Data API v3 | Official YouTube data access |
| Hosting | Vercel | Easy deployment, good DX |

### 6.2 Data Model

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    channels     │       │     videos      │       │      ideas      │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │──┐    │ id (PK)         │──┐    │ id (PK)         │
│ youtube_id      │  │    │ channel_id (FK) │◄─┘    │ video_id (FK)   │◄─┐
│ name            │  │    │ youtube_id      │       │ note            │  │
│ thumbnail_url   │  │    │ title           │       │ added_by        │  │
│ subscriber_count│  │    │ thumbnail_url   │       │ created_at      │  │
│ added_by        │  │    │ duration_seconds│       └─────────────────┘  │
│ created_at      │  │    │ view_count      │                            │
└─────────────────┘  │    │ published_at    │────────────────────────────┘
                     │    │ fetched_at      │
                     └───►└─────────────────┘
```

### 6.3 API Endpoints (Supabase)

| Operation | Method | Endpoint |
|-----------|--------|----------|
| List channels | GET | /rest/v1/channels |
| Add channel | POST | /rest/v1/channels |
| Delete channel | DELETE | /rest/v1/channels?id=eq.{id} |
| List videos | GET | /rest/v1/videos?channel_id=eq.{id} |
| Upsert videos | POST | /rest/v1/videos (upsert) |
| List ideas | GET | /rest/v1/ideas?select=*,videos(*,channels(*)) |
| Add idea | POST | /rest/v1/ideas |
| Delete idea | DELETE | /rest/v1/ideas?id=eq.{id} |

### 6.4 Real-Time Subscriptions

```javascript
// Channel changes
supabase.channel('channels')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'channels' }, handler)
  .subscribe()

// Ideas changes
supabase.channel('ideas')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'ideas' }, handler)
  .subscribe()
```

---

## 7. User Interface

### 7.1 Information Architecture

```
Home (/)
├── Channel Grid
│   ├── Add Channel Button → Add Channel Modal
│   └── Channel Card → Channel Detail Page
│
├── Channel Detail (/channel/:id)
│   ├── Channel Header
│   ├── Refresh Button
│   └── Video Grid
│       └── Video Card → Save Idea Modal
│
└── Ideas (/ideas)
    ├── Search & Filter Bar
    └── Ideas List
        └── Idea Card
```

### 7.2 Wireframes

**Home Page - Channel Grid**
```
┌────────────────────────────────────────────────────────────────┐
│  [Logo] YouTube Competitor Tracker    [Channels] [Ideas (12)]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │   [thumb]    │ │   [thumb]    │ │   [thumb]    │           │
│  │              │ │              │ │              │           │
│  │ Channel Name │ │ Channel Name │ │ Channel Name │           │
│  │ 1.2M subs    │ │ 450K subs    │ │ 89K subs     │           │
│  │ Added by Alex│ │ Added by Sam │ │ Added by Alex│           │
│  │ 3 days ago   │ │ 1 week ago   │ │ 2 weeks ago  │           │
│  │       [🗑️]   │ │       [🗑️]   │ │       [🗑️]   │           │
│  └──────────────┘ └──────────────┘ └──────────────┘           │
│                                                                │
│  ┌──────────────┐                                              │
│  │     [ + ]    │                                              │
│  │  Add Channel │                                              │
│  └──────────────┘                                              │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Channel Detail Page**
```
┌────────────────────────────────────────────────────────────────┐
│  [←] Back    YouTube Competitor Tracker    [Channels] [Ideas]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  [thumb] Channel Name                                          │
│          1.2M subscribers • 20 videos                          │
│          Last updated: 2 hours ago    [🔄 Refresh]             │
│                                                                │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐  │
│  │ [thumbnail]     │ │ [thumbnail]     │ │ [thumbnail]     │  │
│  │          12:34  │ │          08:21  │ │          45:02  │  │
│  │ Video Title     │ │ Video Title     │ │ Video Title     │  │
│  │ Here Is A Lo... │ │ Another Great...│ │ How to Build... │  │
│  │ 1.2M • 3d ago   │ │ 450K • 1w ago   │ │ 89K • 2w ago    │  │
│  │ [💡 Save Idea]  │ │ [💡 Save Idea]  │ │ [💡 Save Idea]  │  │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Ideas Page**
```
┌────────────────────────────────────────────────────────────────┐
│  [Logo] YouTube Competitor Tracker    [Channels] [Ideas (12)]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  🔍 [Search ideas...        ] [All Channels ▼] [□ My Ideas]   │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ "Great hook in the first 10 seconds - use pattern      │   │
│  │  interrupt with unexpected question"                    │   │
│  │                                                         │   │
│  │ [sm thumb] How to Get 1M Views in 24 Hours             │   │
│  │            Channel Name • Added by Alex • 2 hours ago  │   │
│  │                                                   [🗑️]  │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ "Thumbnail uses bright yellow + face close-up -        │   │
│  │  high contrast works well for CTR"                     │   │
│  │                                                         │   │
│  │ [sm thumb] Why Everyone Is Talking About This          │   │
│  │            Channel Name • Added by Sam • 5 hours ago   │   │
│  │                                                   [🗑️]  │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 7.3 Design System

**Colors (Dark Theme)**
| Element | Color | Hex |
|---------|-------|-----|
| Background | Dark black | #0f0f0f |
| Card background | Dark gray | #272727 |
| Card hover | Lighter gray | #3f3f3f |
| Primary text | White | #ffffff |
| Secondary text | Gray | #aaaaaa |
| Accent | YouTube red | #ff0000 |
| Success | Green | #22c55e |
| Error | Red | #ef4444 |

**Typography**
| Element | Size | Weight |
|---------|------|--------|
| Page title | 24px | Bold |
| Card title | 16px | Semi-bold |
| Body text | 14px | Regular |
| Caption | 12px | Regular |

---

## 8. Implementation Plan

### 8.1 Development Phases

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 1: Foundation | 3-4 hours | Project setup, Supabase config, channel CRUD with real-time |
| Phase 2: Videos | 2-3 hours | YouTube API integration, video display, filtering |
| Phase 3: Ideas | 2-3 hours | Ideas system, real-time sync, Ideas page |
| Phase 4: Polish | 2-3 hours | Loading states, error handling, responsive design |

### 8.2 Phase 1 Deliverables

- React + Vite project scaffolded
- Supabase client configured
- Channels table created
- Add channel functionality (URL parsing + API fetch)
- Channel grid with real-time updates
- Delete channel with cascade

### 8.3 Phase 2 Deliverables

- Videos table created
- YouTube API video fetching
- Duration filtering (exclude < 3 min)
- Channel detail page with video grid
- Video metadata formatting

### 8.4 Phase 3 Deliverables

- Ideas table created
- Save idea modal
- Ideas page with list view
- Real-time idea sync
- Filter and search functionality

### 8.5 Phase 4 Deliverables

- Loading skeletons
- Error toasts
- Empty states
- Mobile responsive
- Performance optimization

---

## 9. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| YouTube API quota exceeded | Medium | High | Cache videos, limit refresh frequency, display quota warnings |
| Real-time connection drops | Low | Medium | Auto-reconnect logic, optimistic UI updates |
| Supabase free tier limits | Low | Medium | Monitor usage, upgrade plan if needed |
| URL parsing edge cases | Medium | Low | Comprehensive regex, fallback to search API |
| Team data conflicts | Low | Low | Last-write-wins, real-time prevents most conflicts |

---

## 10. Future Enhancements (v2.0)

| Feature | Description | Priority |
|---------|-------------|----------|
| User authentication | Login with Google, team invites | High |
| Analytics dashboard | Charts showing posting frequency, view trends | Medium |
| Notifications | Email/Slack alerts for new competitor videos | Medium |
| Tags for ideas | Categorize ideas with custom tags | Medium |
| Export functionality | Export ideas as CSV/Markdown | Low |
| Chrome extension | Quick-add channels while browsing YouTube | Low |
| AI summaries | Auto-generate video summaries using AI | Low |

---

## 11. Appendix

### 11.1 YouTube URL Patterns

```javascript
// Supported URL formats
const patterns = [
  /youtube\.com\/channel\/(UC[\w-]+)/,      // /channel/UCxxxx
  /youtube\.com\/@([\w-]+)/,                 // /@handle
  /youtube\.com\/c\/([\w-]+)/,               // /c/ChannelName
  /^(UC[\w-]{22})$/                          // Raw channel ID
];
```

### 11.2 Duration Filtering Logic

```javascript
// Filter function for excluding Shorts
const isLongFormVideo = (video) => video.durationSeconds >= 180; // 3 minutes
```

### 11.3 Formatting Utilities

```javascript
// View count: 1234567 → "1.2M"
// Duration: 754 → "12:34"
// Date: 2024-01-20 → "3 days ago"
```

---

**Document History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 23, 2026 | Chan | Initial draft |
