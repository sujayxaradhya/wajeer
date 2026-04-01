# Plan: Reimplement SurrealDB Adapter Using kysely-surrealdb

## Problem

The current `packages/auth/src/surreal-adapter.ts` (310 lines) uses raw SurrealDB WebSocket connections and manually constructs SurrealQL queries via string interpolation. This approach:

- Is error-prone (known bug: `false` values skipped during record creation)
- Duplicates connection management logic (already exists in `@wajeer/db`)
- Bypasses type safety provided by Kysely
- Is hard to maintain and test

## Goal

Replace the custom adapter with a clean implementation using `Kysely<SurrealDatabase<Database>>` from `kysely-surrealdb`, leveraging the existing `@wajeer/db` package for connection management. Ensure better-auth signup and login work perfectly.

## Files to Modify

### 1. `packages/auth/src/surreal-adapter.ts` — Complete rewrite

**Current:** 310 lines of raw SurrealQL, manual connection management, custom value transformers
**New:** ~120 lines using Kysely's type-safe query builder

Key changes:

- Import `getKysely` from `@wajeer/db` instead of managing own Surreal connection
- Use `Kysely<SurrealDatabase<Database>>` for type-safe queries
- Map better-auth adapter operations to Kysely methods:
  - `create` → `db.insertInto(model).values(data).executeTakeFirst()`
  - `findOne` → `db.selectFrom(model).where(...).selectAll().executeTakeFirst()`
  - `findMany` → `db.selectFrom(model).where(...).selectAll().execute()`
  - `update` → `db.updateTable(model).set(data).where(...).executeTakeFirst()`
  - `updateMany` → `db.updateTable(model).set(data).where(...).execute()`
  - `delete` → `db.deleteFrom(model).where(...).execute()`
  - `deleteMany` → `db.deleteFrom(model).where(...).execute()`
  - `count` → `db.selectFrom(model).where(...).select(db.fn.countAll().as("count")).executeTakeFirst()`
- Remove `transformValue`, `transformOutput`, `buildWhereClause` helpers (Kysely handles this)
- Remove `ensureConnection` (reuses `@wajeer/db` singleton)
- Simplify config to just pass through to `@wajeer/db`

### 2. `packages/auth/src/index.ts` — Simplify config

**Changes:**

- Remove dependency on `SurrealAdapterConfig` with raw connection params
- Use `@wajeer/env/server` env vars directly (adapter reads them internally via `getKysely()`)
- Keep all better-auth config (user/session/account/verification field mappings, emailAndPassword, plugins)

### 3. `packages/auth/package.json` — Add `@wajeer/db` dependency

**Change:** Ensure `@wajeer/db` is in dependencies (it may already be there)

- Remove `surrealdb` direct dependency if present (use it through `@wajeer/db`)

### 4. `packages/db/src/schema.ts` — No changes needed

The schema already defines all tables correctly with proper types.

### 5. `packages/db/src/index.ts` — Add helper for auth adapter

**Change:** Export a `getKyselyForAuth()` function that returns `Kysely<SurrealDatabase<Database>>` using the standard Kysely interface (not SurrealKysely-specific methods). This ensures the auth adapter uses standard `insertInto`/`selectFrom`/`updateTable`/`deleteFrom` methods.

Actually, `SurrealKysely` extends `Kysely` so standard methods are already available. No changes needed here.

## Files NOT Modified

- `apps/web/src/lib/auth-client.ts` — Client setup unchanged
- `apps/web/src/routes/api/auth/$.ts` — Auth route unchanged
- `apps/web/src/middleware/auth.ts` — Middleware unchanged
- `apps/web/src/components/sign-in-form.tsx` — UI unchanged
- `apps/web/src/components/sign-up-form.tsx` — UI unchanged
- `packages/db/src/schema.ts` — Schema unchanged
- `packages/db/src/setup-auth-schema.ts` — Schema setup unchanged
- `packages/db/src/live-queries.ts` — Live queries unchanged
- `packages/env/src/server.ts` — Env validation unchanged

## Implementation Steps

### Step 1: Rewrite `packages/auth/src/surreal-adapter.ts`

```typescript
import { createAdapterFactory } from "better-auth/adapters";
import { getKysely } from "@wajeer/db";

export const surrealAdapter = () => {
  return createAdapterFactory({
    config: {
      adapterId: "surrealdb",
      adapterName: "SurrealDB",
      usePlural: false,
      supportsJSON: true,
      supportsDates: true,
      supportsBooleans: true,
      supportsNumericIds: false,
    },
    adapter: () => ({
      create: async ({ model, data }) => {
        const db = await getKysely();
        const result = await db
          .insertInto(model as keyof Database)
          .values(data as never)
          .executeTakeFirst();
        return { id: String(result.insertedId), ...data };
      },
      findOne: async ({ model, where }) => {
        const db = await getKysely();
        let query = db.selectFrom(model as keyof Database).selectAll();
        for (const clause of where) {
          query = query.where(
            clause.field as never,
            (clause.operator ?? "=") as never,
            clause.value as never
          );
        }
        const result = await query.executeTakeFirst();
        return result ?? null;
      },
      findMany: async ({ model, where, limit, offset, sortBy }) => {
        const db = await getKysely();
        let query = db.selectFrom(model as keyof Database).selectAll();
        if (where) {
          for (const clause of where) {
            query = query.where(
              clause.field as never,
              (clause.operator ?? "=") as never,
              clause.value as never
            );
          }
        }
        if (sortBy) {
          query = query.orderBy(
            sortBy.field as never,
            sortBy.direction.toUpperCase() as "ASC" | "DESC"
          );
        }
        if (limit) query = query.limit(limit);
        if (offset) query = query.offset(offset);
        return query.execute();
      },
      update: async ({ model, where, update }) => {
        const db = await getKysely();
        let query = db
          .updateTable(model as keyof Database)
          .set(update as never);
        for (const clause of where) {
          query = query.where(
            clause.field as never,
            (clause.operator ?? "=") as never,
            clause.value as never
          );
        }
        const result = await query.executeTakeFirst();
        return result ? (update as Record<string, unknown>) : null;
      },
      updateMany: async ({ model, where, update }) => {
        const db = await getKysely();
        let query = db
          .updateTable(model as keyof Database)
          .set(update as never);
        for (const clause of where) {
          query = query.where(
            clause.field as never,
            (clause.operator ?? "=") as never,
            clause.value as never
          );
        }
        const result = await query.execute();
        return result.length;
      },
      delete: async ({ model, where }) => {
        const db = await getKysely();
        let query = db.deleteFrom(model as keyof Database);
        for (const clause of where) {
          query = query.where(
            clause.field as never,
            (clause.operator ?? "=") as never,
            clause.value as never
          );
        }
        await query.execute();
      },
      deleteMany: async ({ model, where }) => {
        const db = await getKysely();
        let query = db.deleteFrom(model as keyof Database);
        for (const clause of where) {
          query = query.where(
            clause.field as never,
            (clause.operator ?? "=") as never,
            clause.value as never
          );
        }
        const result = await query.execute();
        return result.length;
      },
      count: async ({ model, where }) => {
        const db = await getKysely();
        let query = db
          .selectFrom(model as keyof Database)
          .select(db.fn.countAll().as("count"));
        if (where) {
          for (const clause of where) {
            query = query.where(
              clause.field as never,
              (clause.operator ?? "=") as never,
              clause.value as never
            );
          }
        }
        const result = await query.executeTakeFirst();
        return Number(result?.count ?? 0);
      },
    }),
  });
};
```

### Step 2: Update `packages/auth/src/index.ts`

```typescript
import { env } from "@wajeer/env/server";
import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { surrealAdapter } from "./surreal-adapter";

export function createAuth() {
  return betterAuth({
    database: surrealAdapter(),
    // ... rest of config stays the same
  });
}

export const auth = createAuth();
```

### Step 3: Update `packages/auth/package.json`

Add `@wajeer/db` to dependencies.

## Testing Plan

1. Run `bun run check-types` to verify TypeScript compilation
2. Run `bun run dev` and test signup flow at `/signup`
3. Test login flow at `/login`
4. Verify session is created and dashboard loads
5. Test sign-out flow

## Risks & Mitigations

- **Kysely `insertInto` may not return `insertedId` in SurrealDB**: If `executeTakeFirst()` doesn't return the ID, fall back to returning the data as-is (SurrealDB generates the ID, we can query it back)
- **Field name mapping**: better-auth sends camelCase fields, adapter config maps them to snake_case. The adapter receives already-mapped field names from better-auth, so no additional mapping needed in the adapter itself.
- **Where clause operators**: better-auth uses operators like `eq`, `ne`, `gt`, etc. Need to map these to Kysely operators (`=`, `!=`, `>`, etc.)
