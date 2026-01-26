# Phase 5: Foundation - Research

**Researched:** 2026-01-26
**Domain:** React page scaffolding, routing, loading states, empty states
**Confidence:** HIGH

## Summary

Phase 5 establishes the Analytics page foundation: routing, navigation link, loading skeleton, and empty state. The research focuses on replicating existing patterns from the v1.0 codebase rather than introducing new technologies. All implementation decisions (nav placement, empty state design, loading behavior, page layout) are at Claude's discretion per CONTEXT.md.

The existing codebase provides clear, consistent patterns for every required element:
- Navigation uses react-router NavLink with dark theme styling (#272727 bg, #3f3f3f hover)
- Pages follow a consistent layout (max-w-7xl mx-auto, p-4, header section)
- Loading states use skeleton components with motion-safe:animate-pulse
- Empty states use a reusable EmptyState component with icon, title, description, and optional action

**Primary recommendation:** Follow existing codebase patterns exactly. No new dependencies needed. Create AnalyticsPage.tsx mirroring ChannelsPage/IdeasPage structure, add NavLink to Nav.tsx, create AnalyticsPageSkeleton component.

## Standard Stack

### Core (Already Installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-router | ^7.0.0 | Route definition and NavLink component | Already used for /, /channels/:id, /ideas |
| react | ^18.3.1 | Page component, hooks for loading state | Foundation of entire app |
| tailwindcss | ^4.0.0 | Dark theme styling via utility classes | All existing components use it |

### Supporting (Already Installed)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @supabase/supabase-js | ^2.91.0 | Fetch channels for empty state check | Only if zero channels tracked |
| sonner | ^1.7.0 | Toast notifications | If adding refresh or action feedback |

### No New Dependencies Needed

This phase requires zero new packages. Everything is achievable with existing stack.

**Installation:**
```bash
# No installation needed
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── pages/
│   └── AnalyticsPage.tsx        # NEW - Main analytics page
├── components/
│   └── skeletons/
│       └── AnalyticsPageSkeleton.tsx  # NEW - Loading skeleton
└── App.tsx                      # MODIFY - Add route
```

### Pattern 1: Page Layout

**What:** Consistent page structure with max-width container, padding, header section
**When to use:** All top-level pages
**Example:**
```typescript
// Source: Existing ChannelsPage.tsx, IdeasPage.tsx patterns
export function AnalyticsPage() {
  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
      </div>

      {/* Content area */}
      {/* ... */}
    </div>
  )
}
```

### Pattern 2: Loading State with Skeleton

**What:** Show skeleton placeholder while data loads
**When to use:** Any page fetching data on mount
**Example:**
```typescript
// Source: Existing ChannelsPage.tsx loading pattern
export function AnalyticsPage() {
  const { channels, isLoading, error } = useChannels()

  // Loading State
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-6">
          <div className="h-8 w-32 bg-[#272727] rounded motion-safe:animate-pulse" />
        </div>
        <AnalyticsPageSkeleton />
      </div>
    )
  }

  // ... rest of component
}
```

### Pattern 3: Empty State with Call-to-Action

**What:** Helpful message when no data exists, with action to resolve
**When to use:** When checking for tracked channels returns zero
**Example:**
```typescript
// Source: Existing EmptyState component usage in ChannelGrid.tsx, IdeasPage.tsx
import { EmptyState } from '../components/EmptyState'

function BarChartIcon() {
  return (
    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}

// In AnalyticsPage:
if (channels.length === 0) {
  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      <EmptyState
        icon={<BarChartIcon />}
        title="No channels to analyze"
        description="Add some YouTube channels to start seeing analytics."
        action={{
          label: "Add a channel",
          onClick: () => navigate('/')
        }}
      />
    </div>
  )
}
```

### Pattern 4: Navigation Link

**What:** NavLink with active state styling
**When to use:** Adding new top-level navigation items
**Example:**
```typescript
// Source: Existing Nav.tsx pattern
<NavLink
  to="/analytics"
  className={({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-[#3f3f3f] text-white'
        : 'text-[#aaaaaa] hover:bg-[#3f3f3f] hover:text-white'
    }`
  }
>
  Analytics
</NavLink>
```

### Pattern 5: Skeleton Component

**What:** Pulsing placeholder matching real content dimensions
**When to use:** Loading state for any data-dependent section
**Example:**
```typescript
// Source: Existing skeleton components in src/components/skeletons/
export function AnalyticsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Section header skeleton */}
      <div className="h-6 w-48 bg-[#272727] rounded motion-safe:animate-pulse" />

      {/* Cards grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-[#272727] rounded-xl p-4 h-32 motion-safe:animate-pulse" />
        ))}
      </div>

      {/* Chart placeholder skeleton */}
      <div className="bg-[#272727] rounded-xl p-4 h-64 motion-safe:animate-pulse" />
    </div>
  )
}
```

### Anti-Patterns to Avoid

- **Inline loading states:** Don't scatter loading checks throughout JSX. Use early return pattern like existing pages.
- **Custom loading spinners:** Use skeleton matching content shape, not generic spinners. Follows existing pattern.
- **Non-accessible animations:** Always use `motion-safe:animate-pulse` to respect prefers-reduced-motion.
- **Inconsistent container width:** Use `max-w-7xl mx-auto` like all other pages.
- **Different header styles:** Use `text-2xl font-bold` like existing page headers.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Empty state display | Custom div with message | Existing EmptyState component | Consistent styling, action support, already tested |
| Navigation active state | Manual route matching | NavLink className function | Built into react-router, handles exact matching |
| Loading animation | Custom keyframes | Tailwind animate-pulse | Already defined, accessibility-aware |
| Route definition | Manual path parsing | React Router Route component | Already configured in App.tsx |

**Key insight:** Every UI pattern needed for this phase already exists in the codebase. Reuse, don't reinvent.

## Common Pitfalls

### Pitfall 1: Forgetting to Add Route in App.tsx

**What goes wrong:** Analytics link works but page shows blank/404
**Why it happens:** NavLink added to Nav.tsx but Route not added to App.tsx Routes
**How to avoid:** Add both NavLink AND Route in same commit
**Warning signs:** Link navigates but shows wrong page

### Pitfall 2: Inconsistent Dark Theme Colors

**What goes wrong:** Analytics page looks visually different from rest of app
**Why it happens:** Using slightly different hex values instead of established colors
**How to avoid:** Only use these exact colors:
- Background: `#0f0f0f` (or `bg-[#0f0f0f]`)
- Cards/surfaces: `#272727` (or `bg-[#272727]`)
- Borders/hover: `#3f3f3f` (or `border-[#3f3f3f]`)
- Primary text: `#f1f1f1` (or `text-[#f1f1f1]`)
- Secondary text: `#aaaaaa` (or `text-[#aaaaaa]`)
**Warning signs:** Cards don't match existing app visually

### Pitfall 3: Navigation Order Confusion

**What goes wrong:** Analytics appears in wrong position, breaks visual hierarchy
**Why it happens:** Not considering information architecture
**How to avoid:** Place Analytics after Ideas (Channels -> Ideas -> Analytics flow)
**Warning signs:** User confusion about app structure

### Pitfall 4: Missing Loading State on Initial Render

**What goes wrong:** Flash of empty state before data loads
**Why it happens:** Not starting isLoading as true
**How to avoid:** Initialize loading state to true, only render content after load
**Warning signs:** Brief flash of "No channels" before content appears

### Pitfall 5: Not Reusing useChannels Hook

**What goes wrong:** Duplicate Supabase queries, inconsistent data
**Why it happens:** Creating new fetch logic instead of reusing existing hook
**How to avoid:** Import and use existing useChannels hook
**Warning signs:** Writing supabase.from('channels').select() directly in component

## Code Examples

Verified patterns from existing codebase:

### Complete Page Structure
```typescript
// Source: Pattern from IdeasPage.tsx + ChannelsPage.tsx
import { useChannels } from '../hooks/useChannels'
import { useNavigate } from 'react-router'
import { EmptyState } from '../components/EmptyState'

function BarChartIcon() {
  return (
    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}

export function AnalyticsPage() {
  const { channels, isLoading, error } = useChannels()
  const navigate = useNavigate()

  // Loading State
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-6">
          <div className="h-8 w-32 bg-[#272727] rounded motion-safe:animate-pulse" />
        </div>
        {/* Skeleton content */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-[#272727] rounded-xl p-4 h-32 motion-safe:animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Analytics</h1>
        <div className="p-4 bg-red-900/20 border border-red-600 rounded-lg text-red-400">
          <p>Error loading analytics: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Refresh page
          </button>
        </div>
      </div>
    )
  }

  // Empty State
  if (channels.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Analytics</h1>
        <EmptyState
          icon={<BarChartIcon />}
          title="No channels to analyze"
          description="Add some YouTube channels to start seeing analytics."
          action={{
            label: "Add a channel",
            onClick: () => navigate('/')
          }}
        />
      </div>
    )
  }

  // Content (placeholder for future phases)
  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      <div className="bg-[#272727] rounded-xl p-6 text-center text-[#aaaaaa]">
        <p>Analytics dashboard coming soon.</p>
        <p className="text-sm mt-2">Tracking {channels.length} channel{channels.length !== 1 ? 's' : ''}</p>
      </div>
    </div>
  )
}
```

### Navigation Link Addition
```typescript
// Source: Nav.tsx - add after Ideas NavLink
<NavLink
  to="/analytics"
  className={({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-[#3f3f3f] text-white'
        : 'text-[#aaaaaa] hover:bg-[#3f3f3f] hover:text-white'
    }`
  }
>
  Analytics
</NavLink>
```

### Route Addition
```typescript
// Source: App.tsx - add to Routes
import { AnalyticsPage } from './pages/AnalyticsPage'

// Inside Routes:
<Route path="/analytics" element={<AnalyticsPage />} />
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Spinner loading indicators | Skeleton matching content shape | 2020+ | Better perceived performance |
| Manual route string matching | NavLink with isActive callback | react-router v6+ | Cleaner code, automatic active state |
| Generic empty states | Context-specific empty states with actions | UX best practice | Higher engagement, clearer next steps |

**Deprecated/outdated:**
- `react-router-dom`: Project uses `react-router` v7 (unified package)
- `Switch` component: Replaced by `Routes` in react-router v6+
- `animate-pulse` without `motion-safe`: Should always use `motion-safe:animate-pulse`

## Open Questions

1. **Navigation Icon**
   - What we know: Existing nav items use text only (Channels, Ideas)
   - What's unclear: Should Analytics have an icon to differentiate?
   - Recommendation: Keep text-only for consistency, add icon later if needed

2. **Future Layout Sections**
   - What we know: Phase 6+ will add channel cards, Phase 7+ will add charts
   - What's unclear: Exact grid/section layout for analytics content
   - Recommendation: Use simple placeholder now, refine layout when adding real content

## Sources

### Primary (HIGH confidence)

- **Existing codebase** - Direct inspection of:
  - `src/components/Nav.tsx` - Navigation pattern
  - `src/components/EmptyState.tsx` - Empty state component
  - `src/components/skeletons/*.tsx` - Skeleton patterns
  - `src/pages/ChannelsPage.tsx` - Page layout, loading/error patterns
  - `src/pages/IdeasPage.tsx` - Page layout, empty state usage
  - `src/App.tsx` - Route configuration
  - `src/index.css` - CSS custom properties for theme
  - `src/hooks/useChannels.ts` - Channel fetching hook

### Secondary (MEDIUM confidence)

- **React Router v7** - NavLink API, Route configuration
- **Tailwind CSS v4** - Utility classes, motion-safe prefix

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new dependencies, all patterns exist in codebase
- Architecture: HIGH - Direct replication of existing page patterns
- Pitfalls: HIGH - Based on actual codebase review, not speculation

**Research date:** 2026-01-26
**Valid until:** 60+ days (no external dependencies, patterns stable)

---

## Implementation Recommendations (Claude's Discretion)

Based on research, these are my recommendations for the areas marked "Claude's Discretion" in CONTEXT.md:

### Navigation Placement

**Recommendation:** Add "Analytics" as third nav item after "Ideas"

Rationale:
- Channels (home) -> Ideas (saved content) -> Analytics (insights) is logical flow
- Keeps primary actions (Channels, Ideas) prominent
- Analytics is supplementary feature, not core workflow

### Empty State Design

**Recommendation:** Use bar chart icon with message "No channels to analyze" and CTA "Add a channel"

Rationale:
- Bar chart icon visually represents analytics
- Message explains WHY empty (no data source)
- Action takes user directly to resolution (channels page)
- Matches existing empty state pattern (icon + title + description + action)

### Loading Behavior

**Recommendation:** Full page skeleton with header placeholder + 3 card placeholders + chart placeholder

Rationale:
- Skeleton should hint at future content shape (cards, charts)
- 3 cards matches lg:grid-cols-3 breakpoint
- motion-safe:animate-pulse for accessibility
- Header placeholder maintains visual stability

### Page Layout

**Recommendation:** Single column layout with sections:
1. Page header (h1 "Analytics")
2. Content area (placeholder now, channel cards in Phase 6)
3. Chart area (placeholder now, charts in Phase 8)

Rationale:
- Simple structure that future phases can expand
- max-w-7xl container matches existing pages
- Vertical stacking works on all screen sizes
