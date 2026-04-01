import { createServerFn } from "@tanstack/react-start";
import { getSurreal, normalizeRecord, toRecordId } from "@wajeer/db";
import type { Claim } from "@wajeer/db";
import { z } from "zod";

import { requireAuth } from "@/middleware/auth";

const getClaimsForShiftSchema = z.object({
  shift_id: z.string(),
});

export const getClaimsForShift = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ data, context }) => {
    const validated = getClaimsForShiftSchema.parse(data);
    const db = await getSurreal();
    const userId = toRecordId(context.session.user.id, "user");
    const shiftId = toRecordId(validated.shift_id, "shift");

    const [shiftRows] = await db.query<[{ business_id: string }[]]>(
      `SELECT location_id.business_id AS business_id FROM shift WHERE id = $shiftId`,
      { shiftId }
    );

    const businessId = shiftRows[0]?.business_id;
    if (!businessId) {
      throw new Error("Shift not found");
    }

    const bizRecordId = toRecordId(businessId, "business");

    const [bizOwnerRows, ubRows] = await db.query<
      [{ id: string }[], { id: string }[]]
    >(
      `SELECT id FROM business WHERE id = $businessId AND owner_id = $userId;
       SELECT id FROM user_business
         WHERE business_id = $businessId
         AND user_id = $userId
         AND role IN ['owner', 'manager']`,
      { businessId: bizRecordId, userId }
    );

    if (!bizOwnerRows[0] && !ubRows[0]) {
      throw new Error("Not authorized to view claims for this shift");
    }

    const [claims] = await db.query<
      [(Claim & { worker_name: string; worker_trust_score: number })[]]
    >(
      `SELECT *,
         worker_id.name AS worker_name,
         worker_id.trust_score AS worker_trust_score
       FROM claim WHERE shift_id = $shiftId`,
      { shiftId }
    );

    return normalizeRecord<
      (Claim & { worker_name: string; worker_trust_score: number })[]
    >(claims);
  });

export const getMyClaims = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const db = await getSurreal();
    const userId = toRecordId(context.session.user.id, "user");

    const [claims] = await db.query<
      [
        (Claim & {
          shift_title: string;
          shift_date: string;
          shift_start_time: string;
          shift_end_time: string;
          shift_status: string;
          location_name: string;
        })[],
      ]
    >(
      `SELECT *,
         shift_id.title AS shift_title,
         shift_id.date AS shift_date,
         shift_id.start_time AS shift_start_time,
         shift_id.end_time AS shift_end_time,
         shift_id.status AS shift_status,
         shift_id.location_id.name AS location_name
       FROM claim WHERE worker_id = $userId
       ORDER BY claimed_at DESC`,
      { userId }
    );

    return normalizeRecord<typeof claims>(claims);
  });

const rejectClaimSchema = z.object({
  claim_id: z.string(),
  reason: z.string().optional(),
});

export const rejectClaim = createServerFn({ method: "POST" })
  .inputValidator(rejectClaimSchema)
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
      throw new Error("Not authorized to reject this claim");
    }

    const businessId = toRecordId(claim.business_id, "business");

    const [bizOwnerRows, ubRows] = await db.query<
      [{ id: string }[], { id: string }[]]
    >(
      `SELECT id FROM business WHERE id = $businessId AND owner_id = $userId;
       SELECT id FROM user_business
         WHERE business_id = $businessId
         AND user_id = $userId
         AND role IN ['owner', 'manager']`,
      { businessId, userId }
    );

    if (!bizOwnerRows[0] && !ubRows[0]) {
      throw new Error("Not authorized to reject this claim");
    }

    const shiftId = toRecordId(claim.shift_id, "shift");

    await db.query(
      `UPDATE $claimId SET status = 'rejected', responded_at = time::now();
       UPDATE $shiftId SET status = 'open', updated_at = time::now()`,
      { claimId, shiftId }
    );

    return { success: true };
  });
