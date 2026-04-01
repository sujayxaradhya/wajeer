# MVP Refinement Plan: Wajeer Shift Marketplace

## Executive Summary

Wajeer is a shift marketplace platform with significant infrastructure already built. This plan refines the existing implementation to deliver a focused, production-ready MVP while removing redundant complexity and establishing a distinctive design system.

---

## Current State Analysis

### What's Already Built ✅

| Feature                      | Status        | Location                                                       |
| ---------------------------- | ------------- | -------------------------------------------------------------- |
| Authentication (Better Auth) | Complete      | `packages/auth/`, `apps/web/src/lib/auth-client.ts`            |
| Database Schema (SurrealDB)  | Complete      | `packages/db/src/schema.ts` — 10 tables                        |
| Shadcn UI Components         | 24 components | `packages/ui/src/components/`                                  |
| TanStack Start Setup         | Complete      | File-based routing in `apps/web/src/routes/`                   |
| Business CRUD                | Complete      | `apps/web/src/routes/dashboard/businesses/`                    |
| Location Management          | Complete      | `apps/web/src/functions/location.ts`                           |
| Shift Posting                | Complete      | `apps/web/src/routes/dashboard/shifts/new.tsx`                 |
| Shift Claiming               | Complete      | `apps/web/src/routes/dashboard/available.tsx`                  |
| Dashboard Shell              | Complete      | `apps/web/src/routes/dashboard.tsx` with sidebar               |
| Sign In/Up Forms             | Complete      | `apps/web/src/components/sign-in-form.tsx`, `sign-up-form.tsx` |
| Home Page                    | Complete      | `apps/web/src/routes/index.tsx`                                |
| Query Keys Structure         | Complete      | `apps/web/src/lib/query-keys.ts`                               |
| Middleware (Auth)            | Complete      | `apps/web/src/middleware/auth.ts`                              |

### What Needs Refinement 🔧

1. **Dashboard Index** — Currently shows demo data (SectionCards, ChartAreaInteractive, DataTable) instead of real shift data
2. **Notifications** — Schema exists but no UI implementation
3. **Shift Detail View** — `$id.tsx` needs completion for viewing individual shifts
4. **Form Patterns** — Not using shadcn's FieldGroup/Field pattern (using `space-y-2` divs)
5. **Design System** — Generic Inter font, inconsistent styles (base-lyra vs base-nova)

### Redundant for MVP 🗑️

| Component                    | Reason                                    | Action                           |
| ---------------------------- | ----------------------------------------- | -------------------------------- |
| `demo.tsx`                   | Marketing demo page, not core MVP flow    | Remove                           |
| `phone-frame.tsx`            | Decorative wrapper, no functional purpose | Remove                           |
| `manager-panel.tsx`          | Unclear purpose, overlaps with dashboard  | Remove                           |
| `chart-area-interactive.tsx` | Demo analytics, no real data source       | Simplify or remove               |
| `section-cards.tsx`          | Demo metrics, no real data                | Replace with shift summary       |
| `data-table.tsx`             | Over-engineered for MVP needs             | Simplify to basic Table          |
| `use-live-shifts.ts`         | Advanced live query feature               | Keep for later, not MVP critical |
| `use-page-transition.ts`     | Animation helper, not essential           | Keep but deprioritize            |
| `worker-card.tsx`            | Duplicate of shift card pattern           | Consolidate                      |
| `trust-score-badge.tsx`      | Complex scoring not MVP-ready             | Simplify to basic badge          |
| `claim-button.tsx`           | Single-purpose component                  | Inline into shift card           |
| `loader.tsx`                 | Generic spinner, use Skeleton instead     | Remove, use Skeleton             |

---

## Design System Proposal

Based on frontend-design, emil-design-eng, and shadcn skills:

### Aesthetic Direction: **Industrial/Utilitarian with Warm Touch**

Wajeer serves restaurants, retail, healthcare — industries where clarity and speed matter more than decoration. The aesthetic should feel:

- **Functional first** — Data-dense but organized
- **Warm undertones** — Not cold enterprise; welcoming for hourly workers
- **Clear hierarchy** — Shifts, times, rates prominent; secondary info muted

### Typography

| Role         | Font                     | Rationale                                                 |
| ------------ | ------------------------ | --------------------------------------------------------- |
| Display/Hero | **Geist**                | Modern, clean, excellent for numbers/times (tabular-nums) |
| Body         | **DM Sans**              | Friendly but professional, good readability               |
| Data/Tables  | **Geist** (tabular-nums) | Numbers align perfectly, critical for shift times/rates   |

**Font blacklist compliance**: NOT using Inter, Roboto, Arial (currently using Inter Variable — needs replacement)

### Color Palette

| Token       | Light Mode             | Dark Mode              | Usage                                            |
| ----------- | ---------------------- | ---------------------- | ------------------------------------------------ |
| Primary     | `oklch(0.55 0.18 145)` | `oklch(0.65 0.18 145)` | CTAs, active states — green for "available/open" |
| Secondary   | `oklch(0.97 0.01 260)` | `oklch(0.27 0.01 260)` | Cards, backgrounds                               |
| Accent      | `oklch(0.70 0.15 30)`  | `oklch(0.75 0.15 30)`  | Warnings, pending states — amber                 |
| Destructive | `oklch(0.55 0.22 25)`  | `oklch(0.60 0.22 25)`  | Errors, cancelled shifts — red                   |
| Muted       | `oklch(0.55 0.02 260)` | `oklch(0.70 0.02 260)` | Secondary text, timestamps                       |

**Semantic shift status colors**:

- Open/Available → Primary (green)
- Claimed/Pending → Accent (amber)
- Approved → Success green variant
- Cancelled → Destructive (red)
- Completed → Muted (neutral)

### Spacing & Layout

- **Base unit**: 4px
- **Density**: Comfortable (workers use mobile, need touch targets)
- **Grid**: Dashboard uses sidebar + content area (already built)
- **Card padding**: 16px (md), compact lists use 12px (sm)

### Motion (per emil-design-eng)

- **Approach**: Minimal-functional
- **Button press**: `scale(0.97)` on `:active` (160ms ease-out)
- **Card hover**: Subtle lift (`translateY(-2px)` 150ms ease-out)
- **Page transitions**: Skip for keyboard-initiated actions
- **Stagger**: 30-50ms on shift card list appearance
- **Reduced motion**: Respect `prefers-reduced-motion`

### Anti-Slop Checklist

- ✅ No purple gradients
- ✅ No 3-column icon grids
- ✅ No centered everything
- ✅ No uniform border-radius (use hierarchical: sm/md/lg)
- ✅ No gradient buttons as primary CTA

---

## Shadcn Components Plan

### Already Installed (24)

```
avatar, badge, breadcrumb, button, card, chart, checkbox, dialog, drawer, dropdown-menu, input, label, select, separator, sheet, sidebar, skeleton, sonner, table, tabs, textarea, toggle-group, toggle, tooltip
```

### Add for MVP

| Component  | Usage                                                        | Priority |
| ---------- | ------------------------------------------------------------ | -------- |
| `alert`    | Error messages, notifications banner                         | HIGH     |
| `progress` | Claim approval progress, loading bars                        | MEDIUM   |
| `switch`   | Settings toggles (notifications, availability)               | MEDIUM   |
| `popover`  | Quick info popups, mini calendars                            | LOW      |
| `calendar` | Date selection for shift posting                             | HIGH     |
| `combobox` | Role/location search (better than raw Select for long lists) | MEDIUM   |

### Commands to Run

```bash
# From packages/ui directory
bun x shadcn@latest add alert -c packages/ui
bun x shadcn@latest add progress -c packages/ui
bun x shadcn@latest add switch -c packages/ui
bun x shadcn@latest add popover -c packages/ui
bun x shadcn@latest add calendar -c packages/ui
bun x shadcn@latest add combobox -c packages/ui
```

### Form Pattern Refactor

Replace all `div className="space-y-2"` form patterns with shadcn's FieldGroup/Field:

```tsx
// Current (wrong)
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" />
</div>

// Target (correct per shadcn/forms.md)
<FieldGroup>
  <Field>
    <FieldLabel htmlFor="email">Email</FieldLabel>
    <Input id="email" />
  </Field>
</FieldGroup>
```

Files to refactor:

- `sign-in-form.tsx`
- `sign-up-form.tsx`
- `routes/dashboard/shifts/new.tsx`
- `routes/dashboard/businesses/new.tsx`

---

## Database Schema Refinement

### MVP Tables (Keep)

| Table           | MVP Purpose                | Notes                      |
| --------------- | -------------------------- | -------------------------- |
| `user`          | Auth + profile             | ✅ Essential               |
| `business`      | Business entity            | ✅ Essential               |
| `location`      | Business locations         | ✅ Essential               |
| `user_business` | User-Business relationship | ✅ Essential               |
| `shift`         | Shift postings             | ✅ Essential               |
| `claim`         | Shift claims               | ✅ Essential               |
| `notification`  | User notifications         | ✅ Essential               |
| `session`       | Auth sessions              | ✅ Essential (Better Auth) |
| `account`       | Auth accounts              | ✅ Essential (Better Auth) |
| `verification`  | Email verification         | ✅ Essential (Better Auth) |

**All 10 tables are MVP-critical** — no schema reduction needed.

### Field Simplification (Optional for MVP)

- `trust_score` on user/user_business → Start with simple count-based scoring (claims completed / claims made)
- `reliability` on user_business → Derive from claim history, don't compute real-time
- `roles` array on user → Simplify to single role if needed

---

## Route Structure Plan

### Keep (MVP Routes)

```
/                     → Home/landing (keep)
/login                → Auth page (keep)
/signup               → Auth page (keep)
/dashboard            → Dashboard shell (keep)
/dashboard/           → Dashboard index (REPLACE demo data with real shifts)
/dashboard/shifts     → My shifts list (keep)
/dashboard/shifts/new → Post shift form (keep)
/dashboard/shifts/$id → Shift detail (COMPLETE)
/dashboard/available  → Available shifts (keep)
/dashboard/schedule   → Calendar view (simplify)
/dashboard/businesses → Business list (keep)
/dashboard/businesses/new → Create business (keep)
/dashboard/businesses/$id → Business detail (keep)
/dashboard/profile    → User profile (keep)
/dashboard/notifications → Notifications (IMPLEMENT)
```

### Remove

```
/demo                 → Remove demo page
```

---

## Implementation Tasks

### Phase 1: Design System Foundation (Human: 2hr / CC: 30min)

1. Update `packages/ui/src/styles/globals.css`:
   - Replace Inter Variable with Geist + DM Sans (Google Fonts or Bunny Fonts)
   - Update color tokens to semantic palette
   - Add custom easing curves per emil-design-eng

2. Sync shadcn styles:
   - `packages/ui`: base-lyra → unify with apps/web base-nova
   - Run `bun x shadcn@latest init --preset base-nova --force --no-reinstall` in packages/ui

3. Add typography scale CSS variables:
   ```css
   --text-xs: 0.75rem;
   --text-sm: 0.875rem;
   --text-base: 1rem;
   --text-lg: 1.125rem;
   --text-xl: 1.25rem;
   --text-2xl: 1.5rem;
   ```

### Phase 2: Component Cleanup (Human: 1hr / CC: 15min)

1. Remove redundant files:

   ```bash
   rm apps/web/src/routes/demo.tsx
   rm apps/web/src/components/phone-frame.tsx
   rm apps/web/src/components/manager-panel.tsx
   rm apps/web/src/components/loader.tsx
   rm apps/web/src/components/claim-button.tsx
   rm apps/web/src/components/trust-score-badge.tsx
   ```

2. Consolidate duplicate patterns:
   - Merge `worker-card.tsx` logic into shift cards
   - Simplify `data-table.tsx` to basic Table usage

### Phase 3: Add Missing Shadcn Components (Human: 15min / CC: 5min)

```bash
cd packages/ui
bun x shadcn@latest add alert calendar combobox popover progress switch
```

### Phase 4: Dashboard Index Refactor (Human: 1hr / CC: 20min)

Replace demo data with real shift summary:

```tsx
// Target: dashboard/index.tsx
function DashboardPage() {
  const { data: myShifts } = useQuery({ queryKey: ["my-shifts"], ... });
  const { data: availableShifts } = useQuery({ queryKey: ["available-shifts"], ... });
  const { data: pendingClaims } = useQuery({ queryKey: ["pending-claims"], ... });

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <ShiftSummaryCards
        posted={myShifts?.length ?? 0}
        available={availableShifts?.length ?? 0}
        pending={pendingClaims?.length ?? 0}
      />
      <RecentShifts shifts={myShifts?.slice(0, 5)} />
      <QuickActions />
    </div>
  );
}
```

### Phase 5: Form Pattern Refactor (Human: 2hr / CC: 30min)

Apply FieldGroup/Field pattern to all forms:

- sign-in-form.tsx
- sign-up-form.tsx
- shifts/new.tsx
- businesses/new.tsx

### Phase 6: Notifications Page (Human: 1hr / CC: 20min)

Implement notifications UI:

- List view with Badge for notification type
- Mark as read mutation
- Link to related shift/claim

### Phase 7: Shift Detail Page (Human: 1hr / CC: 20min)

Complete `routes/dashboard/shifts/$id.tsx`:

- Shift info card
- Claims list (for managers)
- Approve/reject actions
- Status timeline

### Phase 8: Animation Polish (Human: 30min / CC: 10min)

Apply emil-design-eng motion principles:

- Add `scale(0.97)` to all Button `:active`
- Stagger shift card list animations
- Add page hover effects to cards
- Ensure `prefers-reduced-motion` support

---

## Verification Commands

```bash
# Type check
bun run check-types

# Lint
bun run check

# Format
bun run fix

# Dev server
bun run dev:web
```

---

## File Changes Summary

| Action | Files                                              | Impact                   |
| ------ | -------------------------------------------------- | ------------------------ |
| Modify | `packages/ui/src/styles/globals.css`               | Design system foundation |
| Modify | `apps/web/src/routes/dashboard/index.tsx`          | Real data vs demo        |
| Modify | `apps/web/src/components/sign-in-form.tsx`         | Form pattern             |
| Modify | `apps/web/src/components/sign-up-form.tsx`         | Form pattern             |
| Modify | `apps/web/src/routes/dashboard/shifts/new.tsx`     | Form pattern + Calendar  |
| Modify | `apps/web/src/routes/dashboard/businesses/new.tsx` | Form pattern             |
| Modify | `apps/web/src/routes/dashboard/shifts/$id.tsx`     | Complete shift detail    |
| Modify | `apps/web/src/routes/dashboard/notifications.tsx`  | Implement notifications  |
| Add    | `packages/ui/src/components/alert.tsx`             | New shadcn component     |
| Add    | `packages/ui/src/components/calendar.tsx`          | New shadcn component     |
| Add    | `packages/ui/src/components/combobox.tsx`          | New shadcn component     |
| Add    | `packages/ui/src/components/popover.tsx`           | New shadcn component     |
| Add    | `packages/ui/src/components/progress.tsx`          | New shadcn component     |
| Add    | `packages/ui/src/components/switch.tsx`            | New shadcn component     |
| Delete | `apps/web/src/routes/demo.tsx`                     | Remove demo              |
| Delete | `apps/web/src/components/phone-frame.tsx`          | Remove redundant         |
| Delete | `apps/web/src/components/manager-panel.tsx`        | Remove redundant         |
| Delete | `apps/web/src/components/loader.tsx`               | Use Skeleton             |
| Delete | `apps/web/src/components/claim-button.tsx`         | Inline                   |
| Delete | `apps/web/src/components/trust-score-badge.tsx`    | Simplify                 |

---

## GSTACK REVIEW REPORT

| Review        | Trigger               | Why                     | Runs | Status      | Findings                     |
| ------------- | --------------------- | ----------------------- | ---- | ----------- | ---------------------------- |
| CEO Review    | `/plan-ceo-review`    | Scope & strategy        | 0    | —           | —                            |
| Codex Review  | `/codex review`       | Independent 2nd opinion | 0    | —           | —                            |
| Eng Review    | `/plan-eng-review`    | Architecture & tests    | 2    | issues_open | 9 issues, 0 critical gaps    |
| Design Review | `/plan-design-review` | UI/UX gaps              | 1    | clean       | Score: 7→9, 6 decisions made |

**VERDICT:** Eng review found 9 issues (resolved down from 8→5 unresolved). Design review passed clean. Run `/plan-eng-review` to address remaining engineering gaps before implementation.

---

## Completion Estimate

| Phase              | Human Time | CC Time   | Compression |
| ------------------ | ---------- | --------- | ----------- |
| Design System      | 2h         | 30min     | 4x          |
| Component Cleanup  | 1h         | 15min     | 4x          |
| Add Components     | 15min      | 5min      | 3x          |
| Dashboard Refactor | 1h         | 20min     | 3x          |
| Form Patterns      | 2h         | 30min     | 4x          |
| Notifications      | 1h         | 20min     | 3x          |
| Shift Detail       | 1h         | 20min     | 3x          |
| Animation Polish   | 30min      | 10min     | 3x          |
| **Total**          | **~8h**    | **~2.5h** | **~3x**     |

---

## Dependencies

- Geist font (Vercel's font, available via `geist` npm package or Google Fonts)
- DM Sans (Google Fonts)
- No new npm packages beyond shadcn components

---

## Next Steps

1. Confirm design direction (typography + colors)
2. Run shadcn component additions
3. Execute cleanup phase
4. Begin implementation phases sequentially

**User decision required**: Approve design system proposal before implementation begins.
