# Phase 4: Polish - Research

**Researched:** 2026-01-24
**Domain:** Loading states, error handling, performance optimization
**Confidence:** HIGH

## Summary

This phase focuses on polish elements: skeleton loaders, empty states, error boundaries, actionable error messages, mobile responsiveness, and performance optimization. The existing codebase uses Tailwind CSS v4 with `animate-pulse` for basic loading states and the Sonner library for toast notifications.

The standard approach is:
1. **Skeleton loaders:** Use Tailwind's built-in `animate-pulse` class on placeholder elements that match content dimensions (prevents CLS)
2. **Error boundaries:** Use `react-error-boundary` v6.1.0 library OR React Router v7's built-in `errorElement`/`ErrorBoundary` on routes
3. **Empty states:** Create reusable EmptyState component with icon, title, description, and optional action
4. **Performance:** Focus on code splitting with `React.lazy` + `Suspense`, bundle analysis, and measuring with web-vitals

**Primary recommendation:** Build reusable Skeleton components that match existing card dimensions exactly to prevent layout shift, implement a root ErrorBoundary using react-error-boundary, and add route-level error handling via React Router.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | v4.0.0 | `animate-pulse` for skeletons | Built-in, no extra dependency |
| Sonner | ^1.7.0 | Toast notifications | Already used, TypeScript-first, richColors support |
| React Router | ^7.0.0 | Route-level error handling | Built-in errorElement support |

### Recommended Additions
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-error-boundary | ^6.1.0 | Component error boundaries | De-facto standard for React 18+, hooks support |
| web-vitals | ^4.x | Performance measurement | Google's official library, ~2K gzipped |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-error-boundary | Class component boundary | react-error-boundary has hooks, reset keys, cleaner API |
| Manual skeleton divs | react-loading-skeleton | External lib adds complexity; Tailwind's animate-pulse is sufficient |
| web-vitals | Lighthouse only | web-vitals provides real-user metrics, not just lab data |

**Installation:**
```bash
npm install react-error-boundary web-vitals
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── skeletons/           # Skeleton loader components
│   │   ├── ChannelCardSkeleton.tsx
│   │   ├── VideoCardSkeleton.tsx
│   │   └── IdeaCardSkeleton.tsx
│   ├── EmptyState.tsx       # Reusable empty state component
│   └── ErrorFallback.tsx    # Error boundary fallback UI
├── pages/
│   └── [page].tsx           # Pages with integrated loading/error states
└── App.tsx                  # Root error boundary wrapper
```

### Pattern 1: Skeleton Components Matching Content Dimensions

**What:** Create skeleton components with exact same dimensions as real content to prevent CLS
**When to use:** Any async data loading (channels, videos, ideas)
**Example:**
```tsx
// Source: Tailwind CSS animate-pulse docs
// ChannelCardSkeleton.tsx
export function ChannelCardSkeleton() {
  return (
    <div className="bg-[#272727] rounded-xl p-4 animate-pulse">
      <div className="flex items-center gap-3">
        {/* Avatar placeholder - same size as real avatar */}
        <div className="w-12 h-12 rounded-full bg-[#3f3f3f]" />
        <div className="flex-1 space-y-2">
          {/* Name placeholder */}
          <div className="h-4 bg-[#3f3f3f] rounded w-3/4" />
          {/* Subscriber count placeholder */}
          <div className="h-3 bg-[#3f3f3f] rounded w-1/2" />
        </div>
      </div>
    </div>
  )
}
```

### Pattern 2: Error Boundary with Reset

**What:** Wrap routes/sections with error boundaries that offer recovery
**When to use:** At route level and around critical sections
**Example:**
```tsx
// Source: react-error-boundary npm docs
import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="text-center py-12">
      <h2 className="text-xl font-bold text-red-500 mb-2">Something went wrong</h2>
      <p className="text-[#aaaaaa] mb-4">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
      >
        Try again
      </button>
    </div>
  )
}

// In App.tsx
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <BrowserRouter>
    {/* routes */}
  </BrowserRouter>
</ErrorBoundary>
```

### Pattern 3: React Router Error Element

**What:** Route-level error handling with useRouteError
**When to use:** For route-specific errors (404s, data loading failures)
**Example:**
```tsx
// Source: React Router docs
import { useRouteError, isRouteErrorResponse } from 'react-router'

function RouteErrorBoundary() {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    return (
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold">{error.status}</h1>
        <p className="text-[#aaaaaa]">{error.statusText}</p>
      </div>
    )
  }

  return (
    <div className="text-center py-12">
      <h1 className="text-xl font-bold text-red-500">Error</h1>
      <p className="text-[#aaaaaa]">{error instanceof Error ? error.message : 'Unknown error'}</p>
    </div>
  )
}

// In route config
<Route path="/channels/:id" element={<ChannelDetailPage />} errorElement={<RouteErrorBoundary />} />
```

### Pattern 4: Reusable Empty State Component

**What:** Consistent empty state with icon, message, and optional action
**When to use:** Any list/grid that can be empty
**Example:**
```tsx
// EmptyState.tsx
interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="text-[#3f3f3f] mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-[#f1f1f1] mb-2">{title}</h3>
      <p className="text-[#aaaaaa] mb-4">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="text-red-500 hover:text-red-400"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
```

### Pattern 5: Actionable Error Toasts with Sonner

**What:** Use Sonner's richColors and action buttons for better error UX
**When to use:** API errors, network failures, validation errors
**Example:**
```tsx
// Source: Sonner GitHub docs
import { toast } from 'sonner'

// Basic error with richColors (already enabled via Toaster richColors prop)
toast.error('Failed to load videos')

// Error with action
toast.error('Failed to save idea', {
  action: {
    label: 'Retry',
    onClick: () => handleRetry(),
  },
})

// Error with description for context
toast.error('Network error', {
  description: 'Check your internet connection and try again.',
})
```

### Anti-Patterns to Avoid

- **Different skeleton dimensions than content:** Causes layout shift (CLS). Always match exact dimensions.
- **Spinner-only loading:** Spinners don't preview content structure. Use skeletons for better UX.
- **Catching errors silently:** Always show user-friendly message and recovery option.
- **Using Error Boundaries for form validation:** Use form validation libraries, not error boundaries.
- **Throwing intentionally for control flow:** Error boundaries are for unexpected errors only.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Error boundary reset logic | Custom retry state | react-error-boundary resetKeys | Handles edge cases, tested |
| Route error handling | Try-catch in components | React Router errorElement | Integrated with router, catches loader errors |
| Toast animations | CSS animations | Sonner | Accessibility, swipe-to-dismiss, queue management |
| Performance metrics | console.log timers | web-vitals library | Matches Chrome/Google tooling exactly |
| Skeleton shimmer effect | Custom CSS keyframes | Tailwind animate-pulse | Tested, accessible (motion-safe) |

**Key insight:** Polish features seem simple but have accessibility, edge cases, and cross-browser concerns. Use battle-tested solutions.

## Common Pitfalls

### Pitfall 1: Skeleton-Content Size Mismatch
**What goes wrong:** Skeleton shows, then content loads with different dimensions, causing visible layout jump
**Why it happens:** Skeleton dimensions are estimated, not measured from actual content
**How to avoid:**
- Use same Tailwind classes for skeleton placeholders as real content
- For images, use same aspect-ratio (aspect-video)
- Test by toggling between skeleton and content rapidly
**Warning signs:** CLS score > 0.1 in Lighthouse

### Pitfall 2: Error Boundary Placement Too High
**What goes wrong:** Single error crashes entire app instead of just affected section
**Why it happens:** Only root-level error boundary, no granular boundaries
**How to avoid:**
- Root boundary for catastrophic errors
- Route-level boundaries for page errors
- Section-level boundaries for isolated components (optional)
**Warning signs:** Users must refresh entire page for minor errors

### Pitfall 3: Missing Motion Preferences
**What goes wrong:** Animations run for users who prefer reduced motion
**Why it happens:** Not using Tailwind's motion-safe/motion-reduce variants
**How to avoid:** Use `motion-safe:animate-pulse` instead of `animate-pulse`
**Warning signs:** Accessibility audits flag motion issues

### Pitfall 4: Empty Toast Messages
**What goes wrong:** Error toast says "Error" with no useful information
**Why it happens:** Catching errors but not extracting useful message
**How to avoid:**
- Always include error.message or specific context
- Provide description for common errors
- Include retry action when applicable
**Warning signs:** Users don't know what went wrong or how to fix

### Pitfall 5: Testing Only on Fast Connections
**What goes wrong:** App feels slow on real mobile networks
**Why it happens:** Development on fast WiFi, no throttling testing
**How to avoid:**
- Test with Chrome DevTools Slow 3G throttling
- Verify skeletons appear (not flash too fast)
- Check LCP < 2.5s target on throttled connection
**Warning signs:** Page load > 3s on 3G in Lighthouse

### Pitfall 6: Supabase Real-Time Latency
**What goes wrong:** Real-time updates take > 2s to appear
**Why it happens:** RLS policies cause per-subscriber reads, network latency
**How to avoid:**
- Use specific channel names (already done)
- Keep subscription filters simple
- Test latency with multiple tabs
**Warning signs:** Changes don't appear within 2 seconds

## Code Examples

Verified patterns from official sources:

### Skeleton Grid Loading (Tailwind animate-pulse)
```tsx
// Source: https://tailwindcss.com/docs/animation
function ChannelGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ChannelCardSkeleton key={i} />
      ))}
    </div>
  )
}
```

### Error Boundary with Reset Keys
```tsx
// Source: react-error-boundary docs
import { ErrorBoundary } from 'react-error-boundary'

function App() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => setRefreshKey(k => k + 1)}
      resetKeys={[refreshKey]}
    >
      <AppContent key={refreshKey} />
    </ErrorBoundary>
  )
}
```

### Web Vitals Measurement
```tsx
// Source: web-vitals npm
import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals'

function reportWebVitals() {
  onCLS(console.log)  // Cumulative Layout Shift
  onFCP(console.log)  // First Contentful Paint
  onLCP(console.log)  // Largest Contentful Paint
  onINP(console.log)  // Interaction to Next Paint
  onTTFB(console.log) // Time to First Byte
}

// Call in main.tsx
reportWebVitals()
```

### Accessible Skeleton with motion-safe
```tsx
// Source: Tailwind CSS motion variants docs
function VideoCardSkeleton() {
  return (
    <div className="motion-safe:animate-pulse">
      <div className="aspect-video bg-[#272727] rounded-xl" />
      <div className="mt-3 space-y-2">
        <div className="h-4 bg-[#272727] rounded w-full" />
        <div className="h-4 bg-[#272727] rounded w-3/4" />
        <div className="h-3 bg-[#272727] rounded w-1/2" />
      </div>
    </div>
  )
}
```

### Code Splitting with React.lazy
```tsx
// Source: React docs, web.dev
import { lazy, Suspense } from 'react'

// Lazy load pages
const ChannelsPage = lazy(() => import('./pages/ChannelsPage'))
const ChannelDetailPage = lazy(() => import('./pages/ChannelDetailPage'))
const IdeasPage = lazy(() => import('./pages/IdeasPage'))

// In routes
<Suspense fallback={<PageSkeleton />}>
  <Routes>
    <Route path="/" element={<ChannelsPage />} />
    <Route path="/channels/:id" element={<ChannelDetailPage />} />
    <Route path="/ideas" element={<IdeasPage />} />
  </Routes>
</Suspense>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Class-based Error Boundaries | react-error-boundary v6+ with hooks | 2024 | useErrorBoundary hook, functional components |
| FID metric | INP (Interaction to Next Paint) | March 2024 | Focus on all interactions, not just first |
| Create React App | Vite with SWC | 2025 | Sub-second dev starts, faster builds |
| Babel | SWC (@vitejs/plugin-react-swc) | 2024-2025 | 20-70x faster compilation |
| Webpack manual chunks | Vite automatic code splitting | 2024+ | Better defaults, less config |

**Deprecated/outdated:**
- `useErrorHandler` hook: Replaced by `useErrorBoundary` in react-error-boundary v4+
- First Input Delay (FID): Replaced by INP as Core Web Vital (March 2024)
- Create React App: Officially sunset early 2025

## Open Questions

Things that couldn't be fully resolved:

1. **Optimal skeleton display duration threshold**
   - What we know: Best practices suggest showing skeletons only for loads > 200ms
   - What's unclear: Exact threshold for this specific app's data loading patterns
   - Recommendation: Start without threshold, add if skeletons flash too quickly

2. **Bundle size impact of react-error-boundary**
   - What we know: Library is small (~5KB), widely used
   - What's unclear: Exact impact on this bundle
   - Recommendation: Install and measure with rollup-plugin-visualizer

3. **Real-time latency under real network conditions**
   - What we know: Supabase targets < 100ms for message delivery
   - What's unclear: Actual latency for this app's subscriptions
   - Recommendation: Test with Chrome DevTools Network tab, measure with Performance panel

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS Animation Docs](https://tailwindcss.com/docs/animation) - animate-pulse usage
- [react-error-boundary GitHub](https://github.com/bvaughn/react-error-boundary) - v6.1.0 API (Jan 2026)
- [React Router Error Boundaries](https://reactrouter.com/how-to/error-boundary) - errorElement pattern
- [Vite Performance Guide](https://vite.dev/guide/performance) - Build optimization

### Secondary (MEDIUM confidence)
- [web.dev Core Web Vitals](https://web.dev/articles/vitals) - LCP, CLS, INP thresholds
- [Sonner GitHub](https://github.com/emilkowalski/sonner) - Toast patterns
- [Supabase Realtime Benchmarks](https://supabase.com/docs/guides/realtime/benchmarks) - Latency expectations

### Tertiary (LOW confidence)
- Various Medium/blog posts on skeleton loading patterns - Community practices
- LogRocket blog on empty states - Design patterns (needs validation)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via official docs
- Architecture patterns: HIGH - Patterns from official documentation
- Pitfalls: MEDIUM - Mix of official docs and community patterns

**Research date:** 2026-01-24
**Valid until:** 2026-02-24 (30 days - stable domain)
