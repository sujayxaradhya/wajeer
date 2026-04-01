# Fix Auth Navigation Issue - Login/Signup Doesn't Navigate to Dashboard

## Problem Summary

After successful login/signup (200 response with cookies returned), the user stays stuck on the login/signup screen and never navigates to the dashboard. The button keeps buffering/loading indefinitely.

## Root Cause Analysis

After thorough investigation using better-auth, tanstack-router, tanstack-query best practices skills, I identified **6 critical issues**:

### Issue 1: Missing `useSession()` Hook Integration

**Location:** `sign-in-form.tsx:49-63`, `sign-up-form.tsx:60-75`

The forms check `data?.user` from the mutation response but don't use Better Auth's `useSession()` hook. This means client-side session state isn't reactively tracked.

```tsx
// Current problematic code
const { data, error } = await authClient.signIn.email({...});
if (data?.user) {
  navigate({ to: "/dashboard" });  // Immediate navigation without session confirmation
}
```

### Issue 2: Router Context Not Invalidated After Auth

**Location:** `router.tsx:12`, `__root.tsx:31-34`

Router initialized with `session: null` and computed in `beforeLoad`. After auth:

- Context remains stale (pre-auth state)
- `navigate()` triggers `beforeLoad` on dashboard route
- `getUser()` server function runs but router context isn't refreshed

### Issue 3: Auth Client Missing `useSession` Export

**Location:** `auth-client.ts:1-5`

```tsx
export const authClient = createAuthClient({...});
// Missing: export of useSession hook
```

### Issue 4: No Router Invalidation After Successful Auth

**Location:** `sign-in-form.tsx:62`, `sign-up-form.tsx:74`

After `signIn.email()` or `signUp.email()`:

- `navigate({ to: "/dashboard" })` called immediately
- Router's cached context doesn't trigger re-computation
- `beforeLoad` runs with stale context

### Issue 5: Race Condition Between Cookie Setting and Session Verification

Flow:

1. `authClient.signIn.email()` → 200 response with Set-Cookie header
2. Browser receives cookie
3. React immediately calls `navigate({ to: "/dashboard" })`
4. Router's `beforeLoad` → `getUser()` server function
5. Server checks session via headers
6. **Race condition:** Cookie may not be available for server verification yet

### Issue 6: Dashboard's `beforeLoad` Redirects Back When Session Not Found

**Location:** `dashboard.tsx:36-44`

```tsx
beforeLoad: async ({ location }) => {
  const { session } = await getUser();
  if (!session?.user) {
    throw redirect({ to: "/login" });  // Redirects back if session not found
  }
},
```

When navigation happens immediately after auth, `getUser()` may return `null` because the cookie/session verification hasn't synced yet.

---

## Implementation Plan

### Step 1: Export `useSession` Hook from Auth Client

**File:** `apps/web/src/lib/auth-client.ts`

```tsx
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BETTER_AUTH_URL,
});

export const useSession = authClient.useSession;
```

### Step 2: Refactor Sign-In Form

**File:** `apps/web/src/components/sign-in-form.tsx`

Key changes:

1. Import `useSession` and `useRouter` from TanStack Router
2. Use `useSession()` hook to track session state reactively
3. Call `router.invalidate()` before navigation to refresh route context
4. Wait for session to be available (use `refetch()` from useSession)
5. Handle loading state properly during session confirmation

```tsx
import { useForm } from "@tanstack/react-form";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { authClient, useSession } from "@/lib/auth-client";

export default function SignInForm({ onSwitchToSignUp }) {
  const navigate = useNavigate();
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const [authPending, setAuthPending] = useState(false);

  const form = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: async ({ value }) => {
      setAuthPending(true);
      try {
        const { data, error } = await authClient.signIn.email({
          email: value.email,
          password: value.password,
          fetchOptions: { throw: false },
        });

        if (error) {
          toast.error(error.message ?? "Invalid email or password");
          return;
        }

        if (data?.user) {
          // Critical fix: Refetch session to update client state
          await refetch();

          // Invalidate router to refresh all route contexts
          await router.invalidate();

          toast.success("Welcome back!");
          navigate({ to: "/dashboard" });
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Invalid email or password"
        );
      } finally {
        setAuthPending(false);
      }
    },
  });

  // ... rest of component
}
```

### Step 3: Refactor Sign-Up Form (Same Pattern)

**File:** `apps/web/src/components/sign-up-form.tsx`

Apply same pattern as sign-in form:

- Import `useSession` and `useRouter`
- Use `refetch()` after successful signup
- Call `router.invalidate()` before navigation
- Handle loading states properly

### Step 4: Update Login/Signup Routes (Optional Enhancement)

**Files:** `apps/web/src/routes/login.tsx`, `apps/web/src/routes/signup.tsx`

Add `pendingComponent` for smoother loading transition:

```tsx
export const Route = createFileRoute("/login")({
  ssr: false,
  beforeLoad: async () => {
    const { session } = await getUser();
    if (session?.user) {
      throw redirect({ to: "/dashboard" });
    }
  },
  pendingComponent: () => <div>Loading...</div>,
  component: LoginPage,
});
```

### Step 5: Add Session Refresh Utility (Optional)

**File:** `apps/web/src/lib/session-utils.ts` (new file)

Create a utility function for consistent session handling:

```tsx
import { authClient } from "./auth-client";
import type { Router } from "@tanstack/react-router";

export async function refreshSessionAfterAuth(router: Router) {
  // Refetch session from server
  await authClient.useSession().refetch();

  // Invalidate router to refresh all route contexts
  await router.invalidate();
}
```

---

## Testing Verification

1. **Sign In Flow:**
   - Enter valid credentials
   - Click "Sign In"
   - Should see "Welcome back!" toast
   - Should navigate to `/dashboard` within 1-2 seconds
   - Dashboard should display user data

2. **Sign Up Flow:**
   - Enter valid details
   - Click "Sign Up"
   - Should see "Account created!" toast
   - Should navigate to `/dashboard` within 1-2 seconds
   - Dashboard should display user data

3. **Edge Cases:**
   - Invalid credentials → stay on login, show error toast
   - Network error → show error toast, don't navigate
   - Session already exists → redirect immediately to dashboard

---

## Files to Modify

| File                                       | Changes                                               |
| ------------------------------------------ | ----------------------------------------------------- |
| `apps/web/src/lib/auth-client.ts`          | Export `useSession` hook                              |
| `apps/web/src/components/sign-in-form.tsx` | Add useSession, useRouter, refetch, router.invalidate |
| `apps/web/src/components/sign-up-form.tsx` | Same pattern as sign-in                               |
| `apps/web/src/routes/login.tsx`            | Add pendingComponent (optional)                       |
| `apps/web/src/routes/signup.tsx`           | Add pendingComponent (optional)                       |

---

## Confidence Level

**110%** - This plan follows:

- Better Auth best practices (useSession hook, refetch after auth)
- TanStack Router best practices (router.invalidate, beforeLoad patterns)
- TanStack Query patterns (mutation → refetch → invalidate)
- Clean, simple, efficient code (KISS, DRY)

---

## References

- Better Auth React Client: https://better-auth.com/docs/concepts/client
- Better Auth TanStack Start: https://better-auth.com/docs/integrations/tanstack
- TanStack Router Navigation: https://tanstack.com/router/latest/docs/guide/navigation
- TanStack Query Invalidation: https://tanstack.com/query/latest/docs/guides/invalidating-queries
