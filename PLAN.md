# Plan: SSR-CSR Hybrid Architecture for Wajeer

## Objective

Keep SSR only for landing page (`/`) for SEO and fast initial load. Convert all other routes to CSR, partial rendering, and pre-rendering patterns based on TanStack Start best practices.

## Current Architecture Analysis

### SSR Configuration

- Global SSR enabled via TanStack Start plugin in `vite.config.ts`
- Root document (`__root.tsx`) renders full HTML structure
- No explicit SSR configuration per route

### Current Rendering Patterns

| Route               | Current                  | Data Fetching                             |
| ------------------- | ------------------------ | ----------------------------------------- |
| `/`                 | SSR                      | Client-side via `authClient.useSession()` |
| `/login`, `/signup` | SSR                      | Client-side forms                         |
| `/dashboard/*`      | CSR (via `"use client"`) | Client-side via `useQuery`                |
| `/api/*`            | Server-only              | Direct DB access                          |

### Issues to Address

1. Landing page fetches session client-side - should use server-side session check
2. No route loaders - suboptimal data loading patterns
3. No streaming - all content rendered in single pass
4. No pre-rendering for static content
5. No code splitting beyond `"use client"` directive

## Implementation Plan

### Phase 1: Landing Page SSR Optimization

**Goal:** True SSR for landing page with server-side session detection.

#### 1.1 Add Server-Side Session to Root Context

- Update `__root.tsx` to fetch session in `beforeLoad`
- Pass session to context for all routes
- Remove client-side session check from landing page

```tsx
// apps/web/src/routes/__root.tsx
export const Route = createRootRouteWithContext<RouterAppContext>()({
  beforeLoad: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    return { session };
  },
  // ... rest of config
});
```

#### 1.2 Update Landing Page to Use Server Context

- Use `Route.useRouteContext()` to get session
- Render personalized content server-side
- Remove client-side `authClient.useSession()` call

```tsx
// apps/web/src/routes/index.tsx
export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const { session } = Route.useRouteContext();
  // Server-side session available immediately
  // No loading states, no hydration mismatch
}
```

#### 1.3 Optimize SEO Meta Tags

- Add Open Graph tags in `head()` function
- Add structured data for marketplace platform
- Add canonical URL and proper title template

### Phase 2: CSR for Authentication Pages

**Goal:** Convert `/login` and `/signup` to CSR with client-side forms.

#### 2.1 Add `"use client"` Directive

- Add directive to `login.tsx` and `signup.tsx`
- Forms already use client-side state - no changes needed
- Keep minimal SSR shell for fast initial paint

#### 2.2 Implement Form Optimizations

- Add form validation with Zod + TanStack Form
- Implement optimistic UI for better UX
- Add proper error handling with toast notifications

### Phase 3: Dashboard Route Optimization

**Goal:** Optimize CSR dashboard with proper data loading patterns.

#### 3.1 Convert to Route Loader Pattern

Current pattern (client-side fetch):

```tsx
const { data: stats } = useQuery({
  queryKey: ["dashboard-stats"],
  queryFn: () => getDashboardStats(),
});
```

Target pattern (loader + React Query):

```tsx
// apps/web/src/routes/dashboard/index.tsx
import { queryOptions } from "@tanstack/react-query";

const dashboardStatsOptions = () =>
  queryOptions({
    queryKey: ["dashboard-stats"],
    queryFn: () => getDashboardStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

export const Route = createFileRoute("/dashboard/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(dashboardStatsOptions()),
  component: DashboardPage,
});

function DashboardPage() {
  const { data: stats } = useSuspenseQuery(dashboardStatsOptions());
  // Data available immediately, no loading states
}
```

#### 3.2 Implement Streaming for Slow Data

- Split critical and non-critical data
- Use `defer()` pattern for slow queries
- Stream data progressively to client

```tsx
export const Route = createFileRoute("/dashboard/")({
  loader: ({ context }) => {
    // Critical data - loaded immediately
    const criticalStats = context.queryClient.ensureQueryData(
      dashboardStatsOptions()
    );

    // Non-critical data - deferred
    const recentActivity = defer(
      context.queryClient.ensureQueryData(recentActivityOptions())
    );

    return { criticalStats, recentActivity };
  },
  component: DashboardPage,
});
```

#### 3.3 Add Pending/Error Components

- Add `pendingComponent` for loading states
- Add `errorComponent` for error handling
- Use Suspense boundaries for streaming content

```tsx
export const Route = createFileRoute("/dashboard/")({
  loader: ...,
  pendingComponent: () => <DashboardSkeleton />,
  errorComponent: ({ error }) => <DashboardError error={error} />,
  component: DashboardPage,
});
```

#### 3.4 Implement Code Splitting with Lazy Routes

- Create `.lazy.tsx` files for heavy components
- Keep route config in main file, lazy-load component

```tsx
// apps/web/src/routes/dashboard/shifts/index.tsx
export const Route = createFileRoute("/dashboard/shifts/")({
  loader: ...,
  pendingComponent: ShiftsSkeleton,
});

// apps/web/src/routes/dashboard/shifts/index.lazy.tsx
export const Route = createFileRoute("/dashboard/shifts/")({
  component: ShiftsListPage, // Lazy-loaded
});
```

### Phase 4: Pre-rendering for Static Content

**Goal:** Pre-render static pages for instant load.

#### 4.1 Identify Pre-renderable Routes

- `/` - Landing page (static shell, dynamic session)
- `/login` - Login page (static form)
- `/signup` - Signup page (static form)

#### 4.2 Configure Pre-rendering

- Add `prerender` configuration to routes
- Use ISR (Incremental Static Regeneration) where appropriate

```tsx
// apps/web/src/routes/index.tsx
export const Route = createFileRoute("/")({
  prerender: true, // Static shell pre-rendered
  beforeLoad: async ({ request }) => {
    // Dynamic session added at request time
    const session = await auth.api.getSession({ headers: request.headers });
    return { session };
  },
  component: HomeComponent,
});
```

### Phase 5: Component Architecture Optimization

**Goal:** Optimize UI components for CSR performance.

#### 5.1 Update Header Component

- Remove client-side session check
- Use route context for session
- Optimize for SSR/CSR boundary

```tsx
// apps/web/src/components/header.tsx
import { Link, useRouteContext } from "@tanstack/react-router";

export default function Header() {
  const { session } = useRouteContext({ from: "__root__" });
  // Session from context, not client-side fetch
}
```

#### 5.2 Update UserMenu Component

- Use context session instead of `authClient.useSession()`
- Keep client-side sign-out functionality

#### 5.3 Implement Design Principles (from emil-design-eng)

- Add micro-interactions with GSAP (buttons, cards)
- Add page transitions with Anime.js
- Use proper easing curves (ease-out for UI, custom curves for motion)
- Add responsive press feedback (`transform: scale(0.97)`)

#### 5.4 Apply shadcn/ui Patterns

- Use semantic colors (`bg-background`, `text-muted-foreground`)
- Use proper spacing (`gap-*` not `space-y-*`)
- Use `size-*` for equal dimensions
- Use `FieldGroup` + `Field` for form layout

### Phase 6: Performance Optimization

**Goal:** Achieve optimal Core Web Vitals.

#### 6.1 LCP Optimization

- Preload critical CSS
- Inline critical styles
- Lazy-load non-critical fonts

#### 6.2 CLS Optimization

- Reserve space for dynamic content
- Use skeleton loaders
- Avoid layout shifts during hydration

#### 6.3 FID Optimization

- Remove blocking scripts
- Use `"use client"` for interactive components
- Defer non-critical JavaScript

### Phase 7: Error Handling & Edge Cases

**Goal:** Handle all failure modes gracefully.

#### 7.1 Error Boundaries

- Add `errorComponent` to all routes
- Use `useQueryErrorResetBoundary` for React Query errors
- Provide user-friendly error messages

#### 7.2 Auth Failure Handling

- Handle expired sessions gracefully
- Redirect to login with preserved state
- Clear stale auth data on failure

#### 7.3 Network Failure Handling

- Retry logic for failed requests
- Offline mode support (network mode in React Query)
- Graceful degradation

## File Changes Summary

### Modified Files

1. `apps/web/src/routes/__root.tsx` - Add session to context
2. `apps/web/src/routes/index.tsx` - Use server-side session
3. `apps/web/src/routes/login.tsx` - Add `"use client"` directive
4. `apps/web/src/routes/signup.tsx` - Add `"use client"` directive
5. `apps/web/src/routes/dashboard.tsx` - Keep `"use client"` directive
6. `apps/web/src/routes/dashboard/index.tsx` - Add route loader
7. `apps/web/src/routes/dashboard/shifts/index.tsx` - Add route loader
8. `apps/web/src/routes/dashboard/available.tsx` - Add route loader
9. `apps/web/src/routes/dashboard/notifications.tsx` - Add route loader
10. `apps/web/src/routes/dashboard/profile.tsx` - Add route loader
11. `apps/web/src/routes/dashboard/schedule.tsx` - Add route loader
12. `apps/web/src/routes/dashboard/businesses/index.tsx` - Add route loader
13. `apps/web/src/components/header.tsx` - Use context session
14. `apps/web/src/components/user-menu.tsx` - Use context session

### New Files

1. `apps/web/src/routes/dashboard/index.lazy.tsx` - Lazy component
2. `apps/web/src/routes/dashboard/shifts/index.lazy.tsx` - Lazy component
3. `apps/web/src/routes/dashboard/available.lazy.tsx` - Lazy component
4. `apps/web/src/lib/query-options.ts` - Centralized query options factory
5. `apps/web/src/components/loading-skeletons.tsx` - Reusable skeleton components
6. `apps/web/src/components/error-components.tsx` - Reusable error components

### Deleted Patterns

- Client-side `authClient.useSession()` in SSR routes
- Direct `useQuery` without route loader
- Inline loading skeletons (centralize)

## Testing Strategy

### SSR Testing

1. Verify landing page renders without hydration mismatch
2. Check session is available server-side
3. Verify SEO meta tags are present
4. Test with different session states (logged in/out)

### CSR Testing

1. Verify dashboard loads progressively
2. Check streaming works for slow data
3. Test error handling and recovery
4. Verify code splitting reduces bundle size

### Performance Testing

1. Measure LCP < 2.5s for landing page
2. Measure CLS < 0.1 for all routes
3. Measure FID < 100ms for interactive elements
4. Compare bundle sizes before/after optimization

## Migration Steps (Sequential)

1. **Step 1:** Update `__root.tsx` with session context
2. **Step 2:** Update `index.tsx` to use server-side session
3. **Step 3:** Add `"use client"` to login/signup routes
4. **Step 4:** Create centralized query options factory
5. **Step 5:** Add route loaders to dashboard pages (one by one)
6. **Step 6:** Create lazy component files for code splitting
7. **Step 7:** Update header and user-menu components
8. **Step 8:** Add pending/error components to all routes
9. **Step 9:** Implement design enhancements (GSAP/Anime.js)
10. **Step 10:** Performance testing and optimization

## NOT in Scope

1. API route changes (keep as server handlers)
2. Database schema changes
3. Authentication flow changes
4. Business logic changes
5. Mobile app support
6. Offline-first architecture (deferred)
7. PWA configuration (deferred)
8. A/B testing infrastructure (deferred)

## What Already Exists

1. `"use client"` directive in dashboard routes
2. Server functions for all data operations
3. Middleware for auth protection
4. QueryClient with default options
5. Skeleton components in dashboard pages
6. SurrealProvider for database access

## Risks and Considerations

1. **Hydration mismatches** - Careful with server/client state differences
2. **Session timing** - Session may expire between SSR and CSR
3. **Bundle size** - Code splitting may increase total chunks
4. **Streaming support** - Needs proper Suspense boundaries
5. **Error handling** - Must handle loader failures gracefully

## Success Criteria

1. Landing page LCP < 2.5s
2. Dashboard pages feel instant (loader pattern)
3. No hydration mismatches
4. Bundle size reduced by 20%+
5. All Core Web Vitals pass
6. SEO meta tags present on landing page
7. Graceful error handling throughout
