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

const approveClaimSchema = z.object({
  claim_id: z.string(),
});

export const approveClaim = createServerFn({ method: "POST" })
  .inputValidator(approveClaimSchema)
  .middleware([requireAuth])
  .handler(async ({ data, context }) => {
    const db = await getSurreal();
    const userId = toRecordId(context.session.user.id, "user");
    const claimId = toRecordId(data.claim_id, "claim");

    const [claims] = await db.query<[(Claim & { business_id: string })[]]>(
      `SELECT *, shift_id.location_id.business_id AS business_id
       FROM claim WHERE id = $claimId`,
      { claimId }
    );

    const claim = normalizeRecord<Claim & { business_id: string }>(claims[0]);
    if (!claim) {
      throw new Error("Not authorized to approve this claim");
    }

    const businessId = toRecordId(claim.business_id, "business");

    const [authRows] = await db.query<[{ id: string }[]]>(
      `SELECT id FROM user_business
       WHERE user_id = $userId
       AND business_id = $businessId
       AND role IN ['owner', 'manager']`,
      { userId, businessId }
    );

    if (!authRows[0]) {
      throw new Error("Not authorized to approve this claim");
    }

    const shiftId = toRecordId(claim.shift_id, "shift");
    const workerId = toRecordId(claim.worker_id, "user");

    await db.query(
      `UPDATE $claimId SET status = 'approved', responded_at = time::now();
       UPDATE $shiftId SET status = 'approved', updated_at = time::now();
       UPDATE user_business SET trust_score += 0.1
         WHERE user_id = $workerId AND business_id = $businessId`,
      {
        claimId,
        shiftId,
        workerId,
        businessId,
      }
    );

    return { success: true };
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
       FROM shift WHERE id = $shiftId AND posted_by = $userId`,
      { shiftId, userId }
    );

    const shift = normalizeRecord(shifts[0]);
    if (!shift) {
      throw new Error("Shift not found or not authorized");
    }

    return shift;
  });
