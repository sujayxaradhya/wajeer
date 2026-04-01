# Plan: Saturday Evening — Wajeer Demo Polish

**Branch:** main  
**Timeline:** 3 hours  
**Goal:** Complete the visual polish layer that makes the demo feel like a real product.

---

## Current State (Saturday Afternoon Complete)

- ✅ WorkerCard component with countdown timer + GSAP buzz/gray-out/badge pulse
- ✅ ManagerPanel with shift slide-in + winner flip + approve button
- ✅ SSE endpoints: `/api/shifts/stream`, `/api/shifts/claim`, `/api/shifts/approve`, `/api/shifts/post`, `/api/shifts/reset`
- ✅ Zustand store with `ShiftStore` + SSE integration in `demo.tsx`
- ✅ Demo route with `?role=`, `?view=split`, `?demo=` params

---

## Saturday Evening Tasks (3h)

### Task 1: Trust Score Badge Polish (30 min)

**What:** Add colored borders per worker + animated ring on buzz.

**Why:** The design doc says: "Trust score badges animate on notification — visual 'YOUR staff' signal." Currently just an amber badge. Needs differentiation.

**Approach:**

1. **Per-worker color coding:** Use worker ID to deterministically assign accent colors:
   - Maria (w1) → emerald
   - James (w2) → blue
   - Sofia (w3) → purple

2. **Animated ring on buzz:** When `claimStatus === 'racing'`, add a pulsing ring around the badge:
   - Use GSAP `fromTo` + `repeat: -1` for continuous pulse
   - Ring color matches worker's accent
   - Clear the animation when claim ends

3. **Badge border:** Thin border in worker's accent color, always visible.

**Files to modify:**

- `apps/web/src/components/worker-card.tsx` — add color mapping + ring animation

**GSAP pattern (from Emil skill):**

```tsx
// Pulsing ring — starts fast, feels responsive
useGSAP(
  () => {
    if (claimStatus !== "racing") return;
    gsap.to(ringRef.current, {
      scale: 1.3,
      opacity: 0,
      duration: 0.8,
      repeat: -1,
      ease: "power1.out",
    });
  },
  { dependencies: [claimStatus], scope: containerRef }
);
```

**Effort:** Low (one component, well-defined scope)

---

### Task 2: Shadcn Toasts for SSE Events (30 min)

**What:** Add toast notifications for shift events:

- `shift:posted` → "New shift available!"
- `shift:claimed` → "Maria claimed the shift"
- `shift:approved` → "You're confirmed for Saturday 6pm"

**Why:** Real-time feedback is the core UX. Toasts confirm the system is alive and responding.

**Approach:**

1. **Add shadcn sonner:** Project already has `sonner` in catalog. Add the `<Toaster />` to root layout.

2. **Wire to SSE events:** In `useShiftSSE()` hook, call `toast()` for each event type:
   - `shift:posted` → `toast.info("New shift available!")`
   - `shift:claimed` → `toast.success(`${winner.name} claimed the shift`)`
   - `shift:approved` → `toast.success("You're confirmed for Saturday 6pm")`

3. **Position:** Bottom-right for manager view, top-center for worker view.

**Files to modify:**

- `apps/web/src/routes/__root.tsx` — add `<Toaster position="bottom-right" />`
- `apps/web/src/routes/demo.tsx` — add `toast()` calls in SSE handler

**Import:** `import { toast } from "sonner"`

**Effort:** Low (dependency already available, wiring is straightforward)

---

### Task 3: Mobile Phone Chrome CSS Wrapper (45 min)

**What:** Worker cards look like phone screens (aspect ~390×844, rounded corners, notch strip).

**Why:** The design doc says: "Use CSS aspect ratio + border-radius to simulate phone chrome." Makes the demo feel like real mobile notifications.

**Approach:**

1. **Create PhoneFrame component:**

   ```
   apps/web/src/components/phone-frame.tsx
   ```

   - Fixed aspect ratio: `aspect-[9/19.5]` (iPhone-style)
   - Rounded corners: `rounded-[3rem]`
   - Dark border: `border-4 border-zinc-800`
   - Top notch: `h-8 bg-black rounded-b-2xl` strip

2. **Wrap WorkerCard:**

   ```tsx
   <PhoneFrame>
     <WorkerCard worker={worker} />
   </PhoneFrame>
   ```

3. **Layout in split view:**
   - Stack 3 phones vertically on the right panel
   - `gap-4` between phones
   - Phones scale to fit viewport height

**Design aesthetic (from frontend-design skill):**

- Dark theme (matches existing demo)
- Subtle inner shadow on screen bezel
- Optional: tiny status bar icons (time, battery, signal) for realism

**Files to create/modify:**

- `apps/web/src/components/phone-frame.tsx` — new component
- `apps/web/src/routes/demo.tsx` — wrap WorkerColumn in PhoneFrames

**Effort:** Medium (new component, but well-defined scope)

---

### Task 4: Anime.js Page Transitions (45 min)

**What:** Smooth transitions between manager/worker views using Anime.js `createScope` + cleanup.

**Why:** The design doc specifies: "Anime.js: page transition when switching between manager/worker route views." Makes navigation feel polished, not jarring.

**Approach:**

1. **Create transition hook:**

   ```
   apps/web/src/hooks/use-page-transition.ts
   ```

   - Uses `anime.createScope()` for cleanup
   - `scope.current.revert()` on unmount
   - Fade out current view → fade in new view

2. **Apply to demo route:**
   - When `role` param changes, trigger transition
   - Content slides from right (entering) or left (exiting)
   - Duration: 250-300ms (per Emil: "UI animations should stay under 300ms")

3. **Easing:** `easeOutQuart` for responsive feel (from Emil skill: "ease-out gives instant feedback")

**Anime.js pattern:**

```tsx
import { createScope, animate } from "animejs";

const scope = createScope({ root: containerRef });
scope.add(() => {
  animate(".panel", {
    opacity: [0, 1],
    translateX: [20, 0],
    duration: 250,
    ease: "outQuart",
  });
});
// Cleanup: scope.revert() in useEffect return
```

**Files to create/modify:**

- `apps/web/src/hooks/use-page-transition.ts` — new hook
- `apps/web/src/routes/demo.tsx` — apply transition wrapper

**Effort:** Medium (new hook, but Anime.js pattern is documented)

---

## NOT in Scope

- `?demo=true` autopilot — Sunday task
- `?view=split` layout refinements — Sunday task
- Railway deployment — Sunday task
- Real authentication — out of scope for hackathon
- Database persistence — out of scope (in-memory is fine)

---

## Architecture Notes

### State Management

Zustand store is the single source of truth. SSE events update the store, and components react via `useShiftStore()`. The store handles:

- `claimStatus: 'idle' | 'racing' | 'claimed'`
- `winner: Worker | null`
- `isApproved: boolean`

**Idempotency (Reviewer Concern #5):** Store guards against double-firing:

```ts
handleClaimed: (winnerId) => {
  if (get().claimStatus === "claimed") return; // Guard
  // ... update state
};
```

### Animation Patterns

- **GSAP** for micro-interactions (buzz, pulse, shake) — already in use
- **Anime.js** for page transitions — to be added
- **CSS transitions** for hover/active states (per Emil: "interruptible, no keyframes")

### Color Palette

Follow existing demo aesthetic:

- Background: dark (`bg-zinc-900`, `bg-white/5`)
- Accent: amber for trust badges, emerald for success states
- Worker differentiation: emerald/blue/purple per worker

---

## File Changes Summary

| File                           | Change                                 | Task    |
| ------------------------------ | -------------------------------------- | ------- |
| `components/worker-card.tsx`   | Add per-worker colors + ring animation | 1       |
| `components/phone-frame.tsx`   | **NEW** — phone chrome wrapper         | 3       |
| `hooks/use-page-transition.ts` | **NEW** — Anime.js transition hook     | 4       |
| `routes/__root.tsx`            | Add `<Toaster />`                      | 2       |
| `routes/demo.tsx`              | Toasts + PhoneFrame wrap + transitions | 2, 3, 4 |

---

## Execution Order

1. **Task 1** (30 min) — Trust score badges
2. **Task 2** (30 min) — Shadcn toasts
3. **Task 3** (45 min) — Phone chrome
4. **Task 4** (45 min) — Page transitions

**Total:** ~2.5-3 hours

---

## Dependencies

- `sonner` — already in catalog ✅
- `animejs` — already installed (v4.3.6) ✅
- `gsap` — already installed (v3.14.2) ✅
- `@gsap/react` — already installed (v2.1.2) ✅

No new dependencies needed.

---

## Testing

After each task:

1. Run `bun run dev:web`
2. Open `/demo?view=split`
3. Click "Post Shift" in manager panel
4. Verify animations + toasts fire correctly
5. Run `bun run check-types` before committing

---

## Reviewer Concerns from Design Doc

All addressed in Saturday afternoon implementation:

- ✅ `shift:approved` endpoint exists
- ✅ `shift:reset` client handling in Zustand
- ✅ Split-screen routing as components (not outlets)
- ✅ `'idle' → 'racing'` transition at T+2
- ✅ Store idempotency guard

No new concerns for Saturday evening tasks.
