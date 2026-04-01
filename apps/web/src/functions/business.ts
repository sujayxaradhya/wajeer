import { createServerFn } from "@tanstack/react-start";
import { getSurreal, normalizeRecord } from "@wajeer/db";
import type { Business } from "@wajeer/db";
import { z } from "zod";

import { requireAuth } from "@/middleware/auth";

const createBusinessSchema = z.object({
  name: z.string().min(1).max(100),
});

export const createBusiness = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .handler(async ({ data, context }) => {
    const validated = createBusinessSchema.parse(data);
    const db = await getSurreal();
    const userId = context.session.user.id;

    const [, , business] = await db.query<[null, unknown, Business]>(
      `LET $biz = (CREATE business CONTENT {
         name: $name,
         owner_id: type::record($userId)
       } RETURN *)[0];
       CREATE user_business CONTENT {
         user_id: type::record($userId),
         business_id: $biz.id,
         role: 'owner',
         trust_score: 4.5,
         reliability: 0.95,
         joined_at: time::now()
       };
       RETURN $biz`,
      { name: validated.name, userId }
    );

    return normalizeRecord<Business>(business);
  });

export const getMyBusinesses = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const db = await getSurreal();
    const userId = context.session.user.id;

    const [businesses] = await db.query<[Business[]]>(
      `SELECT * FROM business WHERE id IN (
         SELECT VALUE business_id FROM user_business WHERE user_id = type::record($userId)
       )`,
      { userId }
    );

    return normalizeRecord<Business[]>(businesses);
  });

const getBusinessSchema = z.object({
  business_id: z.string(),
});

export const getBusiness = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ data, context }) => {
    const validated = getBusinessSchema.parse(data);
    const db = await getSurreal();
    const userId = context.session.user.id;

    const [businesses] = await db.query<[Business[]]>(
      `SELECT * FROM business
       WHERE id = type::record($businessId)
       AND id IN (
         SELECT VALUE business_id FROM user_business WHERE user_id = type::record($userId)
       )`,
      { businessId: validated.business_id, userId }
    );

    if (!businesses[0]) {
      throw new Error("Business not found or not authorized");
    }
    return normalizeRecord<Business>(businesses[0]);
  });

const deleteBusinessSchema = z.object({
  business_id: z.string(),
});

export const deleteBusiness = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .handler(async ({ data, context }) => {
    const validated = deleteBusinessSchema.parse(data);
    const db = await getSurreal();
    const userId = context.session.user.id;

    const [bizRows] = await db.query<[{ id: string }[]]>(
      `SELECT id FROM business WHERE id = type::record($businessId) AND owner_id = type::record($userId)`,
      { businessId: validated.business_id, userId }
    );

    if (!bizRows[0]) {
      throw new Error("Not authorized to delete this business");
    }

    await db.query(
      `DELETE user_business WHERE business_id = type::record($businessId);
       DELETE type::record($businessId)`,
      { businessId: validated.business_id }
    );

    return { success: true };
  });
