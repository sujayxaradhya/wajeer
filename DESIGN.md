# Design System — Wajeer

## Product Context

- **What this is:** A marketplace where hourly workers pick up extra shifts and businesses fill last-minute staffing gaps
- **Who it's for:** Restaurant/retail managers (posting shifts) and hourly workers (claiming shifts)
- **Space/industry:** Workforce management / gig economy
- **Project type:** Web app with dashboard

## Aesthetic Direction

- **Direction:** Industrial/Utilitarian meets Playful — function-first for data-dense shift management, warm and approachable for workers
- **Decoration level:** Intentional — subtle texture, meaningful motion, no gratuitous decoration
- **Mood:** Professional but empowering. Serious about reliability, warm about people.
- **Reference sites:** When I Work, Deputy, Homebase, ShiftMed

## Typography

- **Primary/Body/UI:** Geist — clean, modern, excellent readability across all sizes
- **Data/Tables:** Geist with tabular-nums — clean numbers, good legibility
- **Code:** JetBrains Mono
- **Logo:** EPBoxiBold — custom font exclusively for "WAJEER" logo text
- **Loading:** Self-hosted Geist + Bunny Fonts fallback
- **Scale:**
  - xs: 0.75rem (12px) — captions, timestamps
  - sm: 0.875rem (14px) — body text, labels
  - base: 1rem (16px) — default body
  - lg: 1.125rem (18px) — lead text, card titles
  - xl: 1.25rem (20px) — section headings
  - 2xl: 1.5rem (24px) — page headings
  - 3xl: 1.875rem (30px) — hero subtitles
  - 4xl: 2.25rem (36px) — hero headings

## Color

- **Approach:** Balanced — primary green for trust/action, warm amber for urgency/shifts
- **Primary:** oklch(0.52 0.16 150) — teal-green, professional and trustworthy
- **Secondary:** oklch(0.96 0.01 260) — near-white for subtle backgrounds
- **Accent:** oklch(0.65 0.18 45) — warm amber for shifts, urgency, time-sensitive actions
- **Neutrals:** Cool grays with slight blue undertone (oklch 0.96 to 0.15 at hue 260)
- **Semantic:**
  - Success: oklch(0.55 0.18 145) — approved shifts, completed actions
  - Warning: oklch(0.7 0.15 45) — pending claims, upcoming shifts
  - Error: oklch(0.55 0.22 25) — cancelled, rejected
  - Info: oklch(0.6 0.18 240) — available shifts, notifications
- **Dark mode:** Redesign surfaces with 10-15% reduced saturation, maintain contrast ratios

## Spacing

- **Base unit:** 4px
- **Density:** Comfortable — data-dense but not cramped
- **Scale:** 2xs(2px) xs(4px) sm(8px) md(16px) lg(24px) xl(32px) 2xl(48px) 3xl(64px) 4xl(80px)

## Layout

- **Approach:** Hybrid — grid-disciplined for dashboard data, creative-editorial for landing page
- **Grid:** 12-col desktop, 4-col tablet, 1-col mobile
- **Max content width:** 1280px for dashboard, 1440px for landing
- **Border radius:** Hierarchical — sm(4px) inputs, md(8px) cards, lg(12px) sheets, xl(16px) dialogs, full(9999px) pills/badges

## Motion

- **Approach:** Intentional — meaningful transitions, playful on landing
- **Easing:**
  - Enter: cubic-bezier(0.23, 1, 0.32, 1) — ease-out, responsive
  - Exit: cubic-bezier(0.23, 1, 0.32, 1) — ease-out, faster
  - Move: cubic-bezier(0.77, 0, 0.175, 1) — ease-in-out, natural
- **Duration:**
  - Micro: 50-100ms — press feedback, tooltips
  - Short: 150-250ms — UI transitions, dropdowns
  - Medium: 250-400ms — page transitions, modals
  - Long: 400-700ms — marketing animations

## Decisions Log

| Date       | Decision                            | Rationale                                                                 |
| ---------- | ----------------------------------- | ------------------------------------------------------------------------- |
| 2026-04-01 | Initial design system created       | Created by /design-consultation based on workforce management marketplace |
| 2026-04-01 | Primary color shifted to teal-green | More professional than pure green, maintains trust signal                 |
| 2026-04-01 | Added amber accent color            | Shifts are time-sensitive, amber conveys urgency without alarm            |
| 2026-04-01 | Geist as primary font               | Clean, modern, single-font system                                         |
| 2026-04-01 | EPBoxiBold for logo only            | Custom font exclusively for "WAJEER" logo                                 |
