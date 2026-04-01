# Wajeer Full MVP — Design & Implementation Plan

**Branch:** main  
**Created:** 2026-03-31  
**Status:** Draft — Awaiting Design Review

---

## Executive Summary

Wajeer is a shift marketplace platform connecting hourly workers with businesses needing last-minute staffing coverage. Workers claim available shifts with one tap; businesses approve instantly. The platform creates a win-win: workers gain schedule flexibility and extra income, businesses reduce no-show costs and overtime burden.

**MVP Scope:** Complete core loop — business creation, shift posting, worker claiming, manager approval, notifications, trust scores. Target vertical: restaurants and retail chains with 50+ hourly employees.

**Aesthetic:** Clean premium — neutral palette (zinc/slate), generous whitespace, sophisticated typography, subtle micro-interactions. Desktop-first for managers (office workflow), mobile-responsive for workers (on-the-go shift checking).

**Estimated Effort:** Human team 2-3 weeks → CC+gstack 4-6 hours (compression ~30x per AGENTS.md benchmarks).

---

## Architecture Overview

### Tech Stack (Existing)

| Layer         | Technology                    | Status                   |
| ------------- | ----------------------------- | ------------------------ |
| Frontend      | TanStack Start (Vite + React) | ✓ Configured             |
| Routing       | TanStack Router (file-based)  | ✓ Configured             |
| Data Fetching | TanStack Query                | ✓ Configured             |
| Auth          | Better Auth (@wajeer/auth)    | ✓ Basic setup            |
| Database      | SurrealDB + Kysely            | ✓ Schema defined         |
| Styling       | Tailwind CSS v4               | ✓ Configured             |
| Components    | shadcn/ui (base-ui variant)   | ✓ Partial                |
| Animations    | GSAP (80%) + Anime.js (20%)   | ✓ Available              |
| State         | Zustand (client)              | ✓ Configured             |
| Forms         | TanStack Form + Zod           | ✓ Available              |
| Search        | Typesense                     | Available (not used yet) |

### Package Structure

```
wajeer/
├── apps/web/           # TanStack Start frontend
│   ├── src/routes/     # File-based routing
│   ├── src/components/ # UI components
│   ├── src/services/   # Server functions
│   ├── src/stores/     # Zustand stores
│   └── src/hooks/      # Custom hooks
├── packages/
│   ├── auth/           # Better Auth server config
│   ├── db/             # SurrealDB + Kysely schema
│   ├── env/            # Environment validation
│   └── ui/             # shadcn/ui components
```

### Data Flow

```
[Browser] → TanStack Router (loader) → Server Function (createServerFn)
    → Kysely Query → SurrealDB → Response
    → TanStack Query (cache) → Component Render

[Real-time] → SSE /api/shifts/stream → Zustand Store → Component Update
```

---

## Database Schema Review (Existing)

The schema in `packages/db/src/schema.ts` is well-designed for MVP:

| Table                                | Purpose                                                           | MVP Usage |
| ------------------------------------ | ----------------------------------------------------------------- | --------- |
| `user`                               | Worker/Manager accounts                                           | ✓ Core    |
| `business`                           | Company entity                                                    | ✓ Core    |
| `location`                           | Business locations                                                | ✓ Core    |
| `user_business`                      | User↔Business membership (role, trust_score)                      | ✓ Core    |
| `shift`                              | Posted shifts (status: open/claimed/approved/cancelled/completed) | ✓ Core    |
| `claim`                              | Worker claims on shifts                                           | ✓ Core    |
| `notification`                       | User notifications                                                | ✓ Core    |
| `session`, `account`, `verification` | Better Auth tables                                                | ✓ Auth    |

**Schema Gaps:** None critical. Trust score fields exist but calculation logic needed.

---

## Route Structure (Proposed)

### Public Routes (SSR for SEO + fast FCP)

| Route     | Purpose                              | Render Mode |
| --------- | ------------------------------------ | ----------- |
| `/`       | Landing page (value prop, CTA)       | SSR + ISR   |
| `/login`  | Sign-in form                         | SSR         |
| `/signup` | Sign-up form (worker/manager choice) | SSR         |
| `/demo`   | War room simulation (existing)       | CSR         |

### Authenticated Routes (CSR after auth check)

| Route                       | Purpose                                    | Role Access   |
| --------------------------- | ------------------------------------------ | ------------- |
| `/dashboard`                | Role-aware dashboard (manager/worker view) | All           |
| `/dashboard/businesses`     | Business management list                   | Owner/Manager |
| `/dashboard/businesses/$id` | Single business detail                     | Owner/Manager |
| `/dashboard/businesses/new` | Create business form                       | Owner         |
| `/dashboard/shifts`         | Shift management (post/view/approve)       | Owner/Manager |
| `/dashboard/shifts/$id`     | Single shift detail + claims               | Owner/Manager |
| `/dashboard/shifts/new`     | Post new shift form                        | Owner/Manager |
| `/dashboard/schedule`       | Worker's upcoming shifts                   | Worker        |
| `/dashboard/available`      | Available shifts to claim                  | Worker        |
| `/dashboard/claims`         | Worker's claim history                     | Worker        |
| `/dashboard/notifications`  | Notification inbox                         | All           |
| `/dashboard/profile`        | User profile + trust score                 | All           |

### API Routes (Server Functions)

| Route                    | Method           | Purpose                              |
| ------------------------ | ---------------- | ------------------------------------ |
| `/api/auth/$`            | ALL              | Better Auth handlers (existing)      |
| `/api/businesses`        | GET, POST        | List/create businesses               |
| `/api/businesses/$id`    | GET, PUT, DELETE | Business CRUD                        |
| `/api/shifts`            | GET, POST        | List/post shifts                     |
| `/api/shifts/$id`        | GET, PUT         | Shift detail/update status           |
| `/api/claims`            | GET, POST        | List/create claims                   |
| `/api/claims/$id`        | PUT              | Update claim status (approve/reject) |
| `/api/notifications`     | GET              | List notifications                   |
| `/api/notifications/$id` | PUT              | Mark as read                         |
| `/api/shifts/stream`     | SSE              | Real-time shift events (existing)    |

---

## Screen Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PUBLIC FLOW                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│    ┌──────────┐     Get Started      ┌───────────┐                          │
│    │ Landing  │ ───────────────────► │  Signup   │                          │
│    │   (/)    │                      │(/signup)  │                          │
│    └──────────┘                      └─────┬─────┘                          │
│         │                                  │                                 │
│         │ See how it works                 │ Create account                 │
│         ▼                                  ▼                                 │
│    ┌──────────┐                      ┌───────────┐                          │
│    │   Demo   │                      │ Dashboard │                          │
│    │ (/demo)  │                      │(/dashboard)│                         │
│    └──────────┘                      └───────────┘                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          MANAGER/OWNER FLOW                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│    ┌───────────┐                                                            │
│    │ Dashboard │──────┬─────────────┬──────────────┬──────────────┐         │
│    │(/dashboard)│     │             │              │              │         │
│    └───────────┘      │             │              │              │         │
│         │             │             │              │              │         │
│    [Stats: Open      │             │              │              │         │
│     Shifts, Pending  │             │              │              │         │
│     Claims, Workers] │             │              │              │         │
│                       ▼             ▼              ▼              ▼         │
│              ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐    │
│              │Businesses │  │  Shifts   │  │  Claims   │  │  Profile  │    │
│              │(/business)│  │ (/shifts) │  │(via shift)│  │(/profile) │    │
│              └─────┬─────┘  └─────┬─────┘  └───────────┘  └───────────┘    │
│                    │              │                                         │
│          ┌────────┼────────┐     │                                         │
│          ▼        ▼        ▼     ▼                                         │
│     ┌────────┐ ┌────────┐ ┌───────────┐                                    │
│     │ Detail │ │  New   │ │  Detail   │                                    │
│     │(/$id)  │ │ (/new) │ │ (/$id)    │                                    │
│     └────────┘ └────────┘ └─────┬─────┘                                    │
│                                   │                                          │
│                                   ▼                                          │
│                            ┌───────────┐                                     │
│                            │Claim Queue│                                     │
│                            │Approve/   │                                     │
│                            │Reject     │                                     │
│                            └───────────┘                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            WORKER FLOW                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│    ┌───────────┐                                                            │
│    │ Dashboard │──────┬─────────────┬──────────────┬──────────────┐         │
│    │(/dashboard)│     │             │              │              │         │
│    └───────────┘      │             │              │              │         │
│         │             │             │              │              │         │
│    [Stats: Available  │             │              │              │         │
│     Shifts, Upcoming, │             │              │              │         │
│     Trust Score]      │             │              │              │         │
│                       ▼             ▼              ▼              ▼         │
│              ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐    │
│              │ Available │  │  Schedule │  │  Claims   │  │  Profile  │    │
│              │(/available)│ │(/schedule)│  │(/claims)  │  │(/profile) │    │
│              └─────┬─────┘  └───────────┘  └───────────┘  └───────────┘    │
│                    │                                                         │
│                    ▼                                                         │
│              ┌───────────┐                                                   │
│              │   Claim   │                                                   │
│              │  (one-tap)│                                                   │
│              └───────────┘                                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Navigation Structure

**Header (persistent, role-aware):**

- Logo → `/`
- Manager/Owner: Businesses, Shifts, Notifications, Profile
- Worker: Available Shifts, Schedule, Notifications, Profile
- User Menu (avatar + dropdown): Profile, Sign out

**Mobile Navigation:**

- Hamburger menu → Sheet drawer with nav links
- Bottom bar optional (future consideration)

---

## Component Hierarchy

### Layout Components

```
__root.tsx (RootLayout)
  ├── Header (persistent nav)
  │   ├── Logo
  │   ├── NavLinks (role-aware)
  │   └── UserMenu (dropdown)
  └── MainContent ( Outlet )

dashboard/__root.tsx (DashboardLayout)
  ├── DashboardHeader
  ├── SidebarNav (optional for desktop)
  └── DashboardContent ( Outlet )
```

### Feature Components

**Business Management:**

- `BusinessCard` — Business summary display
- `BusinessForm` — Create/edit business
- `BusinessList` — Grid of business cards
- `LocationSelector` — Multi-location picker
- `InviteMemberDialog` — Add worker/manager to business

**Shift Management:**

- `ShiftCard` — Shift summary (date, time, role, status)
- `ShiftForm` — Post new shift (role, time, rate, notes)
- `ShiftList` — Filterable shift grid
- `ShiftDetail` — Full shift info + claim list
- `ShiftCalendar` — Calendar view of shifts
- `ShiftStatusBadge` — Status indicator (open/claimed/approved/completed/cancelled)

**Claim Management:**

- `ClaimCard` — Claim summary (worker, status, timestamp)
- `ClaimList` — Pending claims for shift
- `ClaimButton` — One-tap claim action
- `ClaimStatusBadge` — Status indicator (pending/approved/rejected)

**Worker Experience:**

- `AvailableShiftCard` — Shift available for claiming
- `AvailableShiftList` — Filterable available shifts
- `MyScheduleCard` — Upcoming confirmed shift
- `MyScheduleList` — Calendar/list view of schedule
- `TrustScoreDisplay` — Worker's reliability score
- `ClaimHistoryList` — Past claims with outcomes

**Shared:**

- `NotificationBell` — Badge + dropdown
- `NotificationItem` — Single notification
- `EmptyState` — Illustrated empty state with action
- `LoadingSkeleton` — Skeleton loading patterns
- `ErrorState` — Error display with retry
- `TrustScoreBadge` — Visual trust indicator (0-100)

### UI Components (@wajeer/ui — existing + needed)

**Existing:**

- `Button` (cva variants)
- `Card`
- `Input`
- `Label`
- `Checkbox`
- `DropdownMenu`
- `Sonner` (toast)

**Needed:**

- `Dialog` (Modal)
- `Sheet` (Side drawer — mobile nav)
- `Tabs` (Dashboard tabs)
- `Avatar` (User profile images)
- `Badge` (Status indicators)
- `Skeleton` (Loading states)
- `Calendar` (Shift calendar)
- `Select` (Dropdown select)
- `Textarea` (Notes field)
- `Separator` (Dividers)
- `Popover` (Tooltip/popover)
- `Command` (Search/command palette)

---

## Design System — Clean Premium

### Color Palette (Tailwind v4 CSS Variables)

```css
:root {
  /* Base */
  --background: #fafafa; /* zinc-50 — clean light */
  --foreground: #18181b; /* zinc-900 — strong text */

  /* Card/Surface */
  --card: #ffffff;
  --card-foreground: #27272a; /* zinc-800 */

  /* Primary — Slate (sophisticated, not harsh) */
  --primary: #475569; /* slate-600 */
  --primary-foreground: #f8fafc;

  /* Secondary — Muted zinc */
  --secondary: #f4f4f5; /* zinc-100 */
  --secondary-foreground: #18181b;

  /* Accent — Teal (trust, reliability) */
  --accent: #0d9488; /* teal-600 */
  --accent-foreground: #f0fdfa;

  /* Muted */
  --muted: #f4f4f5;
  --muted-foreground: #71717a; /* zinc-500 */

  /* Border */
  --border: #e4e4e7; /* zinc-200 */

  /* Status Colors */
  --success: #10b981; /* emerald-500 */
  --warning: #f59e0b; /* amber-500 */
  --error: #ef4444; /* red-500 */

  /* Trust Score Gradient */
  --trust-low: #fca5a5; /* red-300 */
  --trust-medium: #fcd34d; /* amber-300 */
  --trust-high: #6ee7b7; /* emerald-300 */
}
```

### Typography (Tailwind v4)

| Element          | Font                     | Size            | Weight | Letter Spacing |
| ---------------- | ------------------------ | --------------- | ------ | -------------- |
| H1 (Page)        | system-ui, -apple-system | 2.25rem (36px)  | 700    | -0.025em       |
| H2 (Section)     | inherit                  | 1.5rem (24px)   | 600    | -0.025em       |
| H3 (Card title)  | inherit                  | 1.125rem (18px) | 600    | normal         |
| Body             | inherit                  | 0.875rem (14px) | 400    | normal         |
| Small/Muted      | inherit                  | 0.75rem (12px)  | 400    | normal         |
| Mono (times/ids) | ui-monospace, SF Mono    | 0.75rem         | 400    | normal         |

**No custom web fonts** — system fonts for instant load, clean premium comes from spacing and hierarchy, not typeface novelty.

### Spacing Scale (Tailwind default)

- Card padding: `p-6` (24px)
- Section gap: `gap-6` (24px)
- Item gap: `gap-4` (16px)
- Tight gap: `gap-2` (8px)
- Form field gap: `space-y-4` (16px vertical)

### Border Radius (Tailwind default)

- Card: `rounded-xl` (12px) — **UPDATE NEEDED: existing components use `rounded-none`**
- Button: `rounded-lg` (8px) — **UPDATE NEEDED: existing components use `rounded-none`**
- Input: `rounded-md` (6px) — **UPDATE NEEDED: existing components use `rounded-none`**
- Badge: `rounded-full` (9999px)

**Design Decision (2026-03-31):** User confirmed to update existing @wajeer/ui components from `rounded-none` to rounded variants for "clean premium" aesthetic. Implementation: update `button.tsx`, `card.tsx`, `input.tsx` to use rounded corners.

### Animation Guidelines (from emil-design-eng skill)

| Element         | Duration  | Easing      | Pattern                        |
| --------------- | --------- | ----------- | ------------------------------ |
| Button press    | 100-160ms | ease-out    | scale(0.97) on :active         |
| Card hover      | 150ms     | ease-out    | subtle lift + shadow           |
| Modal/dialog    | 200-250ms | ease-out    | scale(0.95) + opacity entrance |
| Dropdown        | 150-200ms | ease-out    | translateY + opacity           |
| Toast           | 125-200ms | ease-out    | slide + opacity                |
| Page transition | 200-400ms | ease-in-out | Anime.js for route changes     |
| Skeleton pulse  | 1.5s      | ease-in-out | shimmer effect                 |

**Never animate:**

- Keyboard shortcuts
- Actions seen 100+ times/day
- Status changes that should feel instant

**Always animate:**

- Modal/dialog open/close
- First-time experiences
- Toast notifications
- State transitions that explain change

### Responsive Breakpoints

| Breakpoint  | Target        | Layout Changes                                 |
| ----------- | ------------- | ---------------------------------------------- |
| sm (640px)  | Large phones  | Stack cards, full-width buttons                |
| md (768px)  | Tablets       | 2-column grids, sidebar collapses to hamburger |
| lg (1024px) | Small laptops | 3-column grids, sidebar visible                |
| xl (1280px) | Desktops      | Full dashboard layout, fixed sidebar           |

### Responsive Behavior — Screen by Screen

| Screen           | Desktop (lg+)                     | Tablet (md)                   | Mobile (sm)                   |
| ---------------- | --------------------------------- | ----------------------------- | ----------------------------- |
| Landing          | Hero left, demo right             | Hero stacked, demo below      | Hero only, demo via link      |
| Dashboard        | 2-col grid, sidebar fixed         | 2-col grid, hamburger menu    | 1-col stack, hamburger        |
| Business list    | 3-col card grid                   | 2-col card grid               | 1-col card list               |
| Shift list       | 3-col card grid + filters sidebar | 2-col grid + filters dropdown | 1-col list + filters in sheet |
| Shift detail     | Info left, claims right           | Info top, claims below        | Stacked, claims collapsible   |
| Available shifts | 2-col card grid                   | 1-col card list               | 1-col card list               |
| Schedule         | Week calendar                     | Week calendar                 | List view only (no calendar)  |

### Accessibility Requirements

**Keyboard Navigation:**

- Tab order: Logo → Nav links → Main content → User menu
- All interactive elements: focusable via Tab
- Modal: Focus trap, Escape to close
- Dropdown: Arrow keys to navigate, Enter to select
- Claim button: Enter or Space to claim

**Screen Readers:**

- Landmarks: `<nav>`, `<main>`, `<aside>`, `<footer>`
- Headings: H1 (page title), H2 (sections), H3 (cards)
- Labels: All inputs have `<label>` or `aria-label`
- Status: Live regions for toast notifications (`aria-live="polite"`)
- Trust score: `aria-label="Trust score: 85 out of 100"`

**Color Contrast:**

- Text on background: 4.5:1 minimum (WCAG AA)
- Large text: 3:1 minimum
- Status colors: Don't rely on color alone (use icons + text)
- Trust score: Gradient with icon (✓ for high, ! for low)

**Touch Targets:**

- Minimum: 44px × 44px (WCAG 2.1)
- Button padding: `px-4 py-3` (meets 44px min height)
- Card tap area: Full card clickable for navigation
- Claim button: Full-width on mobile (easier tap)

**Motion Preferences:**

```css
@media (prefers-reduced-motion: reduce) {
  /* Remove all transform animations */
  /* Keep opacity changes for state indication */
  /* No page transitions */
}
```

**Focus Indicators:**

- Visible ring: `ring-2 ring-ring ring-offset-2`
- Never remove outline without replacement
- Focus-visible for keyboard only (not click)

---

## AI Slop Risk Analysis

### AI Slop Blacklist — Patterns to AVOID

| Pattern                                      | Risk Level | Wajeer Avoids By                                                     |
| -------------------------------------------- | ---------- | -------------------------------------------------------------------- |
| Purple/violet/indigo gradients               | HIGH       | Using teal accent on zinc — no purple anywhere                       |
| 3-column feature grid (icon + title + desc)  | CRITICAL   | No feature grid on landing — hero + demo link only                   |
| Icons in colored circles                     | HIGH       | No decorative icons — functional icons only (status, actions)        |
| Centered everything (text-align: center)     | MEDIUM     | Left-aligned text, justified actions, grid layouts                   |
| Uniform bubbly border-radius                 | MEDIUM     | Mixed radius: cards xl, buttons lg, inputs md                        |
| Decorative blobs/wavy SVGs                   | HIGH       | No decorative SVGs — whitespace + typography for elegance            |
| Emoji as design elements                     | LOW        | No emoji in UI copy — plain text only                                |
| Colored left-border on cards                 | MEDIUM     | No decorative borders — status badges instead                        |
| Generic hero copy ("Unlock the power of...") | CRITICAL   | Specific: "Post the shift. Your team claims it. First tap wins."     |
| Cookie-cutter section rhythm                 | MEDIUM     | Landing has hero + demo link only (no features/testimonials/pricing) |

### Wajeer Differentiation Strategy

**Instead of generic SaaS landing:**

- NO 3-column feature grid
- NO testimonials section
- NO pricing table on landing
- NO carousel
- Direct to demo link — the product sells itself

**Instead of dashboard-card mosaics:**

- Role-aware dashboard (manager sees different content than worker)
- Stats are contextual (open shifts, trust score — not vanity metrics)
- Cards are functional (claim button, approve button) — not decorative

**Instead of Inter/Roboto:**

- System fonts (SF Pro, system-ui) — instant load, native feel
- Sophistication from spacing and hierarchy, not typeface

**Instead of purple-on-white:**

- Teal (#0d9488) on zinc — trust, reliability, premium
- High contrast (zinc-900 on zinc-50) — accessibility + clarity

### Litmus Checks (7 questions)

| Check                                  | Answer | Rationale                                             |
| -------------------------------------- | ------ | ----------------------------------------------------- |
| 1. Brand unmistakable in first screen? | YES    | "Post the shift. Your team claims it." is unique      |
| 2. One strong visual anchor?           | YES    | Hero headline + teal CTA button                       |
| 3. Scannable by headlines only?        | YES    | Headline → CTA → Demo link                            |
| 4. Each section has one job?           | YES    | Hero = value prop, Demo = proof                       |
| 5. Cards actually necessary?           | YES    | Dashboard cards are functional (stats + actions)      |
| 6. Motion improves hierarchy?          | YES    | Button press, toast, modal — functional only          |
| 7. Premium without decorative shadows? | YES    | Minimal shadows, whitespace + typography carry design |

---

## Information Architecture — Screen-by-Screen

### Landing Page (`/`)

**Hierarchy:**

1. Hero headline: "Post the shift. Your team claims it. First tap wins."
2. Subheadline: "Fill last-minute staffing gaps instantly. Workers pick up extra shifts on their terms."
3. CTA: "Get Started" → `/signup`
4. Secondary CTA: "See how it works" → `/demo?view=split&demo=true`
5. Feature bullets (3 max): One-tap claiming, Instant approval, Trust scores
6. Footer: minimal (auth links, copyright)

**Mobile:** Same hierarchy, stacked. CTA buttons full-width.

**Empty state:** None — landing is always populated.

**Motion:** Hero text fade-in 300ms ease-out. Stagger feature bullets 50ms each.

### Sign Up (`/signup`)

**Hierarchy:**

1. Header: "Create your account"
2. Role selector (radio cards): "I'm a worker" | "I manage a team"
3. Form fields: Name, Email, Password
4. Submit: "Create account"
5. Link: "Already have an account? Sign in"

**States:**

- Default: Form ready
- Loading: Skeleton on submit
- Error: Field-level validation errors
- Success: Redirect to dashboard

**Mobile:** Same form, role cards stack.

### Sign In (`/login`)

**Hierarchy:**

1. Header: "Welcome back"
2. Form fields: Email, Password
3. Submit: "Sign in"
4. Link: "Create an account"
5. Redirect handling: `?redirect=/dashboard/shifts` param

**Mobile:** Identical layout.

### Dashboard (`/dashboard`) — Role-Aware

**Manager/Owner View:**

**Hierarchy:**

1. Header: "Dashboard" + UserMenu
2. Quick stats (3 cards): Open shifts, Pending claims, Active workers
3. Primary action: "Post a shift" button
4. Two-column grid:
   - Left: Recent shifts (card list)
   - Right: Pending claims (approval queue)
5. Business selector (if multi-business): Dropdown

**Worker View:**

**Hierarchy:**

1. Header: "Dashboard" + UserMenu
2. Quick stats (3 cards): Available shifts, Upcoming shifts, Trust score
3. Primary action: "Find shifts" button
4. Two-column grid:
   - Left: Available shifts (claimable list)
   - Right: My schedule (confirmed shifts)
5. Trust score display: Progress bar + numeric value

**States:**

- Loading: Skeleton grid
- Empty (no business): "Create a business to start posting shifts" + action button
- Empty (no shifts): Illustrated empty state + "Post your first shift"
- Error: Error boundary fallback

**Mobile:** Stats stack, single-column grid.

### Business List (`/dashboard/businesses`)

**Hierarchy:**

1. Header: "My Businesses"
2. Action: "Create business" button (top right)
3. Business cards grid (3-col desktop, 2-col tablet, 1-col mobile):
   - Name, Location count, Worker count, Owner badge
4. Click card → detail page

**States:**

- Loading: Skeleton cards
- Empty: "Create your first business" + illustrated empty state
- Error: Retry button

### Business Detail (`/dashboard/businesses/$id`)

**Hierarchy:**

1. Header: Business name + edit/delete actions
2. Tabs: Locations, Staff, Settings
3. Locations tab: Location cards (name, address)
4. Staff tab: Worker/manager list (name, role, trust score)
5. Settings tab: Business name, invite code, delete

**States:**

- Loading: Skeleton tabs
- Empty locations: "Add your first location"
- Empty staff: "Invite your first team member"

### Create Business (`/dashboard/businesses/new`)

**Hierarchy:**

1. Header: "Create your business"
2. Form: Business name, Primary location (name, address)
3. Submit: "Create business"
4. Cancel: Link back to list

**States:**

- Validation: Real-time field validation
- Loading: Skeleton submit button
- Success: Redirect to detail + toast "Business created"

### Shifts List (`/dashboard/shifts`)

**Hierarchy:**

1. Header: "Shifts"
2. Filters: Status dropdown, Date range, Location
3. Action: "Post shift" button
4. Shift cards grid: Date, Time, Role, Status badge, Claim count
5. Click card → detail page

**States:**

- Loading: Skeleton cards
- Empty: "Post your first shift" + illustrated empty state
- Filtered empty: "No shifts match your filters"

### Shift Detail (`/dashboard/shifts/$id`)

**Hierarchy:**

1. Header: Shift title + status badge + edit/cancel actions
2. Info section: Date, Time, Location, Role, Hourly rate, Notes
3. Claims section: Pending claims list (worker name, trust score, claimed at)
   - Each claim: Approve/Reject buttons
4. Confirmed worker: If approved, show worker card

**States:**

- Loading: Skeleton info
- No claims: "Waiting for workers to claim"
- Claimed: Show claim queue
- Approved: Show confirmed worker

### Post Shift (`/dashboard/shifts/new`)

**Hierarchy:**

1. Header: "Post a shift"
2. Business/Location selector: Dropdown
3. Form fields: Title, Role, Date, Start time, End time, Hourly rate, Notes
4. Submit: "Post shift"
5. Cancel: Link back to list

**States:**

- Validation: Real-time validation
- Loading: Skeleton submit
- Success: Redirect to detail + toast "Shift posted" + SSE notification to workers

### Available Shifts (`/dashboard/available`) — Worker

**Hierarchy:**

1. Header: "Available Shifts"
2. Filters: Location, Role, Date
3. Shift cards: Date, Time, Role, Location, Hourly rate, Trust requirement
4. Each card: "Claim" button (one-tap)
5. Claimed indicator: If already claimed, show "Claimed by X others" + race indicator

**States:**

- Loading: Skeleton cards
- Empty: "No shifts available from your connected businesses"
- Claiming: Button shows loading spinner
- Claim success: Toast "Shift claimed — awaiting approval"
- Claim error: Toast "Claim failed — try another shift"

### My Schedule (`/dashboard/schedule`) — Worker

**Hierarchy:**

1. Header: "My Schedule"
2. View toggle: Calendar | List
3. Calendar view: Week/month grid with shift blocks
4. List view: Chronological shift cards (date, time, location, role)
5. Each shift: Status badge, location, time

**States:**

- Loading: Skeleton calendar/list
- Empty: "No upcoming shifts — claim some available shifts"
- Past shifts: Separate "History" tab

### Notifications (`/dashboard/notifications`)

**Hierarchy:**

1. Header: "Notifications"
2. Filter: Unread only toggle
3. Notification list: Icon, Title, Body, Timestamp, Read badge
4. Each item: Click → relevant page (shift detail, claim status)
5. Mark all read: Button

**States:**

- Loading: Skeleton list
- Empty: "No notifications yet"
- Unread: Badge count in header bell

### Profile (`/dashboard/profile`)

**Hierarchy:**

1. Header: "Profile"
2. Avatar section: Photo, Name, Email
3. Stats section: Trust score (progress bar), Completed shifts, Reliability
4. Connected businesses: List of businesses user belongs to
5. Edit: Change name, photo

**States:**

- Loading: Skeleton stats
- Update success: Toast "Profile updated"

---

## Interaction State Matrix

| Feature           | Loading                   | Empty                                                | Error                              | Success                                   | Partial                                   |
| ----------------- | ------------------------- | ---------------------------------------------------- | ---------------------------------- | ----------------------------------------- | ----------------------------------------- |
| **Auth**          |
| Sign up form      | Skeleton submit button    | —                                                    | Field validation errors inline     | Toast + redirect to dashboard             | —                                         |
| Sign in form      | Skeleton submit button    | —                                                    | "Invalid credentials" inline       | Redirect to ?redirect param               | —                                         |
| **Business**      |
| Business list     | 3 skeleton cards          | Illustrated empty state + "Create business" CTA      | Error boundary + retry button      | Cards populated                           | —                                         |
| Business form     | Skeleton submit           | —                                                    | Field errors inline                | Toast "Created" + redirect to detail      | —                                         |
| Business detail   | Skeleton tabs             | Tab-specific empty states                            | Error boundary + retry             | Tabs populated                            | —                                         |
| Staff list        | 3 skeleton rows           | "Invite your first team member" + invite button      | —                                  | List populated                            | —                                         |
| **Shifts**        |
| Shift list        | 6 skeleton cards          | "Post your first shift" + illustrated empty          | Error boundary + retry             | Cards populated                           | Filtered: "No shifts match filters"       |
| Shift form        | Skeleton submit           | —                                                    | Field errors inline                | Toast "Posted" + redirect + SSE broadcast | —                                         |
| Shift detail      | Skeleton info + claims    | —                                                    | Error boundary + retry             | Info + claims visible                     | No claims: "Waiting for workers to claim" |
| **Claims**        |
| Available shifts  | 4 skeleton cards          | "No shifts available from your connected businesses" | Error boundary + retry             | Cards populated                           | Claimed: "Claimed by X others" badge      |
| Claim action      | Button spinner + disabled | —                                                    | Toast "Claim failed — try another" | Toast "Claim submitted" + card update     | —                                         |
| Claim queue       | Skeleton list             | "Waiting for workers to claim"                       | —                                  | List populated with approve/reject        | —                                         |
| Approve action    | Button spinner            | —                                                    | Toast "Approval failed"            | Toast "Worker confirmed" + status update  | —                                         |
| **Schedule**      |
| Schedule list     | 4 skeleton cards          | "No upcoming shifts — claim some available shifts"   | Error boundary + retry             | Cards populated                           | —                                         |
| Schedule calendar | Skeleton grid             | Empty grid + "Claim shifts to fill your calendar"    | Error boundary + retry             | Grid with shift blocks                    | —                                         |
| **Notifications** |
| Notification list | 4 skeleton rows           | "No notifications yet"                               | Error boundary + retry             | List populated                            | Unread badge count in header              |
| Mark as read      | Spinner on item           | —                                                    | —                                  | Badge decrements, item grays              | —                                         |
| **Profile**       |
| Profile stats     | Skeleton stats            | —                                                    | Error boundary + retry             | Stats visible                             | Trust score: progress bar + numeric       |
| Trust score       | Skeleton bar              | "Complete shifts to build your score"                | —                                  | Progress bar 0-100                        | Score shown with color gradient           |

### Empty State Copy Standards

| Feature                      | Headline                        | Body                                                              | Action                       |
| ---------------------------- | ------------------------------- | ----------------------------------------------------------------- | ---------------------------- |
| No businesses                | "Create your first business"    | "Add your restaurant, store, or venue to start posting shifts."   | "Create Business" button     |
| No shifts (manager)          | "Post your first shift"         | "Workers will be notified instantly when you post a shift."       | "Post Shift" button          |
| No available shifts (worker) | "No shifts available right now" | "Check back soon — managers post shifts throughout the day."      | "View Schedule" link         |
| No schedule (worker)         | "Your schedule is empty"        | "Claim available shifts to fill your calendar."                   | "Find Shifts" button         |
| No claims (manager)          | "Waiting for workers to claim"  | "Workers in your team will be notified about this shift."         | — (no action, informational) |
| No notifications             | "No notifications yet"          | "We'll notify you when shifts are posted or claims are approved." | —                            |

---

## User Journeys

### Journey 1: Business Owner Onboards

```
Step | User Action                | System Response           | UI State
-----|----------------------------|--------------------------|----------
1    | Signs up (owner role)      | Creates account          | Signup form
2    | Lands on dashboard         | Shows empty state        | "Create business" prompt
3    | Clicks "Create business"   | Opens form               | Business form
4    | Fills name + location      | Validates                | Form fields
5    | Submits                    | Creates business         | Skeleton → redirect
6    | Business created           | Shows detail page        | Business tabs
7    | Invites workers            | Sends invite links       | Invite dialog
8    | Workers join               | Adds to user_business    | Staff list updates
```

**Emotional arc:** Curious → Frustrated (empty) → Confident (form) → Accomplished (created) → Proud (team joining)

### Journey 2: Manager Posts Shift

```
Step | User Action                | System Response           | UI State
-----|----------------------------|--------------------------|----------
1    | Logs in                    | Auth check               | Dashboard
2    | Clicks "Post shift"        | Opens form               | Shift form
3    | Selects location           | Dropdown                 | Location picker
4    | Fills shift details        | Validates                | Form fields
5    | Submits                    | Creates shift (status=open) | Skeleton → redirect
6    | Shift posted               | SSE broadcasts to workers | Shift detail
7    | Workers notified           | Push notification        | Worker phone notification
8    | Workers claim              | Creates claims           | Claim queue updates
9    | Manager approves           | Updates claim + shift    | Status → approved
10   | Worker notified            | Push notification        | "You're confirmed"
```

**Emotional arc:** Routine → Anxious (need coverage) → Hopeful (posted) → Anticipating (claims) → Relieved (approved)

### Journey 3: Worker Claims Shift

```
Step | User Action                | System Response           | UI State
-----|----------------------------|--------------------------|----------
1    | Receives notification      | Push: "New shift available" | Phone notification
2    | Opens app                  | Auth check               | Dashboard
3    | Clicks "Available shifts"  | Loads list               | Shift cards
4    | Scrolls to shift           | Shows details            | Shift card
5    | Taps "Claim"               | Creates claim (status=pending) | Button loading → success
6    | Toast shows                | "Claim submitted"        | Toast notification
7    | Manager reviews            | Approves/rejects         | Manager claim queue
8    | Worker notified            | Push: result             | Phone notification
9    | If approved                | Shift added to schedule  | Schedule page
10   | If rejected                | Reason shown             | Toast with reason
```

**Emotional arc:** Alert → Excited (extra income) → Competitive (tap fast) → Nervous (waiting) → Joy (approved) or Disappointed (rejected)

### Journey 4: Trust Score Builds

```
Step | User Action                | System Response           | UI State
-----|----------------------------|--------------------------|----------
1    | Completes shift            | Manager confirms         | Shift status → completed
2    | Manager rates              | Optional rating (1-5)    | Rating dialog
3    | Trust score updates        | Recalculates             | Profile stats
4    | Worker sees score          | Displays in profile      | Trust score badge
5    | High score                 | Priority in claim queue  | Higher claim success
6    | Low score                  | Warning shown            | "Improve reliability"
```

**Emotional arc:** Routine → Accomplished (completed) → Proud (score increase) → Motivated (maintain)

---

## Time-Horizon Design (Norman's 3 Levels)

### Landing Page — Time Horizons

| Horizon                    | User Sees                                      | Design Supports                            |
| -------------------------- | ---------------------------------------------- | ------------------------------------------ |
| **5 seconds** (Visceral)   | Dark zinc background, teal CTA, clean headline | Immediate value proposition, trust signals |
| **5 minutes** (Behavioral) | Understands claiming flow, watches demo        | Demo link prominent, feature bullets clear |
| **5 years** (Reflective)   | "This feels like a tool built for me"          | Clean premium aesthetic, no dark patterns  |

### Dashboard — Time Horizons

| Horizon                    | Manager Sees                      | Worker Sees                         |
| -------------------------- | --------------------------------- | ----------------------------------- |
| **5 seconds** (Visceral)   | Stats cards, pending claims alert | Trust score, available shifts count |
| **5 minutes** (Behavioral) | Posts a shift, approves a claim   | Claims a shift, checks schedule     |
| **5 years** (Reflective)   | "This reduced my no-show anxiety" | "This gave me schedule control"     |

### Claim Action — Time Horizons

| Horizon                    | User Feels                              | Design Supports                                              |
| -------------------------- | --------------------------------------- | ------------------------------------------------------------ |
| **5 seconds** (Visceral)   | Tap button, instant feedback            | scale(0.97) on press, spinner, toast                         |
| **5 minutes** (Behavioral) | Waiting for approval                    | Notification bell shows pending, schedule shows "pending"    |
| **5 years** (Reflective)   | "I built a reliable income stream here" | Trust score reflects history, profile shows completed shifts |

---

## Server Functions & Services

### Services Directory (`apps/web/src/services/`)

Each service wraps createServerFn with validation, auth check, and Kysely query.

**business-service.ts:**

- `getBusinesses(userId)` — List user's businesses
- `getBusiness(id)` — Single business detail
- `createBusiness(data)` — New business (owner)
- `updateBusiness(id, data)` — Edit business
- `deleteBusiness(id)` — Remove business (owner only)
- `inviteMember(businessId, email, role)` — Invite worker/manager
- `getStaff(businessId)` — List business members

**shift-service.ts:**

- `getShifts(businessId, filters)` — List shifts (manager)
- `getAvailableShifts(userId)` — List claimable shifts (worker)
- `getShift(id)` — Single shift detail
- `createShift(data)` — Post new shift (manager)
- `updateShift(id, data)` — Edit shift (manager)
- `cancelShift(id)` — Cancel shift (manager)
- `completeShift(id)` — Mark completed (manager)

**claim-service.ts:**

- `getClaims(shiftId)` — List claims for shift (manager)
- `createClaim(shiftId, userId)` — Claim shift (worker)
- `approveClaim(claimId)` — Approve (manager)
- `rejectClaim(claimId, reason)` — Reject (manager)
- `getMyClaims(userId)` — Worker's claim history

**notification-service.ts:**

- `getNotifications(userId)` — List notifications
- `markRead(notificationId)` — Mark as read
- `markAllRead(userId)` — Mark all read
- `pushNotification(userId, type, data)` — Create notification + SSE/Push

**trust-service.ts:**

- `calculateTrustScore(userId)` — Compute from history
- `updateTrustScore(userId, score)` — Update user_business

### SSE Stream (`/api/shifts/stream`)

Existing in demo. Extend for production:

- Events: `shift:posted`, `shift:claimed`, `shift:approved`, `shift:rejected`, `shift:cancelled`
- Filter by user's connected businesses
- Real-time notification delivery

---

## Implementation Phases

### Phase 1: Foundation (Week 1 equivalent → 1-2 hours)

**Goal:** Auth flow + dashboard shell + business creation

| Task                                                                                              | Files                                                        | Est. Time |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | --------- |
| Add shadcn components (Dialog, Sheet, Tabs, Avatar, Badge, Skeleton, Select, Textarea, Separator) | packages/ui/src/components/\*.tsx                            | 15 min    |
| Create DESIGN.md (color variables, typography, spacing)                                           | DESIGN.md                                                    | 10 min    |
| Update signup form with role selector                                                             | apps/web/src/components/sign-up-form.tsx                     | 20 min    |
| Create business service + server functions                                                        | apps/web/src/services/business-service.ts                    | 30 min    |
| Create business form component                                                                    | apps/web/src/components/business-form.tsx                    | 20 min    |
| Create business card/list components                                                              | apps/web/src/components/business-card.tsx, business-list.tsx | 20 min    |
| Create business routes (list, detail, new)                                                        | apps/web/src/routes/dashboard/businesses/\*.tsx              | 30 min    |
| Update dashboard manager view with real business list                                             | apps/web/src/routes/dashboard.tsx                            | 10 min    |
| Create empty state component                                                                      | apps/web/src/components/empty-state.tsx                      | 10 min    |
| Create loading skeleton patterns                                                                  | apps/web/src/components/skeleton.tsx                         | 10 min    |

**Milestone:** Manager can create business, see it in dashboard.

### Phase 2: Shift Management (Week 1.5 equivalent → 1-2 hours)

**Goal:** Post shifts, view shifts, SSE notifications

| Task                                    | Files                                                  | Est. Time |
| --------------------------------------- | ------------------------------------------------------ | --------- |
| Create shift service + server functions | apps/web/src/services/shift-service.ts                 | 30 min    |
| Create shift form component             | apps/web/src/components/shift-form.tsx                 | 25 min    |
| Create shift card/list components       | apps/web/src/components/shift-card.tsx, shift-list.tsx | 25 min    |
| Create shift status badge               | apps/web/src/components/shift-status-badge.tsx         | 10 min    |
| Create shift routes (list, detail, new) | apps/web/src/routes/dashboard/shifts/\*.tsx            | 35 min    |
| Extend SSE stream for production        | apps/web/src/routes/api/shifts/stream.ts               | 20 min    |
| Create notification bell component      | apps/web/src/components/notification-bell.tsx          | 15 min    |
| Create notification service             | apps/web/src/services/notification-service.ts          | 20 min    |
| Create notification routes              | apps/web/src/routes/dashboard/notifications.tsx        | 15 min    |

**Milestone:** Manager can post shift, workers receive notification via SSE.

### Phase 3: Worker Experience (Week 2 equivalent → 1 hour)

**Goal:** Claim shifts, view schedule, trust score

| Task                                    | Files                                                       | Est. Time |
| --------------------------------------- | ----------------------------------------------------------- | --------- |
| Create claim service + server functions | apps/web/src/services/claim-service.ts                      | 25 min    |
| Create claim button component           | apps/web/src/components/claim-button.tsx (enhance existing) | 15 min    |
| Create available shifts route           | apps/web/src/routes/dashboard/available.tsx                 | 20 min    |
| Create schedule route (list + calendar) | apps/web/src/routes/dashboard/schedule.tsx                  | 25 min    |
| Create trust score display              | apps/web/src/components/trust-score-display.tsx             | 15 min    |
| Create trust service                    | apps/web/src/services/trust-service.ts                      | 15 min    |
| Create profile route                    | apps/web/src/routes/dashboard/profile.tsx                   | 15 min    |

**Milestone:** Worker can claim shift, see schedule, view trust score.

### Phase 4: Approval Flow + Polish (Week 2.5 equivalent → 1 hour)

**Goal:** Approve/reject claims, empty states, animations, responsive polish

| Task                                                   | Files                                                  | Est. Time |
| ------------------------------------------------------ | ------------------------------------------------------ | --------- |
| Create claim card/list for managers                    | apps/web/src/components/claim-card.tsx, claim-list.tsx | 20 min    |
| Enhance shift detail with claim queue                  | apps/web/src/routes/dashboard/shifts/$id.tsx           | 20 min    |
| Create claim status badge                              | apps/web/src/components/claim-status-badge.tsx         | 10 min    |
| Add empty states to all lists                          | apps/web/src/components/empty-state.tsx (variants)     | 15 min    |
| Add animations (GSAP micro, Anime.js page transitions) | apps/web/src/hooks/use-page-transition.ts, components  | 25 min    |
| Responsive polish (mobile nav sheet, grid adjustments) | apps/web/src/routes/dashboard/\*.tsx                   | 20 min    |
| Add toast notifications for all mutations              | apps/web/src/routes/dashboard/\*.tsx (sonner calls)    | 10 min    |
| Create error boundary fallbacks                        | apps/web/src/routes/dashboard/error.tsx                | 10 min    |

**Milestone:** Full core loop works end-to-end.

### Phase 5: Trust Score Logic + Stats (Week 3 equivalent → 30 min)

**Goal:** Trust score calculation, dashboard stats

| Task                                                          | Files                                                        | Est. Time |
| ------------------------------------------------------------- | ------------------------------------------------------------ | --------- |
| Implement trust score calculation                             | apps/web/src/services/trust-service.ts                       | 20 min    |
| Add dashboard stats cards (open shifts, pending claims, etc.) | apps/web/src/routes/dashboard.tsx                            | 15 min    |
| Add business staff list with trust scores                     | apps/web/src/routes/dashboard/businesses/$id.tsx (staff tab) | 10 min    |

**Milestone:** Trust scores reflect worker reliability, managers see staff stats.

---

## Resolved Design Decisions

| Decision                     | Options                                  | Selected                                            | Rationale                                                               |
| ---------------------------- | ---------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------- |
| Notification delivery method | SSE only, Push API, Both                 | **SSE only**                                        | Simpler implementation, works in all browsers, real-time enough for MVP |
| Trust score formula          | Completed shifts %, Rating avg, Both     | **Both (60% completion + 40% rating)**              | Balanced view: reliability AND quality                                  |
| Calendar implementation      | Custom, react-calendar, FullCalendar     | **Custom lightweight (week view)**                  | Simpler for MVP, matches schedule needs                                 |
| Mobile nav pattern           | Sheet drawer, Bottom nav, Hamburger menu | **Sheet drawer**                                    | Clean premium aesthetic, works with existing Sheet component            |
| Claim race visualization     | Progress bar, Countdown, Avatar race     | **Avatar race**                                     | Engaging, shows competitive element, already built in demo              |
| Multi-location business UI   | Tabs, Dropdown selector, Cards grid      | **Dropdown in shift form, tabs in business detail** | Context-appropriate                                                     |

**Design Decision (2026-03-31):** User confirmed all recommendations.

---

## Not in Scope (Deferred)

| Feature                        | Reason                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------ |
| Payment integration            | Platform fee transaction logic — post-MVP monetization                         |
| OAuth providers (Google, etc.) | Email/password sufficient for MVP, add later for onboarding friction reduction |
| Mobile app (native)            | Web-first, React Native later if traction                                      |
| Admin dashboard                | Single-business owner self-service, multi-business management later            |
| Analytics dashboard            | Basic stats in MVP, detailed analytics post-launch                             |
| Shift templates                | Manual posting MVP, recurring templates later                                  |
| Worker availability calendar   | Claim MVP, availability matching later                                         |
| In-app messaging               | Notifications MVP, chat post-launch                                            |
| Multi-language                 | English MVP, i18n later                                                        |

---

## What Already Exists

| Component/File                   | Status      | Notes                                                    |
| -------------------------------- | ----------- | -------------------------------------------------------- |
| Database schema                  | ✓ Complete  | No changes needed                                        |
| Auth setup                       | ✓ Basic     | Email/password working, needs role selector in signup    |
| Landing page                     | ✓ Basic     | Enhance with clearer hierarchy                           |
| Demo war room                    | ✓ Complete  | SSE + Zustand working, extend for production             |
| Dashboard shell                  | ✓ Basic     | Placeholder sections, needs real data                    |
| shadcn Button, Card, Input, etc. | ✓ Partial   | Add Dialog, Sheet, Tabs, Avatar, Badge, Skeleton, Select |
| Header component                 | ✓ Basic     | Enhance with role-aware nav                              |
| Zustand shift-store              | ✓ Demo only | Create separate stores for business, claim, notification |
| SurrealDB provider               | ✓ Setup     | Kysely queries via services                              |

---

## TODOS.md Updates (Proposed)

After plan approval, add to TODOS.md:

| TODO                                                                                                      | Why                          | Priority |
| --------------------------------------------------------------------------------------------------------- | ---------------------------- | -------- |
| Add missing shadcn components (Dialog, Sheet, Tabs, Avatar, Badge, Skeleton, Select, Textarea, Separator) | UI building blocks for MVP   | High     |
| Create DESIGN.md with clean premium variables                                                             | Design system alignment      | High     |
| Implement role selector in signup form                                                                    | Worker vs manager onboarding | High     |
| Create business service + CRUD server functions                                                           | Core feature foundation      | High     |
| Create shift service + CRUD server functions                                                              | Core feature foundation      | High     |
| Create claim service + approval logic                                                                     | Core feature foundation      | High     |
| Extend SSE stream for production (filter by business)                                                     | Real-time notifications      | High     |
| Create notification service + bell component                                                              | User engagement              | Medium   |
| Implement trust score calculation logic                                                                   | Worker reliability           | Medium   |
| Add responsive polish (mobile sheet nav)                                                                  | Mobile worker experience     | Medium   |
| Add GSAP micro-interactions (button press, card hover)                                                    | Clean premium feel           | Medium   |
| Add Anime.js page transitions                                                                             | Polish                       | Low      |
| Add empty state illustrations                                                                             | UX completeness              | Low      |
| Add error boundary fallbacks                                                                              | Error handling               | Low      |

---

## GSTACK REVIEW REPORT

| Review        | Trigger               | Why                             | Runs | Status                       | Findings                                 |
| ------------- | --------------------- | ------------------------------- | ---- | ---------------------------- | ---------------------------------------- |
| CEO Review    | `/plan-ceo-review`    | Scope & strategy                | 0    | —                            | —                                        |
| Codex Review  | `/codex review`       | Independent 2nd opinion         | 0    | —                            | —                                        |
| Eng Review    | `/plan-eng-review`    | Architecture & tests (required) | 1    | ISSUES_OPEN (commit 9f7a389) | 8 issues, 3 critical gaps                |
| Design Review | `/plan-design-review` | UI/UX gaps                      | 1    | CLEAN                        | score: 7/10 → 9/10, 6 decisions resolved |

**VERDICT:** DESIGN CLEARED — Eng review has open issues (run `/plan-eng-review` to address)

---

## Next Steps

1. ~~**User confirms scope**~~ ✓ Confirmed: Full MVP
2. ~~**Generate visual mockups**~~ Skipped (OpenAI API key needed)
3. **Run /plan-eng-review** — Address 8 open issues from prior review (required gate)
4. ~~**Run /plan-design-review**~~ ✓ Completed: 9/10 design score
5. **Run /plan-ceo-review** — Optional, if scope/product direction questions remain
6. **Create TODOS.md** — Populate with implementation tasks
7. **Begin implementation** — Phase-by-phase with verification at each milestone
