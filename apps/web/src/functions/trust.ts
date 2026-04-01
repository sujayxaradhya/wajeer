import { createServerFn } from "@tanstack/react-start";
import { getSurreal, normalizeRecord } from "@wajeer/db";
import { z } from "zod";

import { requireAuth } from "@/middleware/auth";

export const getTrustScore = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const db = await getSurreal();
    const userId = context.session.user.id;

    const [rows] = await db.query<
      [
        {
          business_id: string;
          business_name: string;
          trust_score: number;
          reliability: number;
          role: string;
        }[],
      ]
    >(
      `SELECT
         business_id,
         business_id.name AS business_name,
         trust_score,
         reliability,
         role
       FROM user_business WHERE user_id = type::record($userId)`,
      { userId }
    );

    return normalizeRecord<typeof rows>(rows);
  });

const calculateTrustScoreSchema = z.object({
  user_id: z.string(),
  business_id: z.string(),
});

export const calculateTrustScore = createServerFn({ method: "POST" }).handler(
  async ({ data }) => {
    const validated = calculateTrustScoreSchema.parse(data);
    const db = await getSurreal();

    const [claims] = await db.query<
      [{ status: string; responded_at: string | null }[]]
    >(
      `SELECT status, responded_at FROM claim
       WHERE worker_id = type::record($userId)
       AND shift_id.location_id.business_id = type::record($businessId)`,
      { userId: validated.user_id, businessId: validated.business_id }
    );

    const totalClaims = claims.length;
    const approvedClaims = claims.filter((c) => c.status === "approved").length;
    const completedClaims = claims.filter(
      (c) => c.status === "approved" && c.responded_at !== null
    ).length;

    if (totalClaims === 0) {
      return { score: 4.5, completion_rate: 0, reliability: 0.95 };
    }

    const completionRate = completedClaims / totalClaims;
    const approvalRate = approvedClaims / totalClaims;
    const trustScore = completionRate * 0.6 + approvalRate * 0.4;
    const normalizedScore = Math.max(1, Math.min(5, trustScore * 5));

    return {
      score: normalizedScore,
      completion_rate: completionRate,
      reliability: completionRate,
    };
  }
);

export const updateTrustScore = createServerFn({ method: "POST" }).handler(
  async ({ data }) => {
    const validated = z
      .object({
        user_id: z.string(),
        business_id: z.string(),
        score: z.number(),
        reliability: z.number(),
      })
      .parse(data);
    const db = await getSurreal();

    await db.query(
      `UPDATE user_business SET trust_score = $score, reliability = $reliability
       WHERE user_id = type::record($userId) AND business_id = type::record($businessId)`,
      {
        userId: validated.user_id,
        businessId: validated.business_id,
        score: validated.score,
        reliability: validated.reliability,
      }
    );

    return { success: true };
  }
);
