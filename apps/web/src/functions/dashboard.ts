import { createServerFn } from "@tanstack/react-start";
import { getSurreal, normalizeRecord } from "@wajeer/db";

import { getAuthenticatedUserId } from "@/lib/server-auth";

type ShiftRow = Record<string, string | number | boolean | null>;
type ClaimRow = Record<string, string | number | boolean | null>;

export const getDashboardStats = createServerFn({ method: "GET" }).handler(
  async () => {
    const db = await getSurreal();
    const userId = await getAuthenticatedUserId();

    const [myShifts, pendingClaims, availableShiftsCount, userRows] =
      await db.query<
        [ShiftRow[], ClaimRow[], { count: number }[], { trust_score: number }[]]
      >(
        `
      SELECT *,
        (SELECT name FROM location WHERE id = type::record($parent.location_id))[0] AS location_name
      FROM shift
      WHERE posted_by = type::record($userId)
      ORDER BY created_at DESC;

      SELECT *,
        (SELECT title FROM shift WHERE id = type::record($parent.shift_id))[0] AS shift_title,
        (SELECT date FROM shift WHERE id = type::record($parent.shift_id))[0] AS shift_date
      FROM claim
      WHERE worker_id = type::record($userId) AND status = "pending";

      SELECT count() AS count FROM shift
      WHERE status = "open"
      AND location_id IN (
        SELECT VALUE id FROM location
        WHERE business_id IN (
          SELECT VALUE business_id FROM user_business
          WHERE user_id = type::record($userId) AND role = "worker"
        )
      )
      GROUP ALL;

      SELECT trust_score FROM user WHERE id = type::record($userId);
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
  });

export const getMyShifts = createServerFn({ method: "GET" }).handler(
  async () => {
    const db = await getSurreal();
    const userId = await getAuthenticatedUserId();

    const [shifts] = await db.query<[ShiftRow[]]>(
      `
      SELECT *,
        (SELECT name FROM location WHERE id = type::record($parent.location_id))[0] AS location_name,
        (SELECT name FROM business
          WHERE id = type::record(
            (SELECT business_id FROM location WHERE id = type::record($parent.location_id))[0].business_id
          )
        )[0] AS business_name
      FROM shift
      WHERE posted_by = type::record($userId)
      ORDER BY created_at DESC
      `,
      { userId }
    );

    return normalizeRecord<ShiftRow[]>(shifts);
  });
