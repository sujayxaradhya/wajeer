import { createServerFn } from "@tanstack/react-start";
import { getSurreal, normalizeRecord } from "@wajeer/db";
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
    const userId = context.session.user.id;

    const [rows] = await db.query<[Shift[]]>(
      `CREATE shift CONTENT {
        location_id: type::record($locationId),
        posted_by: type::record($userId),
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
        locationId: data.location_id,
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
    const userId = context.session.user.id;

    const [shifts] = await db.query<[Shift[]]>(
      `SELECT * FROM shift WHERE id = type::record($shiftId) AND status = 'open'`,
      { shiftId: data.shift_id }
    );

    if (!shifts[0]) {
      throw new Error("Shift not available");
    }

    const [, claimRows] = await db.query<[Shift[], Claim[]]>(
      `UPDATE type::record($shiftId) SET status = 'claimed', updated_at = time::now();
       CREATE claim CONTENT {
         shift_id: type::record($shiftId),
         worker_id: type::record($userId),
         status: 'pending'
       } RETURN *`,
      { shiftId: data.shift_id, userId }
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
    const userId = context.session.user.id;

    const [claims] = await db.query<[(Claim & { business_id: string })[]]>(
      `SELECT *, shift_id.location_id.business_id AS business_id
       FROM claim WHERE id = type::record($claimId)`,
      { claimId: data.claim_id }
    );

    const claim = normalizeRecord<Claim & { business_id: string }>(claims[0]);
    if (!claim) {
      throw new Error("Not authorized to approve this claim");
    }

    const [authRows] = await db.query<[{ id: string }[]]>(
      `SELECT id FROM user_business
       WHERE user_id = type::record($userId)
       AND business_id = type::record($businessId)
       AND role IN ['owner', 'manager']`,
      { userId, businessId: claim.business_id }
    );

    if (!authRows[0]) {
      throw new Error("Not authorized to approve this claim");
    }

    await db.query(
      `UPDATE type::record($claimId) SET status = 'approved', responded_at = time::now();
       UPDATE type::record($shiftId) SET status = 'approved', updated_at = time::now();
       UPDATE user_business SET trust_score += 0.1
         WHERE user_id = type::record($workerId) AND business_id = type::record($businessId)`,
      {
        claimId: data.claim_id,
        shiftId: claim.shift_id,
        workerId: claim.worker_id,
        businessId: claim.business_id,
      }
    );

    return { success: true };
  });
