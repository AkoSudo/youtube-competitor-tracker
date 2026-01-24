# YouTube Competitor Tracker

## What This Is

A real-time collaborative web application that enables teams to monitor competitor YouTube channels, analyze their content strategies, and collect actionable content ideas. Teams can bookmark channels, automatically fetch recent long-form videos (excluding Shorts), and collaboratively save insights with instant synchronization.

## Core Value

Teams can track competitor YouTube channels and capture content ideas together in real-time — eliminating scattered notes and siloed research.

## Requirements

### Validated

**v1.0 MVP (Shipped 2026-01-24)**

**Channel Management**
- [x] Add YouTube channel by URL (supports /channel/, /@handle, /c/ formats) — v1.0
- [x] View all tracked channels in responsive grid — v1.0
- [x] Delete channels with confirmation and cascade — v1.0
- [x] Real-time sync of channel changes across team — v1.0
- [x] Duplicate prevention with error feedback — v1.0

**Video Retrieval**
- [x] Fetch latest 50 videos, display top 20 long-form — v1.0
- [x] Filter out Shorts (videos under 3 minutes) — v1.0
- [x] Display thumbnail, title, views, duration, publish date — v1.0
- [x] Click to open video on YouTube — v1.0
- [x] Manual refresh with cache (24hr auto-refresh) — v1.0

**Ideas Management**
- [x] Save idea with notes from any video — v1.0
- [x] View all saved ideas in dedicated page — v1.0
- [x] Delete ideas with confirmation — v1.0
- [x] Real-time sync of ideas across team — v1.0
- [x] Toast notifications for teammate additions — v1.0
- [x] Filter ideas by channel — v1.0
- [x] Search ideas by keyword — v1.0
- [x] "My Ideas" toggle — v1.0

**UI/UX**
- [x] Dark theme matching YouTube aesthetic — v1.0
- [x] Responsive design (mobile, tablet, desktop) — v1.0
- [x] Loading skeleton states — v1.0
- [x] Empty states with helpful messaging — v1.0
- [x] Error boundary with recovery — v1.0
- [x] Navigation with ideas count badge — v1.0

**Performance**
- [x] Page load < 3s on 3G — v1.0
- [x] Real-time sync < 2s latency — v1.0
- [x] Web Vitals measurement — v1.0

### Active

(None — run `/gsd:new-milestone` to plan v1.1)

### Out of Scope

- User authentication — v1 is open access, auth planned for v2
- Analytics dashboard — no charts/trends in v1
- Notifications/alerts — no email/Slack alerts
- Mobile native apps — web-first approach
- Other platforms (TikTok, Instagram) — YouTube only
- AI features — no auto-recommendations or summaries

## Context

- Target users: Content marketing teams, social media managers, YouTube strategists
- Primary pain point: Manual competitor tracking is time-consuming and insights are scattered
- Team collaboration is key — everything syncs in real-time
- Focus on long-form content strategy (Shorts excluded)

**Current State (v1.0):**
- 2,652 lines of TypeScript across 32 files
- Tech stack: React 18 + Vite, Tailwind CSS v4, Supabase, react-error-boundary, web-vitals
- Database: 3 tables (channels, videos, ideas) with FK cascades and real-time subscriptions
- Edge Function: fetch-channel-videos for YouTube API integration

## Constraints

- **Tech stack**: React 18 + Vite, Tailwind CSS, Supabase, Vercel — per PRD specification
- **API**: YouTube Data API v3 — 10,000 quota/day, 24hr cache for efficiency
- **Design**: Dark theme matching YouTube aesthetic (#0f0f0f, #272727)
- **Performance**: <3s page load, <2s real-time sync
- **Scale**: Support 20 concurrent users, 100 channels, 5000 ideas

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| No auth for v1 | Faster to ship, team trusts each other | ✓ Shipped — works for small teams |
| Supabase for backend | Real-time built-in, generous free tier | ✓ Shipped — excellent DX |
| Filter Shorts by 3min threshold | Safety margin above YouTube's 60s limit | ✓ Shipped — no false positives |
| Dark theme only | Matches YouTube, simpler to build | ✓ Shipped — consistent aesthetic |
| Tailwind CSS v4 | Faster builds with @tailwindcss/vite | ✓ Shipped — no issues |
| Native dialog for modals | Browser accessibility, focus trap | ✓ Shipped — excellent a11y |
| 24-hour cache TTL | Enables ~3,333 refreshes/day within quota | ✓ Shipped — quota-efficient |
| motion-safe animations | Respects prefers-reduced-motion | ✓ Shipped — accessible |

---
*Last updated: 2026-01-24 after v1.0 milestone*
