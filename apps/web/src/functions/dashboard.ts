import { createServerFn } from "@tanstack/react-start";
import { getSurreal, normalizeRecord, toRecordId } from "@wajeer/db";

import { getAuthenticatedUserId } from "@/lib/server-auth";

type ShiftRow = Record<string, string | number | boolean | null>;
type ClaimRow = Record<string, string | number | boolean | null>;

export const getDashboardStats = createServerFn({ method: "GET" }).handler(
  async () => {
    const db = await getSurreal();
    const rawUserId = await getAuthenticatedUserId();
    const userId = toRecordId(rawUserId, "user");

    const [myShifts, pendingClaims, availableShiftsCount, userRows] =
      await db.query<
        [ShiftRow[], ClaimRow[], { count: number }[], { trust_score: number }[]]
      >(
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
      WHERE worker_id = $userId AND status = "pending";

      SELECT count() AS count FROM shift
      WHERE status = "open"
      AND location_id IN (
        SELECT VALUE id FROM location
        WHERE business_id IN (
          SELECT VALUE business_id FROM user_business
          WHERE user_id = $userId AND role = "worker"
        )
      )
      GROUP ALL;

      SELECT trust_score FROM user WHERE id = $userId;
      `,
        { userId }
      );

    return {
      myShiftsCount: myShifts.length,
      pendingClaimsCount: pendingClaims.length,
      availableShiftsCount: availableShiftsCount[0]?.count ?? 0,
      trustScore: userRows[0]?.trust_score ?? 0,
      recentShifts: normalizeRecord<ShiftRow[]>(myShifts.slice(0, 5)),
      pendingClaims: normalizeRecord<ClaimRow[]>(pendingClaims),
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
