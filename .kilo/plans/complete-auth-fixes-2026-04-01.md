# Complete Auth Fixes - Implementation Plan

**Date:** 2026-04-01  
**Continuing from:** session_2026-04-01_auth_fixes.md

## Context

Two bugs were fixed in the previous session:

1. ✅ Login 500 — surreal-adapter.ts RecordId normalization
2. ✅ auth-client.ts window.location.origin SSR crash

Three tasks remain incomplete.

---

## TASK 1: Fix remaining Kysely `$1` param errors (9 files)

**Root cause:** `kysely-surrealdb` HTTP dialect generates `LET $1 = "user:abc"` for parameterized queries. SurrealDB requires variable names to start with a letter (`$userId` valid, `$1` invalid).

**Fix:** Replace all `getKysely()` usage with `getSurreal()` + raw SurrealQL + named parameters.

**Reference pattern** (from dashboard.ts):

```ts
import { getSurreal, normalizeRecord } from "@wajeer/db";

const db = await getSurreal();
const [rows] = await db.query<[T[]]>(
  `SELECT * FROM table WHERE field = type::thing($userId)`,
  { userId }
);
return normalizeRecord<T[]>(rows);
```

### 1.1 apps/web/src/functions/shifts.ts

**postShift** (POST, requires auth):

- Replace Kysely insert with SurrealQL CREATE
- Use `type::thing($location_id)` and `type::thing($posted_by)` for record IDs
- Return the created shift

**claimShift** (POST, requires auth):

- Multi-statement batch:
  1. SELECT shift WHERE id = type::thing($shift_id) AND status = "open"
  2. CREATE claim with shift_id, worker_id, status = "pending"
  3. UPDATE shift SET status = "claimed"
- Check shift exists before creating claim

**approveClaim** (POST, requires auth):

- Multi-statement batch:
  1. SELECT claim with authorization check (user must be owner/manager via user_business join)
  2. UPDATE claim SET status = "approved"
  3. UPDATE shift SET status = "approved"
  4. UPDATE user_business SET trust_score += 0.1

### 1.2 apps/web/src/functions/claims.ts

**getClaimsForShift** (GET, requires auth):

- SELECT claims with correlated subqueries for worker_name, worker_trust_score
- Authorization: user must be business owner or manager
- Use $parent for correlated subqueries

**getMyClaims** (GET, requires auth):

- SELECT claim WHERE worker_id = type::thing($userId)
- Correlated subqueries for shift_title, shift_date, location_name
- ORDER BY claimed_at DESC

**rejectClaim** (POST, requires auth):

- Similar to approveClaim but:
  - UPDATE claim SET status = "rejected"
  - UPDATE shift SET status = "open" (re-open the shift)

### 1.3 apps/web/src/functions/business.ts

**createBusiness** (POST, requires auth):

- CREATE business with owner_id
- CREATE user_business with role = "owner", trust_score = 4.5, reliability = 0.95
- Return the created business

**getMyBusinesses** (GET, requires auth):

- SELECT business WHERE id IN (SELECT business_id FROM user_business WHERE user_id = type::thing($userId))

**getBusiness** (GET, requires auth):

- SELECT business WHERE id = type::thing($business_id) AND user has access via user_business

**deleteBusiness** (POST, requires auth):

- Only owner can delete
- DELETE user_business records first
- DELETE business

### 1.4 apps/web/src/functions/location.ts

**createLocation** (POST, requires auth):

- Check user owns the business first
- CREATE location

**getBusinessLocations** (GET, requires auth, takes business_id):

- Check user has user_business membership
- SELECT location WHERE business_id = type::thing($business_id)

**getLocation** (GET, requires auth, takes location_id):

- SELECT location with authorization check via business and user_business

### 1.5 apps/web/src/functions/available-shifts.ts

**getAvailableShifts** (GET, takes userId):

- SELECT shift WHERE status = "open"
- AND location_id IN (SELECT location_id FROM user_business WHERE user_id = type::thing($userId) AND role = "worker")
- Correlated subqueries for location_name, business_name

**getMySchedule** (GET, takes userId):

- SELECT claim WHERE worker_id = type::thing($userId) AND status = "approved"
- Correlated subqueries for shift details and location info

### 1.6 apps/web/src/functions/notifications.ts

**getNotifications** (GET, requires auth):

- SELECT notification WHERE user_id = type::thing($userId) ORDER BY created_at DESC

**markNotificationRead** (POST, requires auth):

- UPDATE notification SET read = true WHERE id AND user_id match

**markNotificationUnread** (POST, requires auth):

- UPDATE notification SET read = false WHERE id AND user_id match

**markAllNotificationsRead** (POST, requires auth):

- UPDATE notification SET read = true WHERE user_id = type::thing($userId) AND read = false

**createNotification** (POST, no auth middleware - internal use):

- CREATE notification with provided data

### 1.7 apps/web/src/functions/trust.ts

**getTrustScore** (GET, requires auth):

- SELECT user_business with business subquery for business_name
- WHERE user_id = type::thing($userId)

**calculateTrustScore** (POST, no auth middleware):

- Keep calculation logic in TypeScript
- Replace getKysely with getSurreal for the claim query
- SELECT claim WHERE worker_id AND location.business_id match

**updateTrustScore** (POST, no auth middleware):

- UPDATE user_business SET trust_score, reliability WHERE user_id AND business_id match

### 1.8 apps/web/src/routes/api/shifts/index.ts

**GET handler** (API route, manual auth check):

- Keep auth.api.getSession() check
- Replace Kysely query builder with SurrealQL
- SELECT shift with location and business subqueries
- Filter by locationId, status, role from query params

### 1.9 apps/web/src/routes/api/shifts/$id/claims.ts

**GET handler** (API route, manual auth check):

- Keep auth.api.getSession() check
- Replace Kysely with SurrealQL
- SELECT claims with worker info subqueries
- Authorization check via user_business

---

## TASK 2: Login/signup redirect for logged-in users

### 2.1 apps/web/src/routes/login.tsx

Add `beforeLoad`:

```ts
beforeLoad: async () => {
  const { session } = await getUser();
  if (session?.user) throw redirect({ to: "/dashboard" });
},
```

### 2.2 apps/web/src/routes/signup.tsx

Same pattern as login.tsx

### 2.3 apps/web/src/routes/\_\_root.tsx

- Change `createRootRoute` to `createRootRouteWithContext<{ session: Session | null }>()`
- Add `beforeLoad` that calls `getUser()` and returns `{ session }`
- Import Session type from @wajeer/auth

### 2.4 apps/web/src/router.tsx

- Add context initial value: `context: { session: null as Session | null }`

---

## TASK 3: Fix TS cosmetic warning in dashboard.ts

**Issue:** `Record<string, unknown>[]` causes index signature warning in TanStack Start's ServerFn type.

**Fix:** Cast the return type properly:

```ts
// Current (causes warning):
return normalizeRecord<Record<string, unknown>[]>(myShifts.slice(0, 5));

// Fixed:
return normalizeRecord(myShifts.slice(0, 5)) as Array<
  Record<string, string | number | boolean | null>
>;
```

Apply to all normalizeRecord calls in dashboard.ts.

---

## Verification Steps

After all changes:

1. `bun run check-types` — TypeScript type checking
2. `bun run fix` — Auto-format with ultracite
3. `bun run check` — Lint verification

---

## Key Considerations

- **RecordId normalization:** All string IDs that reference SurrealDB records must use `type::thing($param)` in queries
- **Correlated subqueries:** Use `$parent.fieldName` to access outer query fields
- **Date handling:** Use `time::now()` for SurrealDB timestamps instead of `new Date()`
- **Multi-statement batches:** Separate with semicolons, destructure result array
- **Auth middleware:** Functions using `requireAuth` middleware get `context.session.user.id`
- **API routes:** Keep manual `auth.api.getSession()` checks, replace only the DB queries
- **Return types:** Use `normalizeRecord<T>()` to convert RecordId objects to strings
