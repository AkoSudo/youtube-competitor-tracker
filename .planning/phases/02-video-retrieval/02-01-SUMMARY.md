---
phase: 02-video-retrieval
plan: 01
subsystem: database-foundation
tags: [database, migration, types, formatters, utilities]
requires:
  - 01-08 (channels table and types)
provides:
  - videos-table
  - video-types
  - display-formatters
affects:
  - 02-02 (Edge Function will use Video types and formatters)
  - 02-04 (UI components will use formatters for display)
tech-stack:
  added:
    - date-fns (relative date formatting)
    - iso8601-duration (YouTube API duration parsing)
  patterns:
    - Database migrations with foreign keys
    - ON DELETE CASCADE for referential integrity
    - Compact number notation (Intl.NumberFormat)
key-files:
  created:
    - supabase/migrations/002_create_videos.sql
    - src/lib/formatters.ts
  modified:
    - src/lib/types.ts
    - package.json
decisions:
  - decision: ON DELETE CASCADE for channel-video relationship
    rationale: Videos should automatically be removed when parent channel is deleted
    impact: Simplifies data cleanup, prevents orphaned records
  - decision: UNIQUE constraint on youtube_id
    rationale: Enables upsert operations for video refresh/updates
    impact: Prevents duplicate video records
  - decision: Intl.NumberFormat for view counts
    rationale: Browser-native, locale-aware, automatic K/M/B suffixes
    impact: No external library needed for number formatting
metrics:
  duration: 71 seconds
  tasks: 3
  commits: 3
  files-created: 2
  files-modified: 2
completed: 2026-01-23
---

# Phase 02 Plan 01: Video Storage Foundation Summary

**One-liner:** Videos table with cascade delete, TypeScript types, and display formatters (view counts, durations, relative dates)

## What Was Built

Foundation layer for video data storage and display:

1. **Videos Database Table**
   - Foreign key to channels with ON DELETE CASCADE
   - UNIQUE constraint on youtube_id for upsert support
   - Indexes for common query patterns (channel_id, published_at, fetched_at, duration_seconds)
   - Public RLS policies for v1 (no authentication)

2. **TypeScript Type Definitions**
   - `Video` interface for database records
   - `VideoInsert` interface for insert/upsert operations
   - Full type coverage for all video metadata fields

3. **Display Formatting Utilities**
   - `formatViewCount`: Compact notation (1.2M, 500K)
   - `formatDuration`: Time format (3:05, 1:01:01)
   - `formatRelativeDate`: Relative time (2 days ago)

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create videos table migration | 6cc8f8b | supabase/migrations/002_create_videos.sql |
| 2 | Add Video types to types.ts | 826c45c | src/lib/types.ts |
| 3 | Install dependencies and create formatters | 16b0960 | package.json, src/lib/formatters.ts |

## Key Implementation Details

**Migration Pattern:**
- Followed existing channels migration structure
- Added IF NOT EXISTS guards for idempotency
- Indexes optimized for video list queries (by channel, by date, by duration)

**Type Safety:**
- Video types match database schema exactly
- VideoInsert omits auto-generated fields (id, created_at)
- Consistent with existing Channel/ChannelInsert pattern

**Formatter Design:**
- Browser-native Intl.NumberFormat (no external lib for numbers)
- date-fns for human-readable relative dates
- Duration formatter handles both short (<1hr) and long (>1hr) videos

## Decisions Made

### 1. ON DELETE CASCADE for channel-video relationship
- **Context:** Videos belong to channels, need referential integrity
- **Decision:** Use `ON DELETE CASCADE` in foreign key constraint
- **Rationale:** When a channel is deleted, all its videos should be automatically removed
- **Impact:** Simplifies data cleanup, prevents orphaned video records

### 2. UNIQUE constraint on youtube_id
- **Context:** Videos need to be refreshed periodically (view counts, etc.)
- **Decision:** Add UNIQUE constraint on youtube_id column
- **Rationale:** Enables upsert operations using ON CONFLICT clause
- **Impact:** Prevents duplicate video records, supports data refresh pattern

### 3. Intl.NumberFormat for view count formatting
- **Context:** Need to display large numbers (millions of views) compactly
- **Decision:** Use browser-native Intl.NumberFormat with compact notation
- **Rationale:** No external library needed, locale-aware, automatic K/M/B suffixes
- **Impact:** Zero bundle size impact, future internationalization support

## Verification

All verification criteria met:

- ✓ `supabase/migrations/002_create_videos.sql` exists with valid SQL
- ✓ videos table has channel_id FK with ON DELETE CASCADE
- ✓ youtube_id has UNIQUE constraint
- ✓ Video and VideoInsert types exported from src/lib/types.ts
- ✓ date-fns in package.json dependencies
- ✓ iso8601-duration in package.json dependencies
- ✓ formatters.ts exports formatViewCount, formatDuration, formatRelativeDate
- ✓ `npm run build` succeeds

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**Ready for 02-02 (Edge Function):**
- Video types available for Edge Function to use
- formatters.ts ready for server-side duration parsing (iso8601-duration)
- Database schema ready to accept video inserts

**Ready for 02-04 (UI Components):**
- Formatters ready for video list display
- Video types available for component props
- Database schema supports video queries by channel

**Blockers:** None

**Concerns:** None

## Links to Generated Code

- Migration: `/Users/thihaaung/Library/Mobile Documents/com~apple~CloudDocs/YoutubeTracker/supabase/migrations/002_create_videos.sql`
- Types: `/Users/thihaaung/Library/Mobile Documents/com~apple~CloudDocs/YoutubeTracker/src/lib/types.ts`
- Formatters: `/Users/thihaaung/Library/Mobile Documents/com~apple~CloudDocs/YoutubeTracker/src/lib/formatters.ts`
