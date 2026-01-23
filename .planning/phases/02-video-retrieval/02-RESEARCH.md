# Phase 2: Video Retrieval - Research

**Researched:** 2026-01-23
**Domain:** YouTube Data API v3 integration, video fetching, caching patterns
**Confidence:** HIGH

## Summary

Phase 2 requires integration with YouTube Data API v3 to fetch channel videos, filter out Shorts (videos < 180 seconds), and display them in a responsive grid. The standard approach uses a two-step API pattern: first fetch the channel's uploads playlist ID, then retrieve videos from that playlist. A third API call fetches detailed video metadata including duration in ISO 8601 format.

The critical architecture decision is whether to call the YouTube API server-side (via Supabase Edge Functions) or client-side. Server-side is strongly recommended for API key security, quota management, and caching control. Supabase Edge Functions provide the ideal environment with built-in secret management and TypeScript/Deno runtime.

For video caching, PostgreSQL's upsert (INSERT ... ON CONFLICT) pattern efficiently handles bulk video storage with automatic deduplication. Real-time subscriptions enable automatic UI updates when video data changes.

**Primary recommendation:** Use Supabase Edge Functions for YouTube API calls, implement three-step fetch pattern (channel → playlist items → video details), parse ISO 8601 durations with lightweight library, cache with 24hr TTL using timestamp comparison, and build responsive video grid with Tailwind CSS arbitrary grid values.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| YouTube Data API v3 | v3 | Fetch channel and video data | Official Google API, only option for YouTube data |
| Supabase Edge Functions | Latest | Server-side API integration | Serverless, globally distributed, built-in secrets, TypeScript/Deno |
| iso8601-duration | ^2.1.2 | Parse PT format durations | Lightweight (<1KB), zero dependencies, TypeScript support |
| date-fns | ^3.0.0 | Date formatting and relative time | Modern, tree-shakeable, TypeScript-first, widely adopted |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @supabase/supabase-js | Latest | Supabase client (server & browser) | Required for all Supabase operations |
| Intl.NumberFormat | Native | Format view counts (1.5M, 234K) | Built-in browser API, no dependencies needed |
| react-intersection-observer | ^9.0.0 | Lazy load video thumbnails | Optional optimization for large video grids |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Supabase Edge Functions | Client-side API calls | Exposes API key, no rate limiting, harder to cache |
| iso8601-duration | tinyduration | Similar but iso8601-duration has better npm adoption |
| date-fns | Temporal API | Temporal still in Stage 3, not yet stable for production |

**Installation:**
```bash
npm install @supabase/supabase-js date-fns iso8601-duration
# Optional for lazy loading:
npm install react-intersection-observer
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── supabase.ts           # Supabase client singleton
│   ├── youtube.ts             # YouTube API types and helpers
│   └── formatters.ts          # View count, date, duration formatters
├── components/
│   ├── VideoCard.tsx          # Individual video card component
│   ├── VideoGrid.tsx          # Video grid layout with loading states
│   └── ChannelVideos.tsx      # Channel videos page wrapper
└── hooks/
    └── useChannelVideos.ts    # Hook for fetching/subscribing to videos

supabase/functions/
├── fetch-channel-videos/
│   ├── index.ts               # Edge Function entry point
│   └── types.ts               # YouTube API response types
└── resolve-channel-name/
    └── index.ts               # Fetch channel name from ID
```

### Pattern 1: Three-Step YouTube API Fetch

**What:** Fetch videos in three sequential API calls to minimize quota usage and get all required data.

**When to use:** Every time fetching videos for a channel (initial load and refresh).

**Flow:**
1. **channels.list** - Get uploads playlist ID and channel name (1 quota unit)
2. **playlistItems.list** - Get last 50 video IDs from uploads playlist (1 quota unit)
3. **videos.list** - Batch fetch video details for all IDs (1 quota unit)

**Example:**
```typescript
// Source: https://developers.google.com/youtube/v3/docs
// Step 1: Get uploads playlist ID
const channelResponse = await fetch(
  `https://www.googleapis.com/youtube/v3/channels?` +
  `part=snippet,contentDetails&id=${channelId}&key=${apiKey}`
);
const uploadsPlaylistId = channelResponse.items[0].contentDetails.relatedPlaylists.uploads;
const channelName = channelResponse.items[0].snippet.title;

// Step 2: Get video IDs from playlist
const playlistResponse = await fetch(
  `https://www.googleapis.com/youtube/v3/playlistItems?` +
  `part=contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50&key=${apiKey}`
);
const videoIds = playlistResponse.items
  .map(item => item.contentDetails.videoId)
  .join(',');

// Step 3: Get video details with duration
const videosResponse = await fetch(
  `https://www.googleapis.com/youtube/v3/videos?` +
  `part=snippet,contentDetails,statistics&id=${videoIds}&key=${apiKey}`
);

// Total quota cost: 3 units per channel refresh
```

**Quota efficiency:** This three-step pattern uses only 3 quota units to fetch 50 videos with full metadata. The default daily quota is 10,000 units, allowing ~3,333 channel refreshes per day.

### Pattern 2: ISO 8601 Duration Parsing and Filtering

**What:** Parse YouTube's PT format (e.g., PT15M33S) to seconds and filter Shorts (< 180s).

**When to use:** After fetching video details from videos.list API call.

**Example:**
```typescript
// Source: https://www.npmjs.com/package/iso8601-duration
import { parse, toSeconds } from 'iso8601-duration';

interface Video {
  id: string;
  duration: string; // e.g., "PT15M33S"
  // ... other fields
}

function filterLongFormVideos(videos: Video[]): Video[] {
  return videos.filter(video => {
    const parsed = parse(video.duration);
    const seconds = toSeconds(parsed);
    return seconds >= 180; // Filter out Shorts
  });
}

// Example durations:
// "PT1M30S" = 90 seconds (Short, filtered out)
// "PT3M5S" = 185 seconds (long-form, kept)
// "PT15M51S" = 951 seconds (long-form, kept)
```

**Important:** As of 2026, YouTube Shorts can be up to 3 minutes (180 seconds) long, so the 180-second threshold correctly filters all Shorts while keeping all long-form videos.

### Pattern 3: Supabase Batch Upsert for Video Caching

**What:** Use PostgreSQL's ON CONFLICT to insert new videos or update existing ones in a single operation.

**When to use:** After fetching and filtering videos, before returning to client.

**Example:**
```typescript
// Source: https://supabase.com/docs/reference/javascript/upsert
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // Safe in Edge Functions
);

interface VideoInsert {
  channel_id: number;
  youtube_id: string;
  title: string;
  thumbnail_url: string;
  duration_seconds: number;
  view_count: number;
  published_at: string;
  fetched_at: string;
}

async function cacheVideos(videos: VideoInsert[]) {
  const { data, error } = await supabase
    .from('videos')
    .upsert(videos, {
      onConflict: 'youtube_id', // Use youtube_id as unique constraint
    });

  if (error) throw error;
  return data;
}

// Upsert automatically:
// - Inserts new videos
// - Updates existing videos (title, view_count, fetched_at)
// - Requires UNIQUE constraint on youtube_id column
```

**Performance:** Batch upserts are significantly faster than individual INSERT/UPDATE statements. Ensure `youtube_id` has a unique index for optimal performance.

### Pattern 4: 24-Hour Cache Invalidation

**What:** Check if cached videos are older than 24 hours before making API calls.

**When to use:** At the start of the Edge Function, before calling YouTube API.

**Example:**
```typescript
// Check if we need to refresh
const { data: existingVideos } = await supabase
  .from('videos')
  .select('fetched_at')
  .eq('channel_id', channelId)
  .order('fetched_at', { ascending: false })
  .limit(1);

const needsRefresh = !existingVideos?.length ||
  new Date().getTime() - new Date(existingVideos[0].fetched_at).getTime() > 24 * 60 * 60 * 1000;

if (!needsRefresh) {
  // Return cached videos from database
  const { data: cachedVideos } = await supabase
    .from('videos')
    .select('*')
    .eq('channel_id', channelId)
    .gte('duration_seconds', 180) // Filter Shorts at DB level
    .order('published_at', { ascending: false })
    .limit(20);

  return new Response(JSON.stringify(cachedVideos), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// Otherwise, fetch fresh data from YouTube API
```

**Optimization:** Filter Shorts at the database level (`duration_seconds >= 180`) to reduce data transfer and improve performance.

### Pattern 5: Responsive Video Grid with Tailwind CSS

**What:** Use CSS Grid with auto-fit to create responsive video grid without media queries.

**When to use:** VideoGrid component layout.

**Example:**
```tsx
// Source: https://www.uibun.dev/blog/tailwindcss-responsive-grid
export function VideoGrid({ videos }: { videos: Video[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
      {videos.map(video => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}

// auto-fit automatically:
// - Creates as many columns as fit in the container
// - Each column is at least 280px wide (good for video thumbnails)
// - Columns expand to fill available space equally
// - No media queries needed

// On mobile: 1 column (if width < 280px + gap)
// On tablet: 2-3 columns
// On desktop: 4+ columns
```

**Alternative:** For more control, use custom Tailwind config:
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      gridTemplateColumns: {
        'video': 'repeat(auto-fit, minmax(280px, 1fr))'
      }
    }
  }
}

// Then use: className="grid grid-cols-video gap-6"
```

### Pattern 6: View Count Formatting with Intl.NumberFormat

**What:** Format large numbers with K/M/B suffixes using native browser API.

**When to use:** Displaying view counts in VideoCard component.

**Example:**
```typescript
// Source: https://ahmadrosid.com/cheatsheet/js/formatting-number-javascript
function formatViewCount(count: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1
  }).format(count);
}

// Examples:
// 1234 → "1.2K"
// 1500000 → "1.5M"
// 2400000000 → "2.4B"
// 999 → "999"
```

**Why native API:** Zero dependencies, locale-aware, handles all magnitude changes automatically, and excellent browser support (all modern browsers).

### Pattern 7: Relative Date Formatting with date-fns

**What:** Display human-readable relative time ("2 days ago", "3 weeks ago").

**When to use:** Showing video publish dates in VideoCard component.

**Example:**
```typescript
// Source: https://date-fns.org/
import { formatDistanceToNow } from 'date-fns';

function formatPublishDate(publishedAt: string): string {
  return formatDistanceToNow(new Date(publishedAt), { addSuffix: true });
}

// Examples:
// 2026-01-21 → "2 days ago"
// 2026-01-01 → "3 weeks ago"
// 2025-12-20 → "1 month ago"
```

**Tree-shaking:** date-fns allows importing only the functions you need, keeping bundle size minimal.

### Anti-Patterns to Avoid

- **Client-side API key exposure:** Never put YouTube API key in client-side code. Always use server-side proxy (Edge Functions).
- **Fetching videos without caching:** Don't call YouTube API on every page load. Cache in database and refresh based on timestamp.
- **Manual duration parsing:** Don't write regex to parse PT format. Use established library like iso8601-duration.
- **Individual database inserts:** Don't insert videos one-by-one. Use batch upsert for better performance.
- **Fetching all playlist pages:** Don't paginate through entire upload history. 50 most recent videos is sufficient for P0 requirements.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| ISO 8601 duration parsing | Custom regex for PT format | iso8601-duration library | Handles edge cases (weeks, years, fractional seconds), tested, <1KB |
| Large number formatting | Custom K/M/B logic | Intl.NumberFormat (native) | Locale-aware, handles all magnitudes, zero dependencies |
| Relative time display | Custom time-ago calculator | date-fns formatDistanceToNow | Handles pluralization, locale support, edge cases |
| Video thumbnail lazy loading | Custom intersection observer | react-intersection-observer | Handles cleanup, edge cases, TypeScript support |
| Batch database operations | Loop with individual INSERT/UPDATE | Supabase upsert with array | 10-100x faster, atomic, handles conflicts |

**Key insight:** YouTube API integration has many subtle gotchas (quota management, error codes, pagination edge cases, duration format variations). Using established patterns and libraries prevents common pitfalls and reduces maintenance burden.

## Common Pitfalls

### Pitfall 1: API Key Exposure in Client-Side Code

**What goes wrong:** Developer includes YouTube API key directly in React component or environment variable accessible to browser. API key appears in network tab, page source, or bundled JavaScript. Malicious users copy key and abuse quota or get project banned.

**Why it happens:** Confusion about environment variables (VITE_ prefix makes them public), convenience of client-side fetch, unfamiliarity with server-side patterns.

**How to avoid:**
- Always call YouTube API from Supabase Edge Functions (server-side)
- Store API key in Supabase secrets (Dashboard or `supabase secrets set`)
- Never use VITE_YOUTUBE_API_KEY or similar client-accessible variables
- Set API key restrictions in Google Cloud Console (HTTP referrers for web, IP addresses for server)

**Warning signs:**
- API key visible in browser DevTools Network tab
- API key appears when searching codebase for VITE_ prefix
- Getting quota exceeded faster than expected (others using your key)

### Pitfall 2: Quota Exhaustion from Inefficient API Calls

**What goes wrong:** Application makes too many YouTube API calls (e.g., fetching videos on every page load, calling search.list instead of channels.list, requesting unnecessary parts). Daily quota (10,000 units) exhausted by midday. Application stops working until midnight PT.

**Why it happens:** Not understanding quota costs per method (search.list costs 100 units vs. channels.list costs 1 unit), not implementing caching, calling API too frequently.

**How to avoid:**
- Implement 24-hour cache using database timestamps
- Use cheapest API methods: channels.list (1), playlistItems.list (1), videos.list (1)
- Never use search.list (100 units) for fetching channel videos
- Batch video IDs in single videos.list call (50 IDs = 1 unit, not 50 units)
- Set up quota monitoring in Google Cloud Console

**Warning signs:**
- quotaExceeded (403) errors
- Application works in morning but fails by afternoon
- Quota graph in Google Cloud Console shows rapid consumption

### Pitfall 3: Incorrect Shorts Filtering

**What goes wrong:** Developer uses wrong duration threshold (60 seconds instead of 180), filters on wrong field, or parses ISO 8601 duration incorrectly. Shorts appear in video grid or long-form videos get filtered out.

**Why it happens:** Outdated information (Shorts used to be 60s max), confusion about YouTube's definition of Shorts (duration vs. aspect ratio), manual parsing errors.

**How to avoid:**
- Use 180 seconds (3 minutes) as threshold (YouTube's 2026 Shorts limit)
- Filter based on contentDetails.duration from videos.list API
- Use iso8601-duration library for parsing (don't hand-roll regex)
- Filter after parsing to seconds: `toSeconds(parse(duration)) >= 180`
- Test with known Shorts and long-form videos

**Warning signs:**
- Vertical long-form videos (podcasts) getting filtered out
- Shorts appearing in grid (check if < 3 minutes)
- Edge cases like "PT3M" (exactly 180s) being filtered incorrectly

### Pitfall 4: Missing Unique Constraint on youtube_id

**What goes wrong:** Database allows duplicate videos with same youtube_id. Upsert fails with error or creates duplicate entries. Video grid shows same video multiple times.

**Why it happens:** Forgot to add UNIQUE constraint during table creation, using wrong conflict column in upsert.

**How to avoid:**
```sql
-- Add unique constraint when creating table
CREATE TABLE videos (
  id BIGSERIAL PRIMARY KEY,
  youtube_id TEXT UNIQUE NOT NULL, -- UNIQUE constraint
  -- ... other columns
);

-- Or add later if forgot
ALTER TABLE videos ADD CONSTRAINT videos_youtube_id_key UNIQUE (youtube_id);
```

**Warning signs:**
- Upsert throws error: "there is no unique or exclusion constraint"
- Same video appears multiple times in database
- Video count grows faster than expected

### Pitfall 5: Ignoring 403 Forbidden and 404 Not Found Errors

**What goes wrong:** Edge Function crashes or returns generic error when YouTube API returns 403 (quota exceeded, API key invalid, restricted video) or 404 (deleted video, private video, channel gone). User sees unhelpful error message.

**Why it happens:** Not implementing proper error handling, assuming all API calls succeed.

**How to avoid:**
```typescript
// Source: https://developers.google.com/youtube/v3/docs/errors
async function fetchWithErrorHandling(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();

    if (response.status === 403) {
      if (error.error.errors[0].reason === 'quotaExceeded') {
        throw new Error('YouTube API quota exceeded. Try again tomorrow.');
      } else if (error.error.errors[0].reason === 'forbidden') {
        throw new Error('Invalid API key or insufficient permissions.');
      }
    } else if (response.status === 404) {
      throw new Error('Video or channel not found (may be deleted or private).');
    }

    throw new Error(`YouTube API error: ${error.error.message}`);
  }

  return response.json();
}
```

**Warning signs:**
- Generic "API error" messages in UI
- Edge Function logs show 403/404 but no specific handling
- Application fails silently when quota exceeded

### Pitfall 6: Not Handling Deleted or Private Videos

**What goes wrong:** Fetch channel's playlist, get list of video IDs, but some videos return 404 when fetching details (deleted, private, removed). Application crashes or shows broken video cards.

**Why it happens:** YouTube's playlistItems.list returns all video IDs, even for deleted/private videos. The videos.list call silently omits videos that don't exist or are inaccessible.

**How to avoid:**
```typescript
// After fetching video details
const requestedIds = videoIds.split(',');
const returnedIds = videosResponse.items.map(v => v.id);
const missingIds = requestedIds.filter(id => !returnedIds.includes(id));

if (missingIds.length > 0) {
  console.warn(`${missingIds.length} videos unavailable:`, missingIds);
  // Continue with available videos, don't crash
}
```

**Warning signs:**
- Fewer videos returned than expected
- Some playlist items have no corresponding video details
- Videos count doesn't match between steps

## Code Examples

Verified patterns from official sources:

### Complete Edge Function for Fetching Channel Videos

```typescript
// Source: Synthesized from https://developers.google.com/youtube/v3/docs
// File: supabase/functions/fetch-channel-videos/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { parse, toSeconds } from 'https://esm.sh/iso8601-duration@2';

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface Video {
  channel_id: number;
  youtube_id: string;
  title: string;
  thumbnail_url: string;
  duration_seconds: number;
  view_count: number;
  published_at: string;
  fetched_at: string;
}

serve(async (req) => {
  try {
    const { channelId, youtubeChannelId } = await req.json();
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if cache is fresh (< 24 hours)
    const { data: cached } = await supabase
      .from('videos')
      .select('fetched_at')
      .eq('channel_id', channelId)
      .order('fetched_at', { ascending: false })
      .limit(1);

    const cacheAge = cached?.[0]
      ? Date.now() - new Date(cached[0].fetched_at).getTime()
      : Infinity;

    if (cacheAge < 24 * 60 * 60 * 1000) {
      // Return cached videos
      const { data } = await supabase
        .from('videos')
        .select('*')
        .eq('channel_id', channelId)
        .gte('duration_seconds', 180)
        .order('published_at', { ascending: false })
        .limit(20);

      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Step 1: Get uploads playlist ID and channel name
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?` +
      `part=snippet,contentDetails&id=${youtubeChannelId}&key=${YOUTUBE_API_KEY}`
    );
    const channelData = await channelRes.json();

    if (!channelData.items?.length) {
      throw new Error('Channel not found');
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
    const channelName = channelData.items[0].snippet.title;

    // Update channel name in database
    await supabase
      .from('channels')
      .update({ name: channelName })
      .eq('id', channelId);

    // Step 2: Get video IDs from uploads playlist
    const playlistRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?` +
      `part=contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50&key=${YOUTUBE_API_KEY}`
    );
    const playlistData = await playlistRes.json();
    const videoIds = playlistData.items.map((item: any) => item.contentDetails.videoId).join(',');

    // Step 3: Get video details
    const videosRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?` +
      `part=snippet,contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    );
    const videosData = await videosRes.json();

    // Parse and filter videos
    const now = new Date().toISOString();
    const videos: Video[] = videosData.items
      .map((item: any) => {
        const durationSeconds = toSeconds(parse(item.contentDetails.duration));
        return {
          channel_id: channelId,
          youtube_id: item.id,
          title: item.snippet.title,
          thumbnail_url: item.snippet.thumbnails.medium.url,
          duration_seconds: durationSeconds,
          view_count: parseInt(item.statistics.viewCount, 10),
          published_at: item.snippet.publishedAt,
          fetched_at: now,
        };
      })
      .filter((v: Video) => v.duration_seconds >= 180); // Filter Shorts

    // Upsert to database
    await supabase
      .from('videos')
      .upsert(videos, { onConflict: 'youtube_id' });

    // Return top 20 newest
    const topVideos = videos
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, 20);

    return new Response(JSON.stringify(topVideos), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

### VideoCard Component with Formatting

```tsx
// Source: Patterns from https://date-fns.org/ and native Intl.NumberFormat
// File: src/components/VideoCard.tsx

import { formatDistanceToNow } from 'date-fns';

interface Video {
  id: string;
  youtube_id: string;
  title: string;
  thumbnail_url: string;
  duration_seconds: number;
  view_count: number;
  published_at: string;
}

function formatViewCount(count: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(count);
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function VideoCard({ video }: { video: Video }) {
  return (
    <a
      href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group"
    >
      <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-800">
        <img
          src={video.thumbnail_url}
          alt={video.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
          {formatDuration(video.duration_seconds)}
        </div>
      </div>
      <div className="mt-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-tight text-gray-900">
          {video.title}
        </h3>
        <p className="mt-1 text-xs text-gray-600">
          {formatViewCount(video.view_count)} views • {formatDistanceToNow(new Date(video.published_at), { addSuffix: true })}
        </p>
      </div>
    </a>
  );
}
```

### Database Migration for Videos Table

```sql
-- Source: Synthesized from requirements
-- File: supabase/migrations/XXXXXX_create_videos_table.sql

CREATE TABLE videos (
  id BIGSERIAL PRIMARY KEY,
  channel_id BIGINT NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  youtube_id TEXT UNIQUE NOT NULL, -- UNIQUE constraint for upsert
  title TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  view_count BIGINT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX videos_channel_id_idx ON videos(channel_id);
CREATE INDEX videos_published_at_idx ON videos(published_at DESC);
CREATE INDEX videos_fetched_at_idx ON videos(fetched_at DESC);
CREATE INDEX videos_duration_seconds_idx ON videos(duration_seconds);

-- RLS policies (public read for v1)
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "videos_select_policy" ON videos
  FOR SELECT USING (true);

-- Comment for documentation
COMMENT ON COLUMN videos.duration_seconds IS 'Video duration in seconds, used to filter Shorts (< 180s)';
COMMENT ON COLUMN videos.fetched_at IS 'Timestamp of last YouTube API fetch, used for cache invalidation';
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Moment.js for dates | date-fns or native Intl | 2020 | date-fns is tree-shakeable (smaller bundles), Intl has zero dependencies |
| Client-side API calls with CORS proxy | Server-side Edge Functions | 2021 | Better security (no exposed keys), caching control, rate limiting |
| search.list API for channel videos | channels.list → playlistItems.list → videos.list | Always preferred | 97% quota savings (100 units → 3 units) |
| 60-second Shorts threshold | 180-second threshold | 2024-2025 | YouTube extended Shorts to 3 minutes, must update filter logic |
| Manual PT format parsing | iso8601-duration library | 2020+ | Handles edge cases (weeks, fractional seconds) reliably |
| PostCSS for Tailwind | @tailwindcss/vite plugin (v4) | 2024 | Faster builds, simpler config, better DX |

**Deprecated/outdated:**
- **Moment.js**: No longer maintained, very large bundle size, use date-fns or native Intl instead
- **CORS proxies for YouTube API**: Security risk, unreliable, use Edge Functions
- **60s Shorts filter**: Outdated, YouTube now allows 180s Shorts
- **search.list for channel content**: 33x more expensive than playlistItems.list, avoid unless searching user queries

## Open Questions

Things that couldn't be fully resolved:

1. **Channel name resolution from URL-based handles**
   - What we know: Phase 1 shows @handle or truncated ID; Phase 2 should resolve actual names
   - What's unclear: Whether to update channel names on every video fetch or create separate Edge Function
   - Recommendation: Update channel names in fetch-channel-videos Edge Function (Step 1 already fetches snippet.title), store in channels.name column, no separate function needed

2. **Video thumbnail size selection**
   - What we know: YouTube provides default (120x90), medium (320x180), high (480x360), standard (640x480), maxres (1280x720)
   - What's unclear: Which size to store for best quality/performance tradeoff
   - Recommendation: Use medium (320x180) for cards, matches 16:9 aspect ratio, good quality, reasonable file size

3. **Lazy loading necessity for 20-video limit**
   - What we know: Lazy loading improves performance for large lists
   - What's unclear: Whether 20 videos (P0 requirement) justifies complexity
   - Recommendation: Skip lazy loading for v1 (20 videos = ~6MB total images), add later if expanding to 50+ videos

4. **Manual refresh vs. automatic polling**
   - What we know: REQ-VID-006 specifies manual refresh button
   - What's unclear: Should we also poll automatically in background, or only refresh on button click?
   - Recommendation: Manual only for v1 (simpler, respects quota), consider Supabase real-time subscriptions for automatic UI updates when data changes (no API polling needed)

5. **Error handling for partial failures**
   - What we know: Some videos in playlist may be deleted/private, videos.list silently omits them
   - What's unclear: Should UI show warning about missing videos, or silently display only available ones?
   - Recommendation: Log warning in Edge Function, display available videos without error message (better UX, user likely doesn't care about deleted videos)

## Sources

### Primary (HIGH confidence)
- [YouTube Data API v3 Official Documentation](https://developers.google.com/youtube/v3/docs) - All API methods, parameters, quota costs
- [YouTube Data API playlistItems.list](https://developers.google.com/youtube/v3/docs/playlistItems/list) - Fetching uploads playlist
- [YouTube Data API videos.list](https://developers.google.com/youtube/v3/docs/videos/list) - Fetching video details and duration
- [YouTube Data API channels.list](https://developers.google.com/youtube/v3/docs/channels/list) - Getting uploads playlist ID and channel name
- [YouTube Data API Errors](https://developers.google.com/youtube/v3/docs/errors) - Error handling, quota errors, 403/404 codes
- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions) - Creating, deploying, calling external APIs
- [Supabase Secrets Management](https://supabase.com/docs/guides/functions/secrets) - Environment variables, local vs production
- [Supabase JavaScript Upsert](https://supabase.com/docs/reference/javascript/upsert) - Batch inserts with conflict resolution
- [Supabase RLS Policies](https://supabase.com/docs/guides/database/postgres/row-level-security) - Public read-only policies

### Secondary (MEDIUM confidence)
- [YouTube API Complete Guide 2026](https://getlate.dev/blog/youtube-api) - Best practices verified with official docs
- [YouTube Shorts Duration 2026](https://awisee.com/blog/youtube-shorts-length/) - 180-second limit verified with multiple 2026 sources
- [Tailwind CSS Responsive Grid](https://www.uibun.dev/blog/tailwindcss-responsive-grid) - auto-fit pattern verified with official Tailwind docs
- [date-fns Official Documentation](https://date-fns.org/) - formatDistanceToNow usage
- [iso8601-duration NPM Package](https://www.npmjs.com/package/iso8601-duration) - Parse and toSeconds functions
- [Intl.NumberFormat MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) - Compact notation for view counts

### Tertiary (LOW confidence)
- [YouTube Data API Quota Limits](https://elfsight.com/blog/youtube-data-api-v3-limits-operations-resources-methods-etc/) - Community article, quota info verified with official docs
- [Supabase Cache Strategies](https://bootstrapped.app/guide/how-to-implement-caching-strategies-with-supabase) - General patterns, recommend testing with project specifics
- [React Intersection Observer](https://github.com/react-grid-layout/react-grid-layout) - Library pattern, evaluate necessity for 20-video limit

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official APIs and well-established libraries with stable releases
- Architecture: HIGH - Patterns from official docs and verified implementations
- Pitfalls: HIGH - Documented in official error guides and common community issues
- Shorts filtering: HIGH - 180-second threshold verified across multiple 2026 sources
- ISO 8601 parsing: MEDIUM - Library recommended based on NPM popularity, not official YouTube guidance
- Lazy loading: LOW - May be unnecessary for 20-video limit, marked as optional optimization

**Research date:** 2026-01-23
**Valid until:** 2026-02-23 (30 days - YouTube API is stable, but quota costs and Shorts definition could change)
