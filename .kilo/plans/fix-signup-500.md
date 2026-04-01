# Plan: Fix Sign-Up 500 Error

## Summary

Sign-up fails with 500 Internal Server Error because the SurrealDB database schema hasn't been updated to match Better Auth's expected field types. Code fixes are in place, but migrations haven been applied to the live database.

## Root Cause Analysis

### Primary Issue: Database Schema Mismatch

The previous debug session correctly identified 5 root causes. Code fixes exist in files, but the **live SurrealDB instance still has the old schema**:

| Field                 | Old Schema (Live DB) | New Schema (Code) | Problem                             |
| --------------------- | -------------------- | ----------------- | ----------------------------------- | -------------------------------------- |
| `session.user_id`     | `record<user>`       | `string`          | Rejects plain UUID from Better Auth |
| `account.user_id`     | `record<user>`       | `string`          | Rejects plain UUID from Better Auth |
| `user.email_verified` | `option<datetime>`   | `bool             | none`                               | Rejects boolean false from Better Auth |
| `account.password`    | Missing              | `string           | none`                               | Credential provider fails              |
| `session.ip_address`  | Missing              | `string           | none`                               | Better Auth inserts these              |
| `session.user_agent`  | Missing              | `string           | none`                               | Better Auth inserts these              |

### Secondary Issue: RETURNING \* Syntax (Already Fixed)

The custom `surrealAdapter.ts` no longer calls `.returningAll()`. It returns `data` directly, bypassing Kysely's PostgreSQL-specific syntax that's invalid in SurrealQL.

## Evidence

- `packages/auth/src/surreal-adapter.ts:51` — comment explains `.returningAll()` is invalid SurrealQL
- `packages/db/src/schema.ts:20` — `email_verified: boolean | null` (correct TypeScript type)
- `packages/db/src/schema.ts:101` — `user_id: string` (correct, not `record<user>`)
- `packages/db/migrations/002-auth-field-fixes.surql` — idempotent schema fixes ready to apply
- Git status shows these files are uncommitted → migrations likely never ran

## Execution Plan

### Step 1: Run Database Migration

Apply the schema fixes to the live SurrealDB instance:

```bash
bun run --filter @wajeer/db migrate
```

This runs `packages/db/migrate.ts` which executes all `.surql` files in order:

- `001-initial-schema.surql` — full schema (idempotent DEFINE TABLE/FIELD statements)
- `002-auth-field-fixes.surql` — targeted fixes for auth fields

### Step 2: Verify Schema Applied

Run the verification script to confirm tables have correct structure:

```bash
bun run packages/db/verify.ts
```

Expected output should show tables: `user`, `session`, `account`, `verification`, etc.

### Step 3: Restart Dev Server

Kill and restart the dev server to clear any cached connections:

```bash
# Kill existing server
pkill -f "bun run dev" || true

# Start fresh
bun run dev
```

### Step 4: Test Sign-Up

Navigate to `http://localhost:3001/signup` and create a test account:

- Email: `test@example.com`
- Password: `testpass123` (8+ chars)
- Name: `Test User`

### Step 5: Capture Server Logs (If Still Failing)

If 500 persists, capture the actual server-side error:

```bash
# Check TanStack Start server logs
bun run dev 2>&1 | tee server.log
```

Look for:

- SurrealDB error messages (field type mismatches)
- Better Auth error messages
- Kysely query compilation errors

## Alternative: Use surreal-better-auth Package

There's a dedicated adapter package `surreal-better-auth` by oskar-gmerek that may handle SurrealDB quirks automatically. However, the current custom adapter is functional once migrations are applied.

**Decision**: Proceed with current adapter + migration. If issues persist, consider switching to `surreal-better-auth`.

## Files Modified (Ready to Commit After Verification)

- `packages/auth/src/surreal-adapter.ts` — removed `.returningAll()`
- `packages/db/src/schema.ts` — fixed TypeScript types
- `packages/db/migrations/001-initial-schema.surql` — fixed SurrealQL schema
- `packages/db/migrations/002-auth-field-fixes.surql` — incremental migration
- `packages/db/migrate.ts` — runs all `.surql` files

## Rollback Plan

If migration causes issues:

1. SurrealDB DEFINE FIELD statements are idempotent — re-running won't break
2. No data is deleted or modified
3. To fully reset: drop database in SurrealDB Cloud console and re-run migration

## Confidence

- Root cause: 9/10 (well-documented Better Auth + SurrealDB type mismatch)
- Fix approach: 8/10 (standard migration pattern, idempotent statements)
- Code readiness: 10/10 (all fixes already written)
- Blocker certainty: 10/10 (migration not run = old schema still live)

## GSTACK REVIEW REPORT

| Review        | Trigger               | Why                             | Runs | Status      | Findings                  |
| ------------- | --------------------- | ------------------------------- | ---- | ----------- | ------------------------- |
| CEO Review    | `/plan-ceo-review`    | Scope & strategy                | 0    | —           | —                         |
| Codex Review  | `/codex review`       | Independent 2nd opinion         | 0    | —           | —                         |
| Eng Review    | `/plan-eng-review`    | Architecture & tests (required) | 1    | issues_open | 8 issues, 3 critical gaps |
| Design Review | `/plan-design-review` | UI/UX gaps                      | 1    | clean       | Score 9, 6 decisions      |

**VERDICT:** Eng review has unresolved issues. Run `/plan-eng-review` again after migration to verify architecture alignment, or proceed with migration first then re-review.

**Prior Session Context:** Previous debug session (investigate skill) identified the same root causes and wrote fixes. This plan confirms those fixes are in code but NOT applied to the live database.
