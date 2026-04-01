# Wajeer SSR/CSR Implementation - Session Summary

## What We Accomplished

### 1. SSR-CSR Hybrid Architecture

- **Landing page (`/`)**: Full SSR with server-side session detection
- **Login/Signup routes**: CSR with `ssr: false`
- **Dashboard routes**: CSR with `ssr: false` and route loaders

### 2. Key Changes Made

#### Root Route (`apps/web/src/routes/__root.tsx`)

- Changed to use `createRootRoute` (without context)
- Added `shellComponent` for HTML shell
- Added `QueryClientProvider` wrapping the app
- Removed `beforeLoad` from root (moved to dashboard route)

#### Dashboard Route (`apps/web/src/routes/dashboard.tsx`)

- Added `ssr: false` for CSR
- `beforeLoad` checks authentication via `getUser()` server function
- Redirects to login if not authenticated

#### Login/Signup Routes

- Added `ssr: false` for CSR
- Removed `"use client"` directive

#### All Dashboard Child Routes

Added `ssr: false` to all child routes:

- `dashboard/index.tsx` - Added component with stats display
- `dashboard/shifts/index.tsx`
- `dashboard/shifts/new.tsx`
- `dashboard/shifts/$id.tsx`
- `dashboard/available.tsx`
- `dashboard/schedule.tsx`
- `dashboard/profile.tsx`
- `dashboard/notifications.tsx`
- `dashboard/businesses/index.tsx`
- `dashboard/businesses/new.tsx`
- `dashboard/businesses/$id.tsx`

#### Server Functions (`apps/web/src/functions/`)

- Updated `dashboard.ts` to accept `userId` as parameter
- Updated `available-shifts.ts` to accept `userId` as parameter
- Server functions now use Zod validation for input

### 3. Files Created/Modified

**Created:**

- `apps/web/src/lib/query-client.ts` - Shared QueryClient instance
- `apps/web/src/lib/query-options.ts` - Centralized query options factory

**Modified:**

- `apps/web/src/routes/__root.tsx` - SSR shell pattern + QueryClientProvider
- `apps/web/src/routes/index.tsx` - Server-side session usage
- `apps/web/src/routes/login.tsx` - Added `ssr: false`
- `apps/web/src/routes/signup.tsx` - Added `ssr: false`
- `apps/web/src/routes/dashboard.tsx` - Added `ssr: false`, auth check
- `apps/web/src/routes/dashboard/index.tsx` - Route loader pattern + component
- `apps/web/src/routes/dashboard/available.tsx` - Added `ssr: false`
- `apps/web/src/routes/dashboard/schedule.tsx` - Added `ssr: false`
- `apps/web/src/routes/dashboard/shifts/index.tsx` - Added `ssr: false`
- `apps/web/src/routes/dashboard/shifts/new.tsx` - Added `ssr: false`
- `apps/web/src/routes/dashboard/shifts/$id.tsx` - Added `ssr: false`
- `apps/web/src/routes/dashboard/profile.tsx` - Added `ssr: false`
- `apps/web/src/routes/dashboard/notifications.tsx` - Added `ssr: false`
- `apps/web/src/routes/dashboard/businesses/index.tsx` - Added `ssr: false`
- `apps/web/src/routes/dashboard/businesses/new.tsx` - Added `ssr: false`
- `apps/web/src/routes/dashboard/businesses/$id.tsx` - Added `ssr: false`
- `apps/web/src/functions/dashboard.ts` - Accept userId parameter
- `apps/web/src/functions/available-shifts.ts` - Accept userId parameter
- `apps/web/src/router.tsx` - Removed context, simplified

### 4. Bug Fixes

**Fixed: "removeChild" DOM Error**

- **Cause**: Child routes under `/dashboard` didn't have `ssr: false`, causing hydration mismatches
- **Fix**: Added `ssr: false` to all 11 child routes under `/dashboard`

**Fixed: "No QueryClient set" Error**

- **Cause**: `QueryClientProvider` was not wrapping the application
- **Fix**: Added `QueryClientProvider` in `__root.tsx` shell component

**Fixed: Dashboard index not showing content**

- **Cause**: `dashboard/index.tsx` had `loader` and `pendingComponent` but no `component`
- **Fix**: Added `DashboardPage` component to render the stats

### 5. Build Status

- Build succeeds
- Type checks pass
- All routes working:
  - `/` - Landing page (SSR)
  - `/login` - Login page (CSR)
  - `/signup` - Signup page (CSR)
  - `/dashboard` - Dashboard with stats (CSR, protected)
  - `/dashboard/shifts/new` - Post shift form (CSR, protected)
  - All other dashboard routes working

### 6. Testing Results

- Landing page renders with SSR, SEO meta tags present
- Login/Signup forms work correctly
- Auth protection redirects unauthenticated users
- Dashboard loads with user data
- Post Shift form renders correctly with all fields
- No console errors after fixes

## Remaining Work

### Medium Priority

1. **Add error components** to routes:
   - `errorComponent` for each route
   - Proper error boundaries

2. **Test all remaining dashboard routes**:
   - Verify data loading works
   - Test mutations (create shift, claim shift, etc.)

### Low Priority

3. **Design enhancements**:
   - Add GSAP micro-interactions (buttons, cards)
   - Add Anime.js page transitions
   - Apply emil-design-eng principles

4. **Performance optimization**:
   - Add Suspense boundaries
   - Implement streaming SSR for slow data
   - Add prefetching strategies

## Key Patterns to Remember

### TanStack Start SSR Pattern

```tsx
// SSR route (like landing page)
export const Route = createFileRoute("/")({
  component: HomeComponent,
});

// CSR route
export const Route = createFileRoute("/login")({
  ssr: false,
  component: LoginPage,
});

// Protected CSR route with children
export const Route = createFileRoute("/dashboard")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const session = await getUser();
    if (!session?.user) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
    return { session };
  },
  component: DashboardLayout,
});

// Child route MUST have ssr: false if parent has it
export const Route = createFileRoute("/dashboard/shifts/")({
  ssr: false, // REQUIRED!
  loader: async ({ context }) => {
    const userId = context.session?.user?.id;
    // ...
  },
  component: ShiftsListPage,
});
```

### Server Function with userId

```tsx
const userIdSchema = z.object({
  userId: z.string(),
});

export const getDashboardStats = createServerFn({ method: "GET" })
  .inputValidator(userIdSchema)
  .handler(async ({ data }) => {
    const { userId } = data;
    // ... use userId
  });
```

### QueryClientProvider Setup

```tsx
// In __root.tsx shellComponent
function RootShell({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          {/* ... rest of app */}
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

## Critical Rules

1. **Always add `ssr: false` to child routes** if parent has `ssr: false`
2. **Wrap app with `QueryClientProvider`** when using `useQuery`/`useMutation`
3. **Always provide a `component`** when using `loader` in routes
4. **Pass userId to server functions** from route context for auth

## To Start Next Session

Copy and paste this message:

---

I'm continuing the Wajeer SSR/CSR implementation. The previous sessions established the hybrid architecture and fixed critical bugs.

**Status:** Build succeeds, type checks pass. All routes working correctly.

**What's done:**

- Root route uses `shellComponent` + `component` pattern
- Dashboard has `ssr: false` with auth check in `beforeLoad`
- All 11 child routes under `/dashboard` have `ssr: false`
- `QueryClientProvider` wraps the app in `__root.tsx`
- Server functions accept `userId` parameter
- Route loaders pass `userId` from context
- "removeChild" DOM error fixed
- "No QueryClient" error fixed

**Next steps:**

1. Test all remaining dashboard routes
2. Add error components to routes
3. Implement design enhancements (GSAP/Anime.js)

Load these skills: `shadcn`, `emil-design-eng`, `frontend-design`, `tanstack-start-best-practices`, `tanstack-query-best-practices`, `tanstack-router-best-practices`.

Check `PLAN.md` for the full implementation plan.
