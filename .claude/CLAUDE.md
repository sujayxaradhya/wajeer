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

# Ultracite Code Standards

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `bun x ultracite fix`
- **Check for issues**: `bun x ultracite check`
- **Diagnose setup**: `bun x ultracite doctor`

Oxlint + Oxfmt (the underlying engine) provides robust linting and formatting. Most issues are automatically fixable.

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

### Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

### Framework-Specific Guidance

**Next.js:**

- Use Next.js `<Image>` component for images
- Use `next/head` or App Router metadata API for head elements
- Use Server Components for async data fetching instead of async Client Components

**React 19+:**

- Use ref as a prop instead of `React.forwardRef`

**Solid/Svelte/Vue/Qwik:**

- Use `class` and `for` attributes (not `className` or `htmlFor`)

---

## Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

## When Oxlint + Oxfmt Can't Help

Oxlint + Oxfmt's linter will catch most issues automatically. Focus your attention on:

1. **Business logic correctness** - Oxlint + Oxfmt can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations
6. **Documentation** - Add comments for complex logic, but prefer self-documenting code

---

Most formatting and common issues are automatically fixed by Oxlint + Oxfmt. Run `bun x ultracite fix` before committing to ensure compliance.

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

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
