# AGENTS.md

# gstack

Use the `/browse` skill from gstack for all web browsing. Never use `mcp__claude-in-chrome__*` tools.

Available gstack skills:
`/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/design-consultation`, `/design-shotgun`, `/review`, `/ship`, `/land-and-deploy`, `/canary`, `/benchmark`, `/browse`, `/connect-chrome`, `/qa`, `/qa-only`, `/design-review`, `/setup-browser-cookies`, `/setup-deploy`, `/retro`, `/investigate`, `/document-release`, `/codex`, `/cso`, `/autoplan`, `/careful`, `/freeze`, `/guard`, `/unfreeze`, `/gstack-upgrade`

<!-- vibe-rules Integration -->

<!-- OPENSPEC:START -->

# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:

- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:

- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

**Strictly Mentioning: Do Not Delete Any Directory & File Without Any Permit by USER.**

## Project Overview

**Wajeer** is a Bun monorepo with a TanStack Start frontend and modular packages. It uses better-auth for authentication, Zustand for state, Tailwind CSS v4 for styling, and shadcn/ui (base-ui variant) for components.

```
wajeer/
├── apps/web/          # TanStack Start frontend (Vite + React)
├── packages/
│   ├── auth/          # @wajeer/auth — better-auth server setup
│   ├── config/        # @wajeer/config — shared tsconfig
│   ├── env/           # @wajeer/env — env validation with @t3-oss/env-core
│   └── ui/            # @wajeer/ui — shadcn/ui component library
└── package.json       # root workspace config
```

## Build / Lint / Test Commands

Run from the **repo root** unless otherwise noted.

| Task                   | Command                                           |
| ---------------------- | ------------------------------------------------- |
| Install deps           | `bun install`                                     |
| Dev (all workspaces)   | `bun run dev`                                     |
| Dev (web only)         | `bun run dev:web`                                 |
| Build (all workspaces) | `bun run build`                                   |
| Type-check all         | `bun run check-types`                             |
| Lint check             | `bun run check` (alias: `bun x ultracite check`)  |
| Lint + format fix      | `bun run fix` (alias: `bun x ultracite fix`)      |
| Diagnose ultracite     | `bun x ultracite doctor`                          |
| Add shadcn component   | `bun x shadcn@latest add <component> -c apps/web` |

No test framework is configured yet. Testing libraries (`@testing-library/react`, `jsdom`) are installed in `apps/web` but no test files exist. When tests are added, use Vitest (already the Vite test runner) — run a single test with `bun x vitest run path/to/file.test.ts`.

### Web Full Stack (This project repository)

- **React**: Core library for building the user interface.
- **TypeScript**: Primary language for type safety and code maintainability.
- **Tailwind CSS**: Use Tailwind CSS v4, Utility-first CSS framework for styling.
- **Shadcn UI**: shadcn/ui hands you the actual component code. You have full control to customize and extend the components to your needs. This means full transparency and easy customization.
- **React Bits**: React Bits is an open-source collection of carefully designed UI components that aim to enhance your React web applications. Animations are made using GSAP.
- **GSAP React**: A completely framework agnostic library for animating React components with `@gsap/react` by using the `useGSAP` hook. `useGSAP()` is a drop-in replacement for `useEffect()` or `useLayoutEffect()` that automatically handles cleanup using `gsap.context()`. Cleanup is important in React and Context makes it simple. In the project, we will use GSAP for 80% of the animations like microinteractions, loading states, etc.
- **Anime.js**: The lightweight JavaScript animation library with a simple, yet powerful API. Anime.js can be used with React by combining React's `useEffect()` and Anime.js `createScope()` methods. In the project, we will use Anime.js for 20% of the animations like page transitions, request animation frames, etc.
- **Tanstack Start**: Full-document SSR, Streaming, Server Functions, bundling and more, powered by TanStack Router and Vite
- **TanStack Router**: It provides Type-safe frontend routing and other functionalities.
- **TanStack React Query**: Data fetching, caching, and state management.
- **NUQS**: Type-safe search params state manager for React.
- **Zustand**: Type-safe client-side state manager.
- **Typesense**: Typesense is a fast, open-source, and easy-to-use search engine for building real-time search experiences. It is used for searching the parking spaces and other relevant information.
- **TanStack Form**: Headless and performant Type Safe Form for React.
- **Zod**: Zod is a TypeScript-first schema declaration and validation library. It allows developers to define data structures (schemas) and validate data against those schemas, ensuring type safety and data integrity.
- **React Testing Library**: Write test using testing standards listed below.
- **Vitest**: Vitest (pronounced as "veetest") is a next generation testing framework powered by Vite.
- **React Scan**: React Scan automatically detects performance issues in your React app. Use only in development mode.
- **Vite**: Build tool and development server.
- **Package Manager**: **bun**, so use that only.

## Code Style and Structure

- Write concise, technical TypeScript code.
- Use functional and declarative programming patterns; avoid classes.
- Prefer iteration and modularization over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., isLoaded, hasError).
- Use lowercase with dashes for directories (e.g., components/auth-wizard).
- Favor named exports for components.
- Use the Receive an Object, Return an Object (RORO) pattern.

### Export Conventions

- Favor named exports for components and utilities
- Use default exports only for page components and main entry points
- Group related exports in index files for cleaner imports

## TypeScript Usage

- Use TypeScript for all code; prefer interface whenever possible and prefer types only when needed.
- Avoid enums; use objects or maps instead.
- Avoid using `any` or `unknown` unless absolutely necessary. Look for type definitions in the codebase instead.
- Avoid type assertions with `as` or `!`.
- For single-line statements in conditionals, omit curly braces.

## Syntax and Formatting

- Use the "function" keyword for pure functions.
- Use declarative JSX, keeping JSX minimal and readable.

## UI and Styling

- Use Tailwind for utility-based styling
- Use a mobile-first approach

## Error Handling and Validation

- Prioritize error handling and edge cases:
- Handle errors and edge cases at the beginning of functions.
- Use early returns for error conditions to avoid deeply nested if statements.
- Place the happy path last in the function for improved readability.
- Avoid unnecessary else statements; use if-return pattern instead.
- Use guard clauses to handle preconditions and invalid states early.
- Implement proper error logging and user-friendly error messages.
- Consider using custom error types or error factories for consistent error handling.

## React Best Practices

- Use functional components and TypeScript interfaces.
- Use declarative JSX.
- Use arrow functions when creating new components.
- Create reusable components in their respective files.
- Use Shadcn UI, Base UI, and Tailwind CSS with Aria for components and styling.
- Use Pathless Route Group Directories along with foundational all Routing concepts excluding "Non-Nested Routes". Use File Naming Conventions which should adhere to File Based Routing Concepts of TanStack Router.
- Implement responsive design with Tailwind CSS.
- Use mobile-first approach for responsive design.
- Use Hybrid approach Server-Side-Rendering and Client-Side-Rendering with React and Vite.
- Place static content and interfaces at file end.
- Use content variables for static content outside render functions.
- Use Zod for validation and form validation (preferred for Drivay project).
- Wrap client components in Suspense with fallback.
- Use dynamic loading for non-critical components.
- Optimize images: WebP format, size data, lazy loading.
- Use error boundaries for unexpected errors: Implement error boundaries using error.tsx and global-error.tsx files to handle unexpected errors and provide a fallback UI.
- Use TanStack Form for form building.
- Code in services/ dir always throw user-friendly errors that TanStack React Query can catch and show to the user.
- Partial Prerendering (PPR): Pre-render static layout shells while streaming dynamic content.
- Streaming SSR: Send HTML chunks progressively using React 19's Suspense boundaries.

## Key Conventions

1. Prioritize Web Vitals (LCP, CLS, FID).
2. - Use hybrid approach with SSR (Server Side Rendering) and CSR (Client Side Rendering). Refer to the below SSR with CSR Hybrid Approach .

## SSR and CSR Hybrid

### Server-Side Rendering (SSR) only when and where it is really needed

- SEO-critical pages: Use for content requiring search engine visibility (e.g., blog posts, product listings) since SSR delivers fully rendered HTML.
- First Contentful Paint (FCP): Ideal for slow networks/devices to show content faster through pre-rendered HTML.
- Authentication gates: Pages requiring server-side auth checks before rendering.
- Static-heavy pages: Combine with Incremental Static Regeneration (ISR) for content that changes infrequently.

### Client-Side Rendering (CSR)

- Highly interactive UIs: Use for dashboards, real-time feeds, or chat interfaces needing frequent updates.
- Post-authentication pages: After initial SSR load, switch to CSR for logged-in experiences (e.g., social media feeds).
- Dynamic content: Elements requiring client-side logic (e.g., animations, real-time data polling).

## Performance Optimization

- Memoization: Use `React.memo`/`useMemo` to prevent unnecessary re-renders.
- Code Splitting: Leverage dynamic `import()` for route-based chunking.
- Concurrent Features: Adopt `useTransition`/`useDeferredValue` for non-blocking UI updates.
- Server Components: Keep data-fetching/DB logic server-side; pair with client components for interactivity.
- Hydration Efficiency: Avoid client/server markup mismatches (e.g., `Math.random()` in SSR)
- Optimize bundle size through proper import strategies
- Use proper image optimization techniques
- Implement code splitting at route level and for larger components
- Optimize images with next-gen formats (WebP)
- Implement lazy loading for images and off-screen content
- Use windowing/virtualization with react-window library for large lists and large datasets
- Minimize JS bundle size through tree-shaking
- Implement proper caching strategies with React Query
- Apply memoization to components and functions with React.memo and useMemo
- Use throttling/debouncing for expensive event handlers (scroll, resize, input)
- Utilize React Fragments to reduce DOM nodes and prevent unnecessary wrappers
- Offload CPU-intensive tasks with Web Workers
- Utilize the useTransition hook to avoid blocking UI during intensive updates

## TanStack React Query with TanStack Router Integration Patterns

### 1. TanStack Router as a 'State Store'

Use router loaders to pre-fetch data and provide it directly to components via `Route.useLoaderData()`.

```tsx
export const Route = createFileRoute("/posts/$id")({
  loader: ({ params }) => fetchPost(params.id),
  component: () => {
    const post = Route.useLoaderData();
    return <Post post={post} />;
  },
  pendingComponent: <Skeleton />,
  errorComponent: <ErrorCard />,
});
```

### 2. TanStack Router as a 'URL Decoder'

Use router for URL parameter extraction while React Query handles data fetching independently.

```tsx
const usePost = (id) =>
  useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchPost(id),
  });

export const Route = createFileRoute("/posts/$id")({
  component: () => {
    const { id } = Route.useParams();
    const { data: post, isPending, isError } = usePost(id);
    if (isPending) return <Skeleton />;
    if (isError) return <ErrorCard />;
    return <Post post={post} />;
  },
});
```

### 3. TanStack Router as a 'State Orchestrator'

Combine router loaders with React Query for optimal data loading and caching with `queryOptions` and `useSuspenseQuery`.

```tsx
const postQueryOptions = (postId: string) =>
  queryOptions({
    queryKey: ["post", postId],
    queryFn: () => fetchPost(postId),
  });

export const Route = createFileRoute("/posts/$id")({
  loader: ({ params }) =>
    queryClient.ensureQueryData(postQueryOptions(params.id)),
  component: () => {
    const { id } = Route.useParams();
    const { data: post } = useSuspenseQuery(postQueryOptions(id));
    return <Post post={post} />;
  },
});
```

## Emerging Patterns

- Islands Architecture: Isolate interactive components within static pages.
- React Server Actions: Handle form submissions directly from server components.

## Code Style & Formatting

**Enforced automatically by Ultracite (oxlint + oxfmt).** Always run `bun run fix` before committing.

### Formatting Rules

- **Quotes:** Double quotes (`"`)
- **Semicolons:** Always
- **Trailing commas:** ES5 style (after last item in multi-line)
- **Indentation:** 2 spaces, no tabs
- **Line width:** 80 characters max
- **Arrow parens:** Always wrap parameters (`(x) => x`)
- **Bracket spacing:** Yes (`{ foo }` not `{foo}`)
- **End of line:** LF only
- **JSX quotes:** Double quotes

### Imports

- **Sorting:** Imports are auto-sorted ascending alphabetically with blank lines between groups
- **Style:** Use `verbatimModuleSyntax` — always use `import type { ... }` for type-only imports
- **Path aliases:** `@/` resolves to `apps/web/src/`, `@wajeer/*` resolves to workspace packages
- **No barrel files:** Import directly from source files, avoid `index.ts` re-exports

```ts
// ✅ Correct — type-only import uses `import type`
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@wajeer/ui/components/button";
import type { Shift } from "../lib/types";

// ❌ Wrong — mixing value and type imports without separation
import { createFileRoute, type Shift } from "@tanstack/react-router";
```

### Types

- Prefer `type` keyword over `interface` (enforced by `consistent-type-definitions: type`)
- Use `unknown` over `any` when type is genuinely unknown
- Use `as const` for immutable literal values
- Leverage type narrowing instead of type assertions
- Never use `any` — if you must, use `unknown` with a type guard

### Naming Conventions

- **Files:** kebab-case (`shift-store.ts`, `sign-in-form.tsx`) or PascalCase for components
- **Components:** PascalCase (`RootDocument`, `HomeComponent`)
- **Functions/variables:** camelCase
- **Types:** PascalCase (`ShiftStore`, `ClaimStatus`)
- **Constants:** UPPER_SNAKE_CASE only for true module-level constants

### Functions & Variables

- Use `const` by default; `let` only when reassignment is needed; never `var`
- Use arrow functions for callbacks and short functions; named function declarations for exported components
- Use destructuring for object/array assignments
- Use optional chaining (`?.`) and nullish coalescing (`??`)

### React

- Function components only — no class components
- Hooks at top level only, never conditionally
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility
- TanStack Router `Route` exports follow the pattern: `export const Route = createFileRoute("/path")({ component: ComponentName })`

### Error Handling

- Remove `console.log`, `debugger`, `alert` from production code
- Throw `Error` objects with descriptive messages, not strings
- Use early returns over nested conditionals
- Use `try-catch` meaningfully — don't catch just to rethrow

## Architecture Patterns

### TanStack Start (apps/web)

- Routes live in `apps/web/src/routes/` using file-based routing
- Server functions use `createServerFn` with middleware chaining
- Auth middleware: `apps/web/src/middleware/auth.ts`
- Route component naming: use `RouteComponent` or descriptive `PascalCaseComponent`

### State Management (Zustand)

- Stores in `apps/web/src/stores/`
- Pattern: separate `State` and `Actions` types, combine into `Store` type
- Use `create<StoreType>((set, get) => ({ ... }))` pattern

### UI Components (@wajeer/ui)

- Built on shadcn/ui with base-ui primitives and class-variance-authority (cva)
- Use `cn()` utility from `@wajeer/ui/lib/utils` for className merging
- Component variants defined via `cva()` — see `packages/ui/src/components/button.tsx`

### Environment Variables (@wajeer/env)

- Validated with `@t3-oss/env-core` + Zod schemas
- Server env: `@wajeer/env/server`
- Client env: `@wajeer/env/web`
- Never access `process.env` directly — always go through the validated `env` object

## TypeScript Configuration

- `strict: true` with `strictNullChecks: true`
- `noUncheckedIndexedAccess: true` — always check indexed access results
- `noUnusedLocals: true`, `noUnusedParameters: true` — remove dead code
- `verbatimModuleSyntax: true` — `import type` required for type-only imports
- Target: ESNext, Module: ESNext, Resolution: bundler

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill tool as your FIRST action. Do NOT answer directly, do NOT use other tools first. The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
