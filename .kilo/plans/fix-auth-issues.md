# Plan: Fix Wajeer Authentication Issues

## Problem Statement

Signup fails with error: "Couldn't coerce value for field email_verified: Expected datetime but found NONE"

**Root Causes:**

1. SurrealDB adapter incorrectly skips `false` values during record creation
2. SCHEMAFULL schema defines `email_verified TYPE datetime` (required) but better-auth expects optional
3. Field name inconsistency across schema files (camelCase vs snake_case)

## Changes Required

### 1. Fix SurrealDB Adapter (Critical)

**File:** `packages/auth/src/surreal-adapter.ts`
**Line:** 144

**Current:**

```typescript
if (value === undefined || value === null || value === false) {
  continue;
}
```

**Fix:** Remove `value === false` from skip condition. Boolean fields must be stored as `false`, not skipped.

```typescript
if (value === undefined || value === null) {
  continue;
}
```

**Rationale:**

- `emailVerified` should be stored as `false` for unverified users, not omitted
- The `update` method (line 218) already correctly handles `false` values
- Skipping `false` prevents any boolean field from being set during creation

### 2. Fix Schema Type (Critical)

**File:** `packages/db/migrations/001-initial-schema.surql`
**Line:** 13

**Current:**

```surrealql
DEFINE FIELD email_verified ON user TYPE datetime;
```

**Fix:** Make field optional with `option<datetime>`:

```surrealql
DEFINE FIELD email_verified ON user TYPE option<datetime>;
```

**Rationale:**

- Better-auth expects `emailVerified` to be optional for unverified users
- `option<datetime>` allows `NONE`/`NULL` values
- Matches the intent of `requireEmailVerification: false` in auth config

### 3. Standardize Schema Files (High Priority)

**Files to update:**

- `packages/db/surreal-auth-schema.sql` (line 9)
- `packages/db/src/setup-auth-schema.ts` (line 10)

**Current:** Uses camelCase `emailVerified`
**Fix:** Change to snake_case `email_verified` to match:

- Auth package field mapping (`emailVerified` → `email_verified`)
- Initial migration naming convention
- Kysely type definitions

**Changes:**

```surrealql
-- surreal-auth-schema.sql
DEFINE FIELD email_verified ON user TYPE option<datetime> PERMISSIONS FULL;

-- setup-auth-schema.ts
"DEFINE FIELD email_verified ON user TYPE option<datetime> PERMISSIONS FULL",
```

Also update other field names to snake_case:

- `createdAt` → `created_at`
- `updatedAt` → `updated_at`
- `userId` → `user_id` (in session/account tables)
- `expiresAt` → `expires_at`
- etc.

### 4. Improve Post Shift Button UX (Medium Priority)

**File:** `apps/web/src/components/manager-panel.tsx`
**Line:** 64-70

**Current:**

```typescript
const handlePostShift = () => {
  fetch("/api/shifts/post", { method: "POST" }).catch(console.error);
  setCurrentShift(DEMO_SHIFT);
  startRacing();
};
```

**Fix:** Add proper error handling and loading state:

```typescript
const [isPosting, setIsPosting] = useState(false);

const handlePostShift = async () => {
  setIsPosting(true);
  try {
    const res = await fetch("/api/shifts/post", { method: "POST" });
    if (!res.ok) {
      toast.error("Failed to post shift");
      return;
    }
    setCurrentShift(DEMO_SHIFT);
    startRacing();
  } catch (err) {
    toast.error("Network error — please try again");
  } finally {
    setIsPosting(false);
  }
};
```

Update button:

```tsx
<button
  onClick={handlePostShift}
  disabled={isPosting}
  className="w-full rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/15 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isPosting ? "Posting..." : "Post Shift"}
</button>
```

### 5. Schema Migration Strategy

After fixing the schema files, need to run migration against SurrealDB:

**Option A:** Re-run `setup-auth-schema.ts` (uses SCHEMALESS)

```bash
bun run packages/db/src/setup-auth-schema.ts
```

**Option B:** Run updated SCHEMAFULL migration

```bash
# Connect to SurrealDB and run the updated 001-initial-schema.surql
```

**Recommended:** Use Option A (SCHEMALESS) for better-auth compatibility, or update SCHEMAFULL to use `option<datetime>` for all optional fields.

## Implementation Order

1. **First:** Fix adapter (line 144) - enables boolean fields
2. **Second:** Fix schema type (line 13) - allows optional datetime
3. **Third:** Standardize field names across schema files
4. **Fourth:** Run schema migration against database
5. **Fifth:** Test signup flow
6. **Sixth:** Improve Post Shift button UX

## Testing Plan

1. **Unit test:** Verify adapter `create` method handles `false` values
2. **Integration test:** Signup with `requireEmailVerification: false`
3. **E2E test:** Full signup → login → session flow
4. **Demo test:** Post Shift button functionality

## Files to Modify

| File                                              | Change Type        | Priority |
| ------------------------------------------------- | ------------------ | -------- |
| `packages/auth/src/surreal-adapter.ts`            | Logic fix          | Critical |
| `packages/db/migrations/001-initial-schema.surql` | Type fix           | Critical |
| `packages/db/surreal-auth-schema.sql`             | Naming standardize | High     |
| `packages/db/src/setup-auth-schema.ts`            | Naming standardize | High     |
| `apps/web/src/components/manager-panel.tsx`       | UX improve         | Medium   |

## Expected Outcome

- Signup succeeds without email verification
- `email_verified` field stored as `NONE` (optional datetime)
- Boolean fields correctly stored as `false` when needed
- Post Shift button provides user feedback on errors
