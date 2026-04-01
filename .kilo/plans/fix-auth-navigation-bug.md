# Fix: Auth Navigation Bug — Stuck on Login/Signup After Successful Auth

## Problem

After successful login or signup (network returns 200 with cookies set), the UI stays stuck on the login/signup screen with a buffering spinner. The user never navigates to the dashboard.

## Root Cause

In `apps/web/src/functions/get-user.ts`, the `getUser` server function incorrectly accesses request headers via `request.headers` from the handler argument:

```typescript
// ❌ Current (broken)
export const getUser = createServerFn({ method: "GET" }).handler(
  async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    return { session: session ?? null };
  }
);
```

In TanStack Start's `createServerFn`, the `request` parameter is an internal server function request object that does NOT properly contain the browser's cookies. The correct approach per the official better-auth TanStack Start integration docs is to use `getRequestHeaders()` from `@tanstack/react-start/server`:

```typescript
// ✅ Correct
import { getRequestHeaders } from "@tanstack/react-start/server";

export const getUser = createServerFn({ method: "GET" }).handler(async () => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  return { session: session ?? null };
});
```

## Why This Causes the Bug

1. User submits login/signup form → `authClient.signIn.email()` returns 200, browser gets auth cookie
2. Form calls `navigate({ to: "/dashboard" })`
3. Dashboard route's `beforeLoad` calls `getUser()` server function
4. `getUser()` calls `auth.api.getSession({ headers: request.headers })` — but `request.headers` doesn't include the browser's cookies
5. Session check returns `null` → dashboard redirects back to `/login`
6. User sees login page with spinner still showing (the form's `authPending` state was never reset because the component was unmounted during navigation)

## Fix

### File 1: `apps/web/src/functions/get-user.ts`

Replace `request.headers` with `getRequestHeaders()`:

```typescript
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "@wajeer/auth";

export const getUser = createServerFn({ method: "GET" }).handler(async () => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  return { session: session ?? null };
});
```

### File 2: `apps/web/src/middleware/auth.ts`

Apply the same fix for consistency (middleware is defined but not currently used in routes, but should be fixed for future use):

```typescript
import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "@wajeer/auth";

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  return next({
    context: { session },
  });
});

export const requireAuth = createMiddleware().server(async ({ next }) => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });

  if (!session?.user?.id) {
    throw new Error("Unauthorized: No valid session");
  }

  return next({
    context: { session },
  });
});
```

## Verification

1. Run `bun run check-types` to ensure no type errors
2. Run `bun x ultracite check` to verify lint passes
3. Manual test: login/signup → should navigate to dashboard without getting stuck
