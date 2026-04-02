import { createServerFn } from "@tanstack/react-start";
import { getSurreal, normalizeRecord, toRecordId } from "@wajeer/db";

import {
  getAuthenticatedUser,
  getAuthenticatedUserId,
} from "@/lib/server-auth";

type ShiftRow = Record<string, string | number | boolean | null>;
type ClaimRow = Record<string, string | number | boolean | null>;

export const getDashboardStats = createServerFn({ method: "GET" }).handler(
  async () => {
    const db = await getSurreal();
    const user = await getAuthenticatedUser();
    const userId = toRecordId(user.id, "user");
    const role = user.role as string | undefined;

    if (role === "business") {
      const [shifts, pendingClaims] = await db.query<[ShiftRow[], ClaimRow[]]>(
        `
        SELECT *,
          location_id.name AS location_name
        FROM shift
        WHERE posted_by = $userId
        ORDER BY created_at DESC;

        SELECT *,
          shift_id.title AS shift_title,
          shift_id.date AS shift_date
        FROM claim
        WHERE shift_id.posted_by = $userId AND status = "pending"
        ORDER BY created_at DESC;
        `,
        { userId }
      );

      return {
        type: "business" as const,
        myShiftsCount: shifts.length,
        pendingClaimsCount: pendingClaims.length,
        recentShifts: normalizeRecord<ShiftRow[]>(shifts.slice(0, 5)),
        pendingClaims: normalizeRecord<ClaimRow[]>(pendingClaims),
      };
    }

    // Default to worker
    const [myClaims, availableShiftsCount, userRows] = await db.query<
      [ClaimRow[], { count: number }[], { trust_score: number }[]]
    >(
      `
      SELECT *,
        shift_id.title AS shift_title,
        shift_id.date AS shift_date
      FROM claim
      WHERE worker_id = $userId AND status = "pending"
      ORDER BY created_at DESC;

      SELECT count() AS count FROM shift
      WHERE status = "open"
      GROUP ALL;

      SELECT trust_score FROM user WHERE id = $userId;
      `,
      { userId }
    );

    return {
      type: "worker" as const,
      pendingClaimsCount: myClaims.length,
      availableShiftsCount: availableShiftsCount[0]?.count ?? 0,
      trustScore: userRows[0]?.trust_score ?? 0,
      myClaims: normalizeRecord<ClaimRow[]>(myClaims.slice(0, 5)),
    };
  }
);

export const getMyShifts = createServerFn({ method: "GET" }).handler(
  async () => {
    const db = await getSurreal();
    const rawUserId = await getAuthenticatedUserId();
    const userId = toRecordId(rawUserId, "user");

    const [shifts] = await db.query<[ShiftRow[]]>(
      `
      SELECT *,
        location_id.name AS location_name,
        location_id.business_id.name AS business_name
      FROM shift
      WHERE posted_by = $userId
      ORDER BY created_at DESC
      `,
      { userId }
    );

    return normalizeRecord<ShiftRow[]>(shifts);
  }
);
