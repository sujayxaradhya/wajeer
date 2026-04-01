import { createServerFn } from "@tanstack/react-start";
import { getSurreal, normalizeRecord } from "@wajeer/db";

import { getAuthenticatedUserId } from "@/lib/server-auth";

export const getAvailableShifts = createServerFn({ method: "GET" }).handler(
  async () => {
    const db = await getSurreal();
    const userId = await getAuthenticatedUserId();

    const [shifts] = await db.query<[Record<string, unknown>[]]>(
      `SELECT *,
         location_id.name AS location_name,
         location_id.address AS location_address,
         location_id.business_id.name AS business_name
       FROM shift
       WHERE status = 'open'
       AND location_id IN (
         SELECT VALUE id FROM location
         WHERE business_id IN (
           SELECT VALUE business_id FROM user_business
           WHERE user_id = type::record($userId) AND role = 'worker'
         )
       )
       ORDER BY date ASC, start_time ASC`,
      { userId }
    );

    return normalizeRecord<Record<string, unknown>[]>(shifts);
  });

export const getMySchedule = createServerFn({ method: "GET" }).handler(
  async () => {
    const db = await getSurreal();
    const userId = await getAuthenticatedUserId();

    const [rows] = await db.query<[Record<string, unknown>[]]>(
      `SELECT
         shift_id AS id,
         id AS claim_id,
         shift_id.title AS title,
         shift_id.date AS date,
         shift_id.start_time AS start_time,
         shift_id.end_time AS end_time,
         shift_id.role AS role,
         shift_id.location_id.name AS location_name,
         shift_id.location_id.address AS location_address,
         shift_id.location_id.business_id.name AS business_name,
         shift_id.status AS status
       FROM claim
       WHERE worker_id = type::record($userId) AND status = 'approved'
       ORDER BY shift_id.date ASC, shift_id.start_time ASC`,
      { userId }
    );

    return normalizeRecord<Record<string, unknown>[]>(rows);
  });
