import { createServerFn } from "@tanstack/react-start";
import { getSurreal, normalizeRecord, toRecordId } from "@wajeer/db";
import type { Claim, Shift } from "@wajeer/db";
import { z } from "zod";

import { requireAuth } from "@/middleware/auth";

const postShiftSchema = z.object({
  date: z.string(),
  end_time: z.string(),
  hourly_rate: z.number().optional(),
  location_id: z.string(),
  notes: z.string().optional(),
  role: z.string(),
  start_time: z.string(),
  title: z.string(),
});

export const postShift = createServerFn({ method: "POST" })
  .inputValidator(postShiftSchema)
  .middleware([requireAuth])
  .handler(async ({ data, context }) => {
    const db = await getSurreal();
    const userId = toRecordId(context.session.user.id, "user");
    const locationId = toRecordId(data.location_id, "location");

    const [rows] = await db.query<[Shift[]]>(
      `CREATE shift CONTENT {
        location_id: $locationId,
        posted_by: $userId,
        role: $role,
        title: $title,
        date: $date,
        start_time: $startTime,
        end_time: $endTime,
        hourly_rate: $hourlyRate,
        notes: $notes,
        status: 'open'
      } RETURN *`,
      {
        locationId,
        userId,
        role: data.role,
        title: data.title,
        date: data.date,
        startTime: data.start_time,
        endTime: data.end_time,
        hourlyRate: data.hourly_rate ?? null,
        notes: data.notes ?? null,
      }
    );

    return normalizeRecord<Shift>(rows[0]);
  });

const claimShiftSchema = z.object({
  shift_id: z.string(),
});

export const claimShift = createServerFn({ method: "POST" })
  .inputValidator(claimShiftSchema)
  .middleware([requireAuth])
  .handler(async ({ data, context }) => {
    const db = await getSurreal();
    const userId = toRecordId(context.session.user.id, "user");
    const shiftId = toRecordId(data.shift_id, "shift");

    const [shifts] = await db.query<[Shift[]]>(
      `SELECT * FROM shift WHERE id = $shiftId AND status = 'open'`,
      { shiftId }
    );

    if (!shifts[0]) {
      throw new Error("Shift not available");
    }

    const [, claimRows] = await db.query<[Shift[], Claim[]]>(
      `UPDATE $shiftId SET status = 'claimed', updated_at = time::now();
       CREATE claim CONTENT {
         shift_id: $shiftId,
         worker_id: $userId,
         status: 'pending'
       } RETURN *`,
      { shiftId, userId }
    );

    return normalizeRecord<Claim>(claimRows[0]);
  });

const getShiftByIdSchema = z.object({
  shift_id: z.string(),
});

export const getShiftById = createServerFn({ method: "GET" })
  .inputValidator(getShiftByIdSchema)
  .middleware([requireAuth])
  .handler(async ({ data, context }) => {
    const db = await getSurreal();
    const userId = toRecordId(context.session.user.id, "user");
    const shiftId = toRecordId(data.shift_id, "shift");

    const [shifts] = await db.query<
      [
        (Shift & {
          location_name: string;
          claims_count: number;
        })[],
      ]
    >(
      `SELECT *,
         location_id.name AS location_name,
         0 AS claims_count
       FROM shift WHERE id = $shiftId`,
      { shiftId, userId }
    );

    const shift = normalizeRecord(shifts[0]);
    if (!shift) {
      throw new Error("Shift not found or not authorized");
    }

    return shift;
  });
