# Plan: Wajeer MVP Implementation

**Branch:** main
**Mode:** IMPLEMENTATION
**Date:** 2026-03-31
**Status:** READY FOR BUILD

---

## Current State Assessment

### What EXISTS (Foundation)

| Component                                    | Status      | Notes                                  |
| -------------------------------------------- | ----------- | -------------------------------------- |
| Database schema (`packages/db/schema.ts`)    | ✅ Complete | Kysely types for SurrealDB             |
| DB connection (`packages/db/index.ts`)       | ✅ Complete | HTTP + WebSocket                       |
| Live queries (`packages/db/live-queries.ts`) | ✅ Complete | SurrealDB subscription helpers         |
| Auth package (`packages/auth/index.ts`)      | ✅ Complete | Better Auth config                     |
| Auth API route (`/api/auth/$`)               | ✅ Complete | Handles all Better Auth endpoints      |
| Auth client (`authClient`)                   | ✅ Complete | React hooks for auth                   |
| Sign-in/Sign-up forms                        | ✅ Complete | TanStack Form + validation             |
| Login page (`/login`)                        | ✅ Complete | Form switcher                          |
| Dashboard route (`/dashboard`)               | ✅ Skeleton | Placeholder only                       |
| Demo simulation (`/demo`)                    | ✅ Complete | SSE + in-memory state                  |
| Server functions (`functions/shifts.ts`)     | ✅ Complete | Not wired to routes                    |
| UI components                                | ✅ Complete | Trust badge, claim button, worker card |

### What's MISSING (MVP Blockers)

| Component             | Blocker                                | Priority |
| --------------------- | -------------------------------------- | -------- |
| SurrealDB instance    | No running database                    | P0       |
| SurrealDB tables      | Schema defined, tables not created     | P0       |
| Email verification    | Not wired to email service             | P1       |
| Protected routes      | No auth guards on dashboard            | P0       |
| Business creation     | No UI or server function               | P0       |
| Location management   | No UI or server function               | P0       |
| User-business linking | No invite/accept flow                  | P1       |
| Real shift routes     | Server functions exist but not exposed | P0       |
| Role-based access     | No permission checks                   | P1       |
| Dashboard data        | Shows placeholder, no real data        | P0       |

---

## Implementation Plan

### Phase 1: Database Foundation (Day 1)

#### Step 1.1: SurrealDB Cloud Setup

**Goal:** Connect to SurrealDB Cloud instance.

**Tasks:**

1. **Set up SurrealDB Cloud:**
   - Sign up at [surrealdb.com/cloud](https://surrealdb.com/cloud)
   - Create a new instance (free tier available)
   - Note the connection URL, namespace, database, username, and password

2. **Configure environment variables:**

```env
# .env (already exists, verify values)
SURREALDB_URL=wss://<your-instance>.surrealdb.cloud
SURREALDB_HOST=<your-instance>.surrealdb.cloud
SURREALDB_NS=wajeer
SURREALDB_DB=production
SURREALDB_USER=<your-username>
SURREALDB_PASS=<your-password>
```

3. **Create SurrealQL migration:**

```sql
-- packages/db/migrations/001-initial.surql

-- Enable authentication
DEFINE USER root ON ROOT PASSWORD 'root' ROLES OWNER;

-- Namespace and database
DEFINE NAMESPACE wajeer;
DEFINE DATABASE production;

-- Tables
DEFINE TABLE user SCHEMAFULL
  PERMISSIONS
    FOR select, update WHERE id = $auth.id,
    FOR create, delete NONE;

DEFINE FIELD email ON TABLE user TYPE string ASSERT string::is::email($value);
DEFINE FIELD name ON TABLE TYPE string;
DEFINE FIELD email_verified ON TABLE user TYPE datetime;
DEFINE FIELD image ON TABLE user TYPE option<string>;
DEFINE FIELD password_hash ON TABLE user TYPE option<string>;
DEFINE FIELD trust_score ON TABLE user TYPE float DEFAULT 4.5;
DEFINE FIELD roles ON TABLE user TYPE array<string> DEFAULT [];
DEFINE FIELD created_at ON TABLE user TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON TABLE user TYPE datetime DEFAULT time::now();

DEFINE INDEX userEmail ON TABLE user FIELDS email UNIQUE;

DEFINE TABLE business SCHEMAFULL
  PERMISSIONS
    FOR select WHERE owner_id = $auth.id OR id IN (SELECT VALUE business_id FROM user_business WHERE user_id = $auth.id),
    FOR create WHERE owner_id = $auth.id,
    FOR update, delete WHERE owner_id = $auth.id;

DEFINE FIELD name ON TABLE business TYPE string;
DEFINE FIELD owner_id ON TABLE business TYPE record<user>;
DEFINE FIELD created_at ON TABLE business TYPE datetime DEFAULT time::now();

DEFINE TABLE location SCHEMAFULL
  PERMISSIONS
    FOR select WHERE business_id.owner_id = $auth.id OR business_id IN (SELECT VALUE business_id FROM user_business WHERE user_id = $auth.id),
    FOR create, update, delete WHERE business_id.owner_id = $auth.id;

DEFINE FIELD business_id ON TABLE location TYPE record<business>;
DEFINE FIELD name ON TABLE location TYPE string;
DEFINE FIELD address ON TABLE location TYPE string;
DEFINE FIELD created_at ON TABLE location TYPE datetime DEFAULT time::now();

DEFINE TABLE user_business SCHEMAFULL
  PERMISSIONS
    FOR select WHERE user_id = $auth.id OR business_id.owner_id = $auth.id,
    FOR create WHERE business_id.owner_id = $auth.id,
    FOR update, delete WHERE user_id = $auth.id OR business_id.owner_id = $auth.id;

DEFINE FIELD user_id ON TABLE user_business TYPE record<user>;
DEFINE FIELD business_id ON TABLE user_business TYPE record<business>;
DEFINE FIELD location_id ON TABLE user_business TYPE option<record<location>>;
DEFINE FIELD role ON TABLE user_business TYPE string ASSERT $value IN ['owner', 'manager', 'worker'];
DEFINE FIELD trust_score ON TABLE user_business TYPE float DEFAULT 4.5;
DEFINE FIELD reliability ON TABLE user_business TYPE float DEFAULT 0.95;
DEFINE FIELD invited_at ON TABLE user_business TYPE datetime DEFAULT time::now();
DEFINE FIELD joined_at ON TABLE user_business TYPE option<datetime>;

DEFINE INDEX userBusinessUser ON TABLE user_business FIELDS user_id;
DEFINE INDEX userBusinessBusiness ON TABLE user_business FIELDS business_id;

DEFINE TABLE shift SCHEMAFULL
  PERMISSIONS
    FOR select WHERE location_id.business_id.owner_id = $auth.id OR location_id.business_id IN (SELECT VALUE business_id FROM user_business WHERE user_id = $auth.id),
    FOR create, update, delete WHERE location_id.business_id.owner_id = $auth.id OR location_id IN (SELECT VALUE location_id FROM user_business WHERE user_id = $auth.id AND role IN ['owner', 'manager']);

DEFINE FIELD location_id ON TABLE shift TYPE record<location>;
DEFINE FIELD posted_by ON TABLE shift TYPE record<user>;
DEFINE FIELD role ON TABLE shift TYPE string;
DEFINE FIELD title ON TABLE shift TYPE string;
DEFINE FIELD date ON TABLE shift TYPE string;
DEFINE FIELD start_time ON TABLE shift TYPE string;
DEFINE FIELD end_time ON TABLE shift TYPE string;
DEFINE FIELD hourly_rate ON TABLE shift TYPE option<float>;
DEFINE FIELD notes ON TABLE shift TYPE option<string>;
DEFINE FIELD status ON TABLE shift TYPE string DEFAULT 'open' ASSERT $value IN ['open', 'claimed', 'approved', 'completed', 'cancelled'];
DEFINE FIELD created_at ON TABLE shift TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON TABLE shift TYPE datetime DEFAULT time::now();

DEFINE INDEX shiftLocation ON TABLE shift FIELDS location_id;
DEFINE INDEX shiftStatus ON TABLE shift FIELDS status;

DEFINE TABLE claim SCHEMAFULL
  PERMISSIONS
    FOR select WHERE shift_id.location_id.business_id.owner_id = $auth.id OR worker_id = $auth.id,
    FOR create WHERE worker_id = $auth.id,
    FOR update WHERE shift_id.location_id.business_id.owner_id = $auth.id OR shift_id.location_id IN (SELECT VALUE location_id FROM user_business WHERE user_id = $auth.id AND role IN ['owner', 'manager']);

DEFINE FIELD shift_id ON TABLE claim TYPE record<shift>;
DEFINE FIELD worker_id ON TABLE claim TYPE record<user>;
DEFINE FIELD status ON TABLE claim TYPE string DEFAULT 'pending' ASSERT $value IN ['pending', 'approved', 'rejected'];
DEFINE FIELD claimed_at ON TABLE claim TYPE datetime DEFAULT time::now();
DEFINE FIELD responded_at ON TABLE claim TYPE option<datetime>;

DEFINE INDEX claimShift ON TABLE claim FIELDS shift_id;
DEFINE INDEX claimWorker ON TABLE claim FIELDS worker_id;

DEFINE TABLE notification SCHEMAFULL
  PERMISSIONS
    FOR select, update WHERE user_id = $auth.id,
    FOR create, delete NONE;

DEFINE FIELD user_id ON TABLE notification TYPE record<user>;
DEFINE FIELD type ON TABLE notification TYPE string ASSERT $value IN ['shift_posted', 'claim_approved', 'claim_rejected'];
DEFINE FIELD title ON TABLE notification TYPE string;
DEFINE FIELD body ON TABLE notification TYPE string;
DEFINE FIELD data ON TABLE notification TYPE object;
DEFINE FIELD read ON TABLE notification TYPE bool DEFAULT false;
DEFINE FIELD created_at ON TABLE notification TYPE datetime DEFAULT time::now();

-- Better Auth tables
DEFINE TABLE session SCHEMAFULL;
DEFINE FIELD id ON TABLE session TYPE string;
DEFINE FIELD user_id ON TABLE session TYPE record<user>;
DEFINE FIELD expires_at ON TABLE session TYPE datetime;
DEFINE FIELD token ON TABLE session TYPE string;
DEFINE FIELD created_at ON TABLE session TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON TABLE session TYPE datetime DEFAULT time::now();
DEFINE INDEX sessionToken ON TABLE session FIELDS token UNIQUE;

DEFINE TABLE account SCHEMAFULL;
DEFINE FIELD user_id ON TABLE account TYPE record<user>;
DEFINE FIELD account_id ON TABLE account TYPE string;
DEFINE FIELD provider_id ON TABLE account TYPE string;
DEFINE FIELD access_token ON TABLE account TYPE option<string>;
DEFINE FIELD refresh_token ON TABLE account TYPE option<string>;
DEFINE FIELD access_token_expires_at ON TABLE account TYPE option<datetime>;
DEFINE FIELD refresh_token_expires_at ON TABLE account TYPE option<datetime>;
DEFINE FIELD scope ON TABLE account TYPE option<string>;
DEFINE FIELD id_token ON TABLE account TYPE option<string>;
DEFINE FIELD created_at ON TABLE account TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON TABLE account TYPE datetime DEFAULT time::now();

DEFINE TABLE verification SCHEMAFULL;
DEFINE FIELD identifier ON TABLE verification TYPE string;
DEFINE FIELD value ON TABLE verification TYPE string;
DEFINE FIELD expires_at ON TABLE verification TYPE datetime;
DEFINE FIELD created_at ON TABLE verification TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON TABLE verification TYPE datetime DEFAULT time::now();
```

3. **Create migration runner:**

```typescript
// packages/db/migrate.ts
import "dotenv/config";
import { Surreal } from "surrealdb";
import { env } from "@wajeer/env/server";
import { readFileSync } from "fs";
import { join } from "path";

async function migrate() {
  const db = new Surreal();
  // Connect to SurrealDB Cloud (wss:// for secure connection)
  await db.connect(env.SURREALDB_URL);
  await db.signin({
    username: env.SURREALDB_USER,
    password: env.SURREALDB_PASS,
  });
  await db.use({ namespace: env.SURREALDB_NS, database: env.SURREALDB_DB });

  const migrationFile = readFileSync(
    join(import.meta.dir, "migrations/001-initial.surql"),
    "utf-8"
  );
  await db.query(migrationFile);

  console.log("Migration complete");
  await db.close();
}

migrate().catch(console.error);
```

**Files to create:**

- `packages/db/migrations/001-initial.surql`
- `packages/db/migrate.ts`

---

### Phase 2: Auth Guards & Routes (Day 1)

#### Step 2.1: Protect Dashboard

**Goal:** Require authentication to access dashboard.

**Files to modify:**

```typescript
// apps/web/src/routes/dashboard.tsx
import { createFileRoute, redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session?.user) {
      throw redirect({ to: "/login" });
    }
    return { session };
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { session } = Route.useRouteContext();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome, {session.user.name}</h1>
      <p className="text-white/50 mt-2">Your dashboard will appear here.</p>
    </div>
  );
}
```

#### Step 2.2: Wire Email Verification (Optional)

**Goal:** Send verification emails on sign-up.

**Options:**

- **Dev mode:** Log verification URL to console (already configured)
- **Production:** Wire to Resend/SendGrid

```typescript
// packages/auth/src/index.ts
import { betterAuth } from "better-auth";

export function createAuth() {
  return betterAuth({
    // ... existing config
    emailVerification: {
      sendOnSignUp: true,
      sendVerificationEmail: async ({ user, url }) => {
        // DEV: Log to console
        console.log(`[DEV] Verify email: ${url}`);

        // TODO: Wire to email service
        // await sendEmail({ to: user.email, subject: "Verify your email", body: `Click: ${url}` });
      },
    },
  });
}
```

---

### Phase 3: Business & Location Management (Day 2)

#### Step 3.1: Business Server Functions

**Goal:** Create/manage businesses.

**Files to create:**

```typescript
// apps/web/src/functions/business.ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getKysely } from "@wajeer/db";
import { requireAuth } from "@/middleware/auth";

const createBusinessSchema = z.object({
  name: z.string().min(1).max(100),
});

export const createBusiness = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator(createBusinessSchema)
  .handler(async ({ data, context }) => {
    const db = getKysely();
    const userId = context.session.user.id;

    const business = await db
      .insertInto("business")
      .values({
        name: data.name,
        owner_id: userId,
      })
      .returningAll()
      .executeTakeFirst();

    // Auto-add owner to user_business
    await db
      .insertInto("user_business")
      .values({
        user_id: userId,
        business_id: business!.id,
        role: "owner",
        trust_score: 4.5,
        reliability: 0.95,
        joined_at: new Date(),
      })
      .execute();

    return business;
  });

export const getMyBusinesses = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const db = getKysely();
    const userId = context.session.user.id;

    return db
      .selectFrom("business")
      .innerJoin("user_business", "business.id", "user_business.business_id")
      .where("user_business.user_id", "=", userId)
      .selectAll("business")
      .execute();
  });
```

#### Step 3.2: Location Server Functions

```typescript
// apps/web/src/functions/location.ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getKysely } from "@wajeer/db";
import { requireAuth } from "@/middleware/auth";

const createLocationSchema = z.object({
  business_id: z.string(),
  name: z.string().min(1).max(100),
  address: z.string().min(1),
});

export const createLocation = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator(createLocationSchema)
  .handler(async ({ data, context }) => {
    const db = getKysely();
    const userId = context.session.user.id;

    // Verify user owns this business
    const business = await db
      .selectFrom("business")
      .where("id", "=", data.business_id)
      .where("owner_id", "=", userId)
      .selectAll()
      .executeTakeFirst();

    if (!business) {
      throw new Error("Not authorized to create locations for this business");
    }

    return db
      .insertInto("location")
      .values({
        business_id: data.business_id,
        name: data.name,
        address: data.address,
      })
      .returningAll()
      .executeTakeFirst();
  });

export const getBusinessLocations = createServerFn({ method: "GET" })
  .validator(z.object({ business_id: z.string() }))
  .handler(async ({ data, context }) => {
    const db = getKysely();
    // ... similar permission check
    return db
      .selectFrom("location")
      .where("business_id", "=", data.business_id)
      .selectAll()
      .execute();
  });
```

#### Step 3.3: Business Setup Wizard

**Goal:** Guide new users through business creation.

**Files to create:**

```tsx
// apps/web/src/routes/onboarding.tsx
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@wajeer/ui/components/button";
import { Input } from "@wajeer/ui/components/input";

export const Route = createFileRoute("/onboarding")({
  beforeLoad: async ({ context }) => {
    // Check if user already has a business
    // If yes, redirect to dashboard
  },
  component: OnboardingWizard,
});

function OnboardingWizard() {
  const [step, setStep] = useState<"business" | "location" | "team">(
    "business"
  );
  const [businessId, setBusinessId] = useState<string | null>(null);

  return (
    <div className="max-w-md mx-auto p-6">
      {step === "business" && (
        <BusinessStep
          onComplete={(id) => {
            setBusinessId(id);
            setStep("location");
          }}
        />
      )}
      {step === "location" && businessId && (
        <LocationStep
          businessId={businessId}
          onComplete={() => setStep("team")}
        />
      )}
      {step === "team" && businessId && (
        <TeamInviteStep
          businessId={businessId}
          onComplete={() => {
            // Navigate to dashboard
          }}
        />
      )}
    </div>
  );
}
```

---

### Phase 4: Shift Management (Day 3)

#### Step 4.1: Replace Demo Routes with Real Routes

**Goal:** Wire server functions to API routes.

**Files to modify:**

```typescript
// apps/web/src/routes/api/shifts/index.ts (NEW)
import { createFileRoute } from "@tanstack/react-router";
import { getKysely } from "@wajeer/db";

export const Route = createFileRoute("/api/shifts/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const locationId = url.searchParams.get("locationId");
        const status = url.searchParams.get("status");

        const db = getKysely();
        let query = db.selectFrom("shift").selectAll();

        if (locationId) {
          query = query.where("location_id", "=", locationId);
        }
        if (status) {
          query = query.where("status", "=", status);
        }

        const shifts = await query.execute();
        return Response.json(shifts);
      },
    },
  },
});
```

**Or use server functions directly from components:**

```tsx
// apps/web/src/routes/dashboard.tsx
import { useMutation, useQuery } from "@tanstack/react-query";
import { getMyBusinesses } from "@/functions/business";
import { postShift, claimShift, approveClaim } from "@/functions/shifts";

function DashboardPage() {
  const { data: businesses } = useQuery({
    queryKey: ["businesses"],
    queryFn: () => getMyBusinesses(),
  });

  const postShiftMutation = useMutation({
    mutationFn: postShift,
    onSuccess: () => {
      // Invalidate shift queries
    },
  });

  // ... render UI
}
```

---

### Phase 5: Dashboard Implementation (Day 3-4)

#### Step 5.1: Manager Dashboard

**Goal:** Show shifts, claims, and workers for each location.

**Files to create:**

```tsx
// apps/web/src/routes/dashboard/manager.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/manager")({
  component: ManagerDashboard,
});

function ManagerDashboard() {
  return (
    <div className="grid grid-cols-3 gap-6 p-6">
      {/* Left: Locations list */}
      <div className="col-span-1">
        <LocationList />
      </div>

      {/* Center: Active shifts */}
      <div className="col-span-1">
        <ActiveShifts />
      </div>

      {/* Right: Pending claims */}
      <div className="col-span-1">
        <PendingClaims />
      </div>
    </div>
  );
}
```

#### Step 5.2: Worker Dashboard

```tsx
// apps/web/src/routes/dashboard/worker.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/worker")({
  component: WorkerDashboard,
});

function WorkerDashboard() {
  return (
    <div className="p-6">
      {/* Available shifts */}
      <section>
        <h2 className="text-xl font-bold mb-4">Available Shifts</h2>
        <ShiftGrid />
      </section>

      {/* My shifts */}
      <section className="mt-8">
        <h2 className="text-xl font-bold mb-4">My Upcoming Shifts</h2>
        <MyShiftsList />
      </section>
    </div>
  );
}
```

---

### Phase 6: Real-Time with SurrealDB Live Queries (Day 4)

#### Step 6.1: Subscribe to Shift Changes

**Goal:** Real-time updates without SSE polling.

```tsx
// apps/web/src/hooks/use-live-shifts.ts
import { useEffect, useState } from "react";
import {
  subscribeToLocationShifts,
  closeSubscription,
} from "@wajeer/db/live-queries";
import type { Shift } from "@wajeer/db";

export function useLiveShifts(locationId: string | null) {
  const [shifts, setShifts] = useState<Shift[]>([]);

  useEffect(() => {
    if (!locationId) return;

    let subscription: unknown;

    subscribeToLocationShifts(locationId, (notification) => {
      if (notification.action === "CREATE") {
        setShifts((prev) => [...prev, notification.result]);
      } else if (notification.action === "UPDATE") {
        setShifts((prev) =>
          prev.map((s) =>
            s.id === notification.result.id ? notification.result : s
          )
        );
      } else if (notification.action === "DELETE") {
        setShifts((prev) =>
          prev.filter((s) => s.id !== notification.result.id)
        );
      }
    }).then((sub) => {
      subscription = sub;
    });

    return () => {
      if (subscription) {
        closeSubscription(subscription);
      }
    };
  }, [locationId]);

  return shifts;
}
```

---

## File Changes Summary

| File                                        | Action | Phase |
| ------------------------------------------- | ------ | ----- |
| `packages/db/migrations/001-initial.surql`  | Create | 1     |
| `packages/db/migrate.ts`                    | Create | 1     |
| `apps/web/src/routes/dashboard.tsx`         | Modify | 2     |
| `apps/web/src/functions/business.ts`        | Create | 3     |
| `apps/web/src/functions/location.ts`        | Create | 3     |
| `apps/web/src/routes/onboarding.tsx`        | Create | 3     |
| `apps/web/src/routes/api/shifts/index.ts`   | Create | 4     |
| `apps/web/src/routes/dashboard/manager.tsx` | Create | 5     |
| `apps/web/src/routes/dashboard/worker.tsx`  | Create | 5     |
| `apps/web/src/hooks/use-live-shifts.ts`     | Create | 6     |

---

## NOT in Scope

| Item                      | Reason                      |
| ------------------------- | --------------------------- |
| Email service integration | Dev mode logs to console    |
| PWA push notifications    | Web-first MVP               |
| Stripe billing            | Manual invoicing            |
| Typesense search          | SurrealDB search sufficient |
| Mobile app                | Web responsive              |
| Docker/local SurrealDB    | Cloud-hosted database       |

---

## Acceptance Criteria

- [ ] SurrealDB Cloud instance configured
- [ ] Migration creates all tables
- [ ] Sign-up creates user in SurrealDB
- [ ] Dashboard requires authentication
- [ ] User can create a business
- [ ] User can add locations to business
- [ ] Manager can post shifts
- [ ] Workers can see available shifts
- [ ] Workers can claim shifts
- [ ] Managers can approve claims
- [ ] Trust score updates on approval

---

## Next Steps

1. **Create SurrealDB Cloud instance** at surrealdb.com/cloud
2. **Configure `.env`** with cloud connection details
3. **Run `bun run migrate`** to create tables
4. **Test sign-up flow** to verify SurrealDB integration
5. **Build business creation** onboarding flow
6. **Implement dashboard** with real data
