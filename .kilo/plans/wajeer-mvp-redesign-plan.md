# Wajeer MVP Redesign Plan

## Objective

Complete redesign of the Wajeer shift-swapping marketplace — design system, all routes, all components, animations, and full MVP functionality. Fix all architecture issues, unify patterns, and deliver a production-ready application.

## Product Context

**What**: Marketplace where hourly workers pick up extra shifts and businesses fill last-minute staffing gaps
**Who**: Restaurant/retail managers (posting shifts) and hourly workers (claiming shifts)
**Revenue**: $49-$199/month per location + transaction fees
**Target**: Multi-location businesses with 50+ hourly employees
**Tech**: TanStack Start, React, TypeScript, Better Auth, SurrealDB, shadcn/ui, Tailwind v4, Zustand, TanStack Query

---

## Phase 1: Design System (DESIGN.md)

### Aesthetic Direction

**Direction**: Industrial/Utilitarian meets Playful — function-first for data-dense shift management, but with warm, approachable personality for workers
**Rationale**: Shift management is serious business (scheduling, payroll, reliability) but the workers using it want something that feels empowering, not corporate

### Typography

- **Display/Hero**: `Satoshi` — geometric but warm, distinctive without being quirky
- **Body**: `Instrument Sans` — excellent readability at small sizes, great for data tables
- **Data/Tables**: `DM Sans` with `tabular-nums` (keeping current, works well for numbers)
- **Code**: `JetBrains Mono` (for any dev-facing content)
- **Loading**: Self-hosted via Bunny Fonts (privacy-focused, current approach)

### Color System

**Approach**: Balanced — primary green for trust/action, warm amber for urgency/shifts, full semantic system

**Proposed Palette**:

- **Primary**: `oklch(0.55 0.18 145)` → shift to `oklch(0.52 0.16 150)` (slightly more teal, feels more professional)
- **Accent**: `oklch(0.65 0.18 45)` → warm amber (shifts, urgency, time-sensitive actions)
- **Neutrals**: Cool grays with slight blue undertone (`oklch(0.96 0.005 260)` to `oklch(0.15 0.02 260)`)
- **Semantic**:
  - Success: `oklch(0.55 0.18 145)` (green — approved shifts)
  - Warning: `oklch(0.7 0.15 45)` (amber — pending claims, upcoming shifts)
  - Error: `oklch(0.55 0.22 25)` (red — cancelled, rejected)
  - Info: `oklch(0.6 0.18 240)` (blue — available shifts, notifications)

**Dark Mode**: Redesign surfaces with reduced saturation (10-15%), maintain contrast ratios

### Spacing

- **Base unit**: 4px
- **Density**: Comfortable (data-dense but not cramped)
- **Scale**: 2xs(2) xs(4) sm(8) md(16) lg(24) xl(32) 2xl(48) 3xl(64) 4xl(80)

### Layout

- **Approach**: Hybrid — grid-disciplined for dashboard data, creative-editorial for landing page
- **Grid**: 12-col desktop, 4-col tablet, 1-col mobile
- **Max content width**: 1280px for dashboard, 1440px for landing
- **Border radius**: Hierarchical — sm(4px) inputs, md(8px) cards, lg(12px) sheets, xl(16px) dialogs, full(9999px) pills/badges

### Motion

- **Approach**: Intentional — meaningful transitions, playful on landing
- **Easing**: Custom curves (current ones are good per emil-design-eng)
  - Enter: `cubic-bezier(0.23, 1, 0.32, 1)` (ease-out)
  - Exit: `cubic-bezier(0.23, 1, 0.32, 1)` (ease-out, faster)
  - Move: `cubic-bezier(0.77, 0, 0.175, 1)` (ease-in-out)
- **Duration**: Micro(50-100ms) press feedback, Short(150-250ms) UI transitions, Medium(250-400ms) page transitions

### Animation Strategy

- **GSAP (80%)**: Micro-interactions, loading states, card animations, button feedback, stagger animations on lists, scroll-triggered reveals on landing
- **Anime.js (20%)**: Page transitions, route change animations, complex SVG animations on landing
- **CSS Transitions**: Hover states, simple transforms, color changes (interruptible)
- **Follow emil-design-eng rules**: No animation on keyboard actions, under 300ms for UI, custom easing, scale(0.97) press feedback, no scale(0) entries

---

## Phase 2: Architecture Fixes

### 2.1 Unify Data Fetching Pattern

**Problem**: Three competing patterns (server functions, REST API, direct SurrealDB hooks)
**Solution**: Standardize on **TanStack Router loaders + React Query with queryOptions** pattern

```
Route Loader (ensureQueryData) → React Query (useSuspenseQuery) → Server Function → DB
```

- Remove REST API endpoints for data fetching (`/api/shifts/`, `/api/shifts/$id/claims`)
- Remove direct SurrealDB client hooks (`use-surreal-query.ts`, `use-live-shifts.ts`)
- All data flows through server functions with proper auth middleware

### 2.2 Remove Demo Code

**Delete**:

- `apps/web/src/stores/shift-store.ts` (demo state)
- `apps/web/src/lib/types.ts` (DEMO_SHIFT and demo types)
- `apps/web/src/hooks/use-live-shifts.ts` (SSE demo hooks)
- `apps/web/src/api/shift-state.ts` (demo state management)
- All `/api/shifts/post`, `/api/shifts/claim`, `/api/shifts/approve`, `/api/shifts/reset`, `/api/shifts/stream` routes

### 2.3 Fix Type Safety

- Replace all `Record<string, unknown>` with proper TypeScript interfaces
- Remove all `as Type[]` assertions — use proper typing from server functions
- Create shared types in `apps/web/src/lib/types.ts` (clean, no demo code)
- Export types from `@wajeer/db` for database entities

### 2.4 Add Error Boundaries

- Create `apps/web/src/routes/__root.error.tsx` — global error boundary
- Add `errorComponent` to every route
- Create reusable error components: `NotFoundError`, `AuthError`, `ServerError`
- Use `useQueryErrorResetBoundary` for React Query errors

### 2.5 Code Splitting

- Add `.lazy.tsx` files for all dashboard routes with heavy components
- Keep route config in main files, lazy-load component rendering
- Enable `autoCodeSplitting` in router config

### 2.6 Deduplicate Query Keys

- Merge `query-keys.ts` and `query-options.ts` into single `apps/web/src/lib/query-options.ts`
- Use hierarchical key factory pattern: `shifts.list()`, `shifts.detail(id)`, `shifts.available(filters)`

### 2.7 Add Zod Validation

- Create Zod schemas for all form inputs in `apps/web/src/lib/schemas.ts`
- Validate all server function inputs with `zod` middleware
- Client-side form validation with TanStack Form + Zod

---

## Phase 3: shadcn Components

### Add Missing Components

```bash
bunx --bun shadcn@latest add progress -c packages/ui
bunx --bun shadcn@latest add command -c packages/ui
bunx --bun shadcn@latest add alert-dialog -c packages/ui
bunx --bun shadcn@latest add form -c packages/ui
bunx --bun shadcn@latest add radio-group -c packages/ui
bunx --bun shadcn@latest add aspect-ratio -c packages/ui
bunx --bun shadcn@latest add hover-card -c packages/ui
bunx --bun shadcn@latest add scroll-area -c packages/ui
bunx --bun shadcn@latest add resizable -c packages/ui
bunx --bun shadcn@latest add pagination -c packages/ui
bunx --bun shadcn@latest add dropdown-menu -c packages/ui
```

### Custom Components to Build

**In `packages/ui/src/components/`**:

- `shift-card.tsx` — Shift card with status badge, time, location, role, rate
- `claim-badge.tsx` — Worker claim badge with trust score
- `trust-meter.tsx` — Circular trust score indicator
- `schedule-grid.tsx` — Weekly/monthly calendar grid for shifts
- `stat-card.tsx` — Dashboard stat card with trend indicator
- `empty-state.tsx` — Reusable empty state with illustration and CTA
- `search-filter-bar.tsx` — Combined search input + filter dropdowns
- `notification-item.tsx` — Notification row with mark-as-read
- `business-card.tsx` — Business card with location count and staff count
- `location-card.tsx` — Location card with address and shift count

**In `apps/web/src/components/`**:

- `landing-hero.tsx` — Animated landing page hero section
- `landing-features.tsx` — Feature grid with GSAP scroll animations
- `landing-cta.tsx` — Call-to-action section
- `landing-footer.tsx` — Footer with links
- `dashboard-layout.tsx` — Unified dashboard layout wrapper
- `shift-form.tsx` — Post shift form with Zod validation
- `claim-flow.tsx` — Claim shift flow with animations
- `approve-claim-flow.tsx` — Approve/reject claim flow
- `business-form.tsx` — Create business form
- `location-form.tsx` — Add location form
- `profile-form.tsx` — Edit profile form with avatar upload
- `notification-center.tsx` — Notifications dropdown and page

---

## Phase 4: Route Redesigns

### 4.1 Landing Page (`/`)

**Current**: Basic centered text with two buttons
**Redesign**: Full marketing page with:

- Animated hero section (GSAP stagger reveal)
- Value proposition with 3 feature cards (one-tap claiming, instant approval, trust scores)
- How it works section (3-step process with Anime.js transitions)
- Testimonials/social proof section
- CTA section with gradient background
- Footer with links
- SSR enabled with proper SEO meta tags
- Server-side session check (redirect to dashboard if logged in)

**Animations**:

- Hero text: GSAP stagger reveal (letters or words)
- Feature cards: Scroll-triggered fade-in with GSAP ScrollTrigger
- How it works: Anime.js step-by-step reveal on scroll
- CTA button: Subtle pulse animation
- Page load: Anime.js fade-in sequence

### 4.2 Auth Pages (`/login`, `/signup`)

**Current**: Basic forms with toggle
**Redesign**:

- Split layout: Left side branding/illustration, right side form
- TanStack Form + Zod validation
- Better Auth integration with proper error handling
- Password strength indicator
- Social auth placeholders (for future)
- "use client" directive
- Remember me checkbox
- Forgot password link

**Animations**:

- Form validation errors: Shake animation (GSAP)
- Submit button: Loading spinner transition
- Page transition: Fade-in (Anime.js)

### 4.3 Dashboard Layout (`/dashboard`)

**Current**: Basic sidebar + header
**Redesign**:

- Collapsible sidebar with icons + labels
- User menu with trust score display
- Breadcrumb navigation
- Mobile-responsive: Drawer sidebar on mobile
- Quick actions dropdown in header
- Notification bell with badge count

**Components**:

- `AppSidebar` — Redesigned with better nav structure
- `DashboardHeader` — With search, notifications, user menu
- `MobileNav` — Drawer navigation for mobile

### 4.4 Dashboard Home (`/dashboard/`)

**Current**: Basic stats cards and lists
**Redesign**:

- Welcome header with date and quick stats
- Stat cards row (shifts posted, pending claims, available shifts, trust score)
- Recent activity feed (timeline style)
- Upcoming shifts (next 7 days)
- Quick actions: Post shift, browse available, view schedule
- Empty states with CTAs when no data

**Data Pattern**: Route loader + useSuspenseQuery
**Animations**: GSAP stagger reveal for stat cards

### 4.5 Available Shifts (`/dashboard/available`)

**Current**: Basic shift list
**Redesign**:

- Search + filter bar (by role, date, location, distance)
- Shift cards grid/list view toggle
- Each card: Role, time, location, rate, distance, quick claim button
- Claim button with confirmation dialog
- Empty state with "no shifts available" message
- Pagination or infinite scroll

**Data Pattern**: Route loader with filters + useSuspenseQuery
**Animations**: Card hover lift (CSS), claim button press feedback

### 4.6 My Schedule (`/dashboard/schedule`)

**Current**: Not implemented properly
**Redesign**:

- Calendar view (month/week toggle)
- Shifts displayed as calendar events
- Color-coded by status (approved, completed, cancelled)
- Click event for details
- Sync to calendar export (ICS)
- List view alternative for mobile

**Components**: `ScheduleGrid` (custom), using existing `Calendar` for date picking

### 4.7 My Shifts (`/dashboard/shifts/`)

**Current**: Basic shift list
**Redesign**:

- Shift list with status filter tabs (Open, Claimed, Approved, Completed, Cancelled)
- Each row: Title, date, time, location, status badge, claims count, actions
- Click to view details
- Empty state with "post your first shift" CTA
- Search by title or location

**Data Pattern**: Route loader + useSuspenseQuery
**Animations**: Tab transitions (CSS), row hover effects

### 4.8 Shift Detail (`/dashboard/shifts/$id`)

**Current**: Basic shift info + claims list
**Redesign**:

- Shift details card (full info: role, time, location, rate, notes)
- Claims section with worker cards
- Each claim: Worker name, avatar, trust score, reliability, claim time
- Approve/Reject buttons with confirmation dialogs
- Status timeline (Posted → Claimed → Approved/Rejected)
- Actions: Edit shift, Cancel shift, Duplicate shift

**Animations**: Approve/reject: GSAP scale + color transition, Status timeline: stagger reveal

### 4.9 Post Shift (`/dashboard/shifts/new`)

**Current**: Basic form with raw FormData, no validation
**Redesign**:

- TanStack Form + Zod validation
- Step-by-step wizard (optional) or single form with sections
- Business → Location → Shift details → Review → Submit
- Real-time validation feedback
- Auto-fill from previous shifts
- Template saving (save as template for recurring shifts)

**Schema**:

```typescript
const postShiftSchema = z
  .object({
    location_id: z.string().min(1, "Location is required"),
    title: z.string().min(1, "Title is required").max(100),
    role: z.enum([
      "server",
      "cook",
      "host",
      "bartender",
      "dishwasher",
      "other",
    ]),
    date: z
      .string()
      .refine(
        (d) => new Date(d) >= new Date(new Date().toDateString()),
        "Date must be today or later"
      ),
    start_time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
    end_time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
    hourly_rate: z.number().min(0).optional(),
    notes: z.string().max(500).optional(),
  })
  .refine(
    (data) => {
      // End time must be after start time
      return data.end_time > data.start_time;
    },
    { message: "End time must be after start time", path: ["end_time"] }
  );
```

### 4.10 Businesses (`/dashboard/businesses/`)

**Current**: Basic business list
**Redesign**:

- Business cards grid
- Each card: Name, owner, location count, staff count, quick actions
- Create business button
- Empty state with "create your first business" CTA
- Search by name

### 4.11 Business Detail (`/dashboard/businesses/$id`)

**Current**: Tabs with placeholder content
**Redesign**:

- Business header with name and actions
- Tabs: Overview, Locations, Staff, Settings
- **Overview**: Stats (total shifts, fill rate, avg trust score), recent activity
- **Locations**: List of locations with add location button, each location shows address and shift count
- **Staff**: Team members with roles, trust scores, invite member button
- **Settings**: Edit business name, manage locations, manage staff, delete business

### 4.12 Profile (`/dashboard/profile`)

**Current**: Basic profile display
**Redesign**:

- Avatar upload (with crop)
- Edit name, email
- Trust score breakdown per business
- Reliability score
- Connected businesses list
- Notification preferences
- Account settings (change password, delete account)
- Danger zone (delete account)

### 4.13 Notifications (`/dashboard/notifications`)

**Current**: Basic notification list
**Redesign**:

- Notification list with type icons (shift claimed, shift approved, new shift available)
- Mark as read/unread
- Mark all as read
- Filter by type
- Empty state
- Real-time updates via React Query refetch interval

---

## Phase 5: Implementation Order

### Step 1: Design System & Foundation

1. Write `DESIGN.md` with all design tokens
2. Update `packages/ui/src/styles/globals.css` with new design tokens
3. Update font imports (add Satoshi, Instrument Sans)
4. Add missing shadcn components
5. Build custom UI components in `packages/ui/`

### Step 2: Architecture Cleanup

1. Remove demo code (shift-store, SSE routes, demo types)
2. Unify data fetching (remove REST API endpoints, remove direct SurrealDB hooks)
3. Create proper TypeScript types
4. Create Zod schemas
5. Deduplicate query keys
6. Add error boundaries

### Step 3: Landing Page & Auth

1. Redesign landing page with animations
2. Redesign login/signup pages
3. Add proper SEO meta tags
4. Server-side session check on landing

### Step 4: Dashboard Core

1. Redesign dashboard layout (sidebar, header)
2. Redesign dashboard home
3. Add error boundaries to all routes
4. Add lazy loading to heavy routes

### Step 5: Shift Management

1. Redesign available shifts page
2. Redesign my shifts page
3. Redesign shift detail page
4. Redesign post shift form with Zod validation
5. Redesign schedule page

### Step 6: Business Management

1. Redesign businesses list
2. Redesign business detail with all tabs
3. Implement location management
4. Implement staff management

### Step 7: Profile & Notifications

1. Redesign profile page
2. Redesign notifications page
3. Implement avatar upload

### Step 8: Polish & Performance

1. Add GSAP animations throughout
2. Add Anime.js page transitions
3. Add CSS micro-interactions (press feedback, hover states)
4. Optimize bundle size
5. Test all flows
6. Fix any remaining issues

---

## File Changes Summary

### New Files (~40 files)

- `DESIGN.md` — Complete design system
- `apps/web/src/lib/schemas.ts` — Zod validation schemas
- `apps/web/src/lib/types.ts` — Clean TypeScript types (replaces current)
- `apps/web/src/components/landing-hero.tsx`
- `apps/web/src/components/landing-features.tsx`
- `apps/web/src/components/landing-cta.tsx`
- `apps/web/src/components/landing-footer.tsx`
- `apps/web/src/components/dashboard-layout.tsx`
- `apps/web/src/components/shift-form.tsx`
- `apps/web/src/components/claim-flow.tsx`
- `apps/web/src/components/approve-claim-flow.tsx`
- `apps/web/src/components/business-form.tsx`
- `apps/web/src/components/location-form.tsx`
- `apps/web/src/components/profile-form.tsx`
- `apps/web/src/components/notification-center.tsx`
- `apps/web/src/components/error-boundaries.tsx`
- `packages/ui/src/components/shift-card.tsx`
- `packages/ui/src/components/claim-badge.tsx`
- `packages/ui/src/components/trust-meter.tsx`
- `packages/ui/src/components/schedule-grid.tsx`
- `packages/ui/src/components/stat-card.tsx`
- `packages/ui/src/components/empty-state.tsx`
- `packages/ui/src/components/search-filter-bar.tsx`
- `packages/ui/src/components/notification-item.tsx`
- `packages/ui/src/components/business-card.tsx`
- `packages/ui/src/components/location-card.tsx`
- `apps/web/src/routes/__root.error.tsx` — Global error boundary
- Route `.lazy.tsx` files for code splitting

### Modified Files (~20 files)

- `packages/ui/src/styles/globals.css` — Updated design tokens
- `apps/web/src/routes/index.tsx` — Complete landing page redesign
- `apps/web/src/routes/login.tsx` — Auth page redesign
- `apps/web/src/routes/signup.tsx` — Auth page redesign
- `apps/web/src/routes/dashboard.tsx` — Layout improvements
- `apps/web/src/routes/dashboard/index.tsx` — Dashboard home redesign
- `apps/web/src/routes/dashboard/available.tsx` — Available shifts redesign
- `apps/web/src/routes/dashboard/schedule.tsx` — Schedule page redesign
- `apps/web/src/routes/dashboard/shifts/index.tsx` — My shifts redesign
- `apps/web/src/routes/dashboard/shifts/$id.tsx` — Shift detail redesign
- `apps/web/src/routes/dashboard/shifts/new.tsx` — Post shift form with Zod
- `apps/web/src/routes/dashboard/businesses/index.tsx` — Businesses list redesign
- `apps/web/src/routes/dashboard/businesses/$id.tsx` — Business detail redesign
- `apps/web/src/routes/dashboard/profile.tsx` — Profile redesign
- `apps/web/src/routes/dashboard/notifications.tsx` — Notifications redesign
- `apps/web/src/components/app-sidebar.tsx` — Sidebar improvements
- `apps/web/src/components/header.tsx` — Header improvements
- `apps/web/src/lib/query-options.ts` — Unified query options
- `apps/web/src/functions/*.ts` — Updated server functions with Zod validation

### Deleted Files (~10 files)

- `apps/web/src/stores/shift-store.ts`
- `apps/web/src/hooks/use-live-shifts.ts`
- `apps/web/src/hooks/use-surreal-query.ts`
- `apps/web/src/api/shift-state.ts` (if exists)
- `apps/web/src/routes/api/shifts/post.ts`
- `apps/web/src/routes/api/shifts/claim.ts`
- `apps/web/src/routes/api/shifts/approve.ts`
- `apps/web/src/routes/api/shifts/reset.ts`
- `apps/web/src/routes/api/shifts/stream.ts`
- `apps/web/src/lib/types.ts` (replaced)

---

## Success Criteria

1. **Design**: Complete DESIGN.md with all tokens, all pages follow the design system
2. **Functionality**: All MVP features work end-to-end (post shifts, claim, approve, manage businesses, profile)
3. **Architecture**: Single data fetching pattern, no demo code, proper types, Zod validation everywhere
4. **Performance**: Lazy loading on all heavy routes, optimized bundle, no hydration mismatches
5. **Animations**: GSAP micro-interactions, Anime.js page transitions, CSS hover/press states
6. **Error Handling**: Error boundaries on all routes, user-friendly error messages
7. **Code Quality**: Passes `bun run check` and `bun run check-types` with zero errors
8. **Responsive**: Works on mobile, tablet, desktop

---

## Risks & Mitigations

| Risk                                                   | Mitigation                                                                     |
| ------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Design token conflicts with existing shadcn components | Test each component after token updates, adjust as needed                      |
| GSAP/Anime.js bundle size                              | Use tree-shaking, only import needed modules                                   |
| SurrealDB adapter limitations                          | Test all queries before implementing, fall back to raw SQL if needed           |
| Scope creep                                            | Stick to MVP features, defer nice-to-haves                                     |
| Animation performance on mobile                        | Test on real devices, use `prefers-reduced-motion`, CSS over JS where possible |

---

## NOT in Scope

1. OAuth/social login (email/password only for MVP)
2. Email verification (disabled for MVP)
3. Payment integration (billing handled separately)
4. Push notifications (in-app only)
5. Mobile app (responsive web only)
6. Multi-language support (English only)
7. Advanced reporting/analytics
8. Shift templates (basic post shift only)
9. Recurring shifts
10. Export to calendar (manual only)

---

## Estimated Effort

| Phase                   | Human Team   | CC+gstack    | Completeness |
| ----------------------- | ------------ | ------------ | ------------ |
| Design System           | 1 day        | 30 min       | 10/10        |
| Architecture Cleanup    | 2 days       | 1 hour       | 10/10        |
| Landing + Auth          | 2 days       | 1 hour       | 10/10        |
| Dashboard Core          | 2 days       | 1 hour       | 10/10        |
| Shift Management        | 3 days       | 2 hours      | 10/10        |
| Business Management     | 2 days       | 1.5 hours    | 10/10        |
| Profile + Notifications | 1 day        | 30 min       | 10/10        |
| Polish + Performance    | 2 days       | 1 hour       | 10/10        |
| **Total**               | **~15 days** | **~8 hours** | **10/10**    |
