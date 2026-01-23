# YouTube Competitor Tracker

## What This Is

A real-time collaborative web application that enables teams to monitor competitor YouTube channels, analyze their content strategies, and collect actionable content ideas. Teams can bookmark channels, automatically fetch recent long-form videos (excluding Shorts), and collaboratively save insights with instant synchronization.

## Core Value

Teams can track competitor YouTube channels and capture content ideas together in real-time — eliminating scattered notes and siloed research.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Channel Management**
- [ ] Add YouTube channel by URL (supports /channel/, /@handle, /c/ formats)
- [ ] View all tracked channels in responsive grid
- [ ] Delete channels with confirmation
- [ ] Real-time sync of channel changes across team

**Video Retrieval**
- [ ] Fetch latest 20 videos from channel
- [ ] Filter out Shorts (videos under 3 minutes)
- [ ] Display thumbnail, title, views, duration, publish date
- [ ] Click to open video on YouTube
- [ ] Manual refresh with cache (24hr auto-refresh)

**Ideas Management**
- [ ] Save idea with notes from any video
- [ ] View all saved ideas in dedicated page
- [ ] Delete ideas with confirmation
- [ ] Real-time sync of ideas across team
- [ ] Filter ideas by channel
- [ ] Search ideas by keyword

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

## Constraints

- **Tech stack**: React 18 + Vite, Tailwind CSS, Supabase, Vercel — per PRD specification
- **API**: YouTube Data API v3 — quota limits apply
- **Design**: Dark theme matching YouTube aesthetic
- **Performance**: <3s page load, <2s real-time sync
- **Scale**: Support 20 concurrent users, 100 channels, 5000 ideas

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| No auth for v1 | Faster to ship, team trusts each other | — Pending |
| Supabase for backend | Real-time built-in, generous free tier | — Pending |
| Filter Shorts by 3min threshold | Standard boundary for long-form | — Pending |
| Dark theme only | Matches YouTube, simpler to build | — Pending |

---
*Last updated: 2026-01-23 after initialization*
