# Phase 1: Foundation - Research

**Researched:** 2026-01-23
**Domain:** React + Vite + Supabase + Tailwind CSS foundation with real-time subscriptions
**Confidence:** HIGH

## Summary

This research covers the complete foundation stack for a YouTube Competitor Tracker application. The stack is well-established: React 18 with Vite 7.x for the frontend build system, Supabase for PostgreSQL database with real-time subscriptions, Tailwind CSS for styling, and React Router 7 for navigation.

The key technical challenges in this phase are: (1) YouTube URL parsing to extract channel IDs from multiple URL formats, (2) Supabase real-time subscriptions for instant channel sync, (3) Row Level Security policies for data access control, and (4) responsive grid layout with dark theme styling.

**Primary recommendation:** Use the established Vite + React + Supabase stack with Sonner for toasts, React Router 7 in SPA mode, and native HTML `<dialog>` element for confirmation dialogs. Keep the architecture simple with a flat component structure initially.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.x | UI framework | Required per PRD (REQ-TC-001) |
| Vite | 7.x | Build tool & dev server | Required per PRD, current stable is 7.3.1 |
| @supabase/supabase-js | 2.x | Database client & realtime | Required per PRD (REQ-TC-003) |
| Tailwind CSS | 4.x | Utility CSS framework | Required per PRD (REQ-TC-002) |
| React Router | 7.x | Client-side routing | Standard for React SPAs, SPA mode supported |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| sonner | latest | Toast notifications | Error/success toasts (REQ-UI-004) |
| @tailwindcss/vite | latest | Tailwind Vite plugin | Required for Tailwind 4.x integration |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| sonner | react-hot-toast | Both good; Sonner has better animations, shadcn/ui ecosystem uses it |
| React Router | TanStack Router | React Router 7 is simpler for basic navigation needs |

**Installation:**
```bash
npm create vite@latest youtube-tracker -- --template react-ts
cd youtube-tracker
npm install @supabase/supabase-js sonner react-router
npm install -D tailwindcss @tailwindcss/vite
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── ChannelCard.tsx   # Individual channel display
│   ├── ChannelGrid.tsx   # Grid container for channels
│   ├── AddChannelForm.tsx # URL input form
│   └── ConfirmDialog.tsx # Delete confirmation
├── pages/                # Route-level components
│   ├── ChannelsPage.tsx
│   └── IdeasPage.tsx
├── lib/                  # Utilities and client setup
│   ├── supabase.ts       # Supabase client singleton
│   ├── youtube.ts        # URL parsing utilities
│   └── types.ts          # TypeScript type definitions
├── hooks/                # Custom React hooks
│   └── useChannels.ts    # Channel data + realtime
├── App.tsx               # Router setup
├── main.tsx              # Entry point
└── index.css             # Tailwind imports + dark theme
```

### Pattern 1: Supabase Client Singleton
**What:** Single instance of Supabase client shared across app
**When to use:** Always - prevents multiple connections
**Example:**
```typescript
// Source: https://supabase.com/docs/reference/javascript/initializing
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

### Pattern 2: Real-time Subscription with Cleanup
**What:** Subscribe to Postgres changes with proper useEffect cleanup
**When to use:** Any component needing live updates
**Example:**
```typescript
// Source: https://supabase.com/docs/guides/realtime/postgres-changes
useEffect(() => {
  const channel = supabase
    .channel('channels-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'channels'
      },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          setChannels(prev => [...prev, payload.new as Channel])
        } else if (payload.eventType === 'DELETE') {
          setChannels(prev => prev.filter(c => c.id !== payload.old.id))
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [])
```

### Pattern 3: YouTube URL Parsing
**What:** Extract channel ID from multiple URL formats
**When to use:** Add channel by URL feature
**Example:**
```typescript
// src/lib/youtube.ts
export function parseYouTubeChannelUrl(input: string): { type: 'id' | 'handle' | 'custom', value: string } | null {
  const trimmed = input.trim()

  // Raw channel ID (starts with UC, 24 chars)
  if (/^UC[\w-]{22}$/.test(trimmed)) {
    return { type: 'id', value: trimmed }
  }

  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
    const path = url.pathname

    // /channel/UC... format
    const channelMatch = path.match(/\/channel\/(UC[\w-]{22})/)
    if (channelMatch) return { type: 'id', value: channelMatch[1] }

    // /@handle format
    const handleMatch = path.match(/\/@([\w.-]+)/)
    if (handleMatch) return { type: 'handle', value: handleMatch[1] }

    // /c/customname format
    const customMatch = path.match(/\/c\/([\w.-]+)/)
    if (customMatch) return { type: 'custom', value: customMatch[1] }

    // /user/username format (legacy)
    const userMatch = path.match(/\/user\/([\w.-]+)/)
    if (userMatch) return { type: 'custom', value: userMatch[1] }

  } catch {
    return null
  }

  return null
}
```

### Pattern 4: Dark Theme Configuration
**What:** Class-based dark mode with YouTube aesthetic
**When to use:** App-wide styling
**Example:**
```css
/* src/index.css */
@import "tailwindcss";

/* Enable class-based dark mode */
@custom-variant dark (&:where(.dark, .dark *));

/* YouTube dark theme colors */
:root {
  --color-background: #0f0f0f;
  --color-surface: #272727;
  --color-text-primary: #f1f1f1;
  --color-text-secondary: #aaaaaa;
}

.dark {
  background-color: var(--color-background);
  color: var(--color-text-primary);
}
```

### Anti-Patterns to Avoid
- **Creating multiple Supabase clients:** Causes connection issues and memory leaks
- **Not cleaning up realtime subscriptions:** Memory leaks and "channel already subscribed" errors
- **Using inline Supabase credentials:** Security risk, use environment variables
- **Subscribing multiple times to same channel:** Race condition in useEffect without proper deps

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Toast notifications | Custom toast system | sonner | Animations, stacking, dark mode, accessibility |
| Confirmation dialogs | Custom modal state management | Native `<dialog>` element | Built-in accessibility, focus trap, backdrop |
| Responsive grids | CSS media queries manually | Tailwind responsive prefixes | Consistency, maintainability, mobile-first |
| URL parsing | Basic string splitting | Comprehensive regex with URL API | Edge cases, malformed URLs, multiple formats |
| Real-time sync | Polling or manual refresh | Supabase Realtime | WebSocket efficiency, built-in reconnection |

**Key insight:** The browser's native `<dialog>` element (supported since March 2022) handles focus trapping, backdrop, and Escape key automatically. Using a library for simple confirmation dialogs is overkill.

## Common Pitfalls

### Pitfall 1: Supabase Realtime Not Receiving Events
**What goes wrong:** Subscription shows "SUBSCRIBED" but no events arrive
**Why it happens:** Realtime not enabled for table in Supabase dashboard, or RLS policies block access
**How to avoid:**
1. Enable Realtime for the table: Dashboard > Database > Replication > Enable for `channels` table
2. Ensure RLS policies allow SELECT for the user's role
**Warning signs:** Console shows subscription status but callbacks never fire

### Pitfall 2: Channel Already Subscribed Error
**What goes wrong:** "subscribe can only be called once per channel instance"
**Why it happens:** React StrictMode double-invokes useEffect, or cleanup function doesn't complete before re-subscribe
**How to avoid:** Use unique channel names, ensure cleanup runs before new subscription
```typescript
const channelName = `channels-${Date.now()}`  // Unique per mount
```
**Warning signs:** Error appears after navigation or component remount

### Pitfall 3: Environment Variables Not Loading
**What goes wrong:** `import.meta.env.VITE_SUPABASE_URL` is undefined
**Why it happens:** Variables not prefixed with `VITE_`, or `.env` file not in project root
**How to avoid:**
1. Always prefix with `VITE_`
2. Restart dev server after adding env vars
3. Create `.env.local` for local-only values
**Warning signs:** "createClient requires a supabaseUrl" error

### Pitfall 4: TypeScript Types Out of Sync
**What goes wrong:** Type errors after changing database schema
**Why it happens:** Generated types don't match current schema
**How to avoid:** Regenerate types after schema changes:
```bash
supabase gen types typescript --project-id <id> > src/lib/database.types.ts
```
**Warning signs:** Property does not exist on type errors for valid columns

### Pitfall 5: Mobile Grid Layout Issues
**What goes wrong:** Cards overflow or layout breaks on mobile
**Why it happens:** Not using mobile-first responsive classes correctly
**How to avoid:** Start with mobile layout (unprefixed), add larger breakpoints
```tsx
// CORRECT: 1 col mobile, 2 tablet, 3 desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// WRONG: Only 3 cols at md+, broken on mobile
<div className="grid md:grid-cols-3 gap-4">
```
**Warning signs:** Layout only works on desktop

### Pitfall 6: Duplicate Channel Prevention Race Condition
**What goes wrong:** Same channel added twice despite UI check
**Why it happens:** Client-side check, then insert - another user can insert between
**How to avoid:** Use database unique constraint on `youtube_id` column, handle constraint violation error gracefully
**Warning signs:** Duplicate entries in database despite UI preventing double-submit

## Code Examples

Verified patterns from official sources:

### Supabase Client with TypeScript
```typescript
// Source: https://supabase.com/docs/reference/javascript/typescript-support
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Type-safe query
const { data, error } = await supabase
  .from('channels')
  .select('*')
  .order('created_at', { ascending: false })
```

### RLS Policy for Channels Table
```sql
-- Source: https://supabase.com/docs/guides/auth/row-level-security
-- Enable RLS
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read channels (public data)
CREATE POLICY "Channels are viewable by everyone"
ON channels FOR SELECT
USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Authenticated users can add channels"
ON channels FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to delete their own channels
CREATE POLICY "Users can delete channels they added"
ON channels FOR DELETE
TO authenticated
USING (auth.uid() = added_by);
```

### Responsive Channel Grid
```tsx
// Source: https://tailwindcss.com/docs/responsive-design
export function ChannelGrid({ channels }: { channels: Channel[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {channels.map(channel => (
        <ChannelCard key={channel.id} channel={channel} />
      ))}
    </div>
  )
}
```

### Toast Notification with Sonner
```tsx
// Source: https://sonner.emilkowal.ski/
import { Toaster, toast } from 'sonner'

// In App.tsx root
<Toaster position="bottom-right" theme="dark" richColors />

// Usage
toast.error('Invalid YouTube URL')
toast.success('Channel added successfully')
```

### Native Dialog for Confirmation
```tsx
// Source: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog
import { useRef } from 'react'

export function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const open = () => dialogRef.current?.showModal()
  const close = () => dialogRef.current?.close()

  return (
    <dialog
      ref={dialogRef}
      className="bg-[#272727] text-white rounded-lg p-6 backdrop:bg-black/50"
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-gray-400">{message}</p>
      <div className="mt-4 flex gap-2 justify-end">
        <button
          onClick={() => { close(); onCancel?.() }}
          className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500"
        >
          Cancel
        </button>
        <button
          onClick={() => { close(); onConfirm() }}
          className="px-4 py-2 rounded bg-red-600 hover:bg-red-500"
        >
          Delete
        </button>
      </div>
    </dialog>
  )
}
```

### React Router 7 SPA Setup
```tsx
// Source: https://reactrouter.com/how-to/spa
// src/App.tsx
import { BrowserRouter, Routes, Route, NavLink } from 'react-router'
import { ChannelsPage } from './pages/ChannelsPage'
import { IdeasPage } from './pages/IdeasPage'

export function App() {
  return (
    <BrowserRouter>
      <nav className="flex gap-4 p-4 bg-[#272727]">
        <NavLink
          to="/"
          className={({ isActive }) => isActive ? 'text-white' : 'text-gray-400'}
        >
          Channels
        </NavLink>
        <NavLink
          to="/ideas"
          className={({ isActive }) => isActive ? 'text-white' : 'text-gray-400'}
        >
          Ideas
        </NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<ChannelsPage />} />
        <Route path="/ideas" element={<IdeasPage />} />
      </Routes>
    </BrowserRouter>
  )
}
```

### Vite Environment Variables TypeScript Support
```typescript
// Source: https://vite.dev/guide/env-and-mode.html
// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CRA (Create React App) | Vite | 2022-2023 | Faster builds, better DX |
| Tailwind PostCSS plugin | @tailwindcss/vite plugin | Tailwind 4.x | Simpler config, no postcss.config.js |
| react-modal library | Native `<dialog>` element | Baseline 2022 | Less JS, better accessibility |
| Class components | Function components + hooks | React 16.8+ | Standard practice |
| React Router v6 | React Router v7 | 2024 | Framework mode, SPA mode options |

**Deprecated/outdated:**
- Create React App: Officially deprecated, use Vite
- tailwind.config.js: Simplified in Tailwind 4.x with CSS-based config
- `@` prefix for Tailwind directives: Now use `@import "tailwindcss"`

## Open Questions

Things that couldn't be fully resolved:

1. **YouTube API for Handle Resolution**
   - What we know: Handles (@username) need API call to resolve to channel ID
   - What's unclear: Whether to resolve handles client-side or server-side
   - Recommendation: Defer to Phase 2 YouTube API integration; for Phase 1, only support /channel/UC... format and raw channel IDs

2. **Cascade Delete Implementation**
   - What we know: REQ-CH-004 requires cascade delete for videos and ideas
   - What's unclear: Whether to use database-level CASCADE or application-level delete
   - Recommendation: Use PostgreSQL foreign key with ON DELETE CASCADE for automatic cleanup

## Sources

### Primary (HIGH confidence)
- Supabase official docs - Client initialization, realtime subscriptions, RLS policies
- Vite official docs - Environment variables, React template setup
- Tailwind CSS official docs - Responsive design, dark mode, Vite plugin
- React Router official docs - SPA mode, declarative routing

### Secondary (MEDIUM confidence)
- Sonner documentation (sonner.emilkowal.ski) - Toast API and configuration
- Community comparisons of toast libraries - Sonner vs react-hot-toast

### Tertiary (LOW confidence)
- YouTube URL parsing patterns - Community GitHub gists, need validation with real URLs
- React Router 7 SPA mode stability - Known bugs being ironed out per official discussions

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries specified in PRD or well-established
- Architecture: HIGH - Standard React patterns with official Supabase guidance
- Pitfalls: HIGH - Documented in official troubleshooting guides
- YouTube URL parsing: MEDIUM - Community patterns, needs testing with edge cases

**Research date:** 2026-01-23
**Valid until:** 2026-02-23 (30 days - stable stack)
