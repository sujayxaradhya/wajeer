import { createServerFn } from "@tanstack/react-start";
import { getSurreal, normalizeRecord, toRecordId } from "@wajeer/db";
import type { Business } from "@wajeer/db";
import { z } from "zod";

import { requireAuth } from "@/middleware/auth";

const createBusinessSchema = z.object({
  name: z.string().min(1).max(100),
});

export const createBusiness = createServerFn({ method: "POST" })
  .inputValidator(createBusinessSchema)
  .middleware([requireAuth])
  .handler(async ({ data, context }) => {
    const validated = createBusinessSchema.parse(data);
    const db = await getSurreal();
    const userId = toRecordId(context.session.user.id, "user");

    const [, , business] = await db.query<[null, unknown, Business]>(
      `LET $biz = (CREATE business CONTENT {
         name: $name,
         owner_id: $userId
       } RETURN *)[0];
       CREATE user_business CONTENT {
         user_id: $userId,
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

export type BusinessWithCounts = Business & {
  location_count: number;
  staff_count: number;
};

export const getMyBusinesses = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const db = await getSurreal();
    const userId = toRecordId(context.session.user.id, "user");

    const [businesses] = await db.query<[BusinessWithCounts[]]>(
      `SELECT *,
         array::len((SELECT id FROM location WHERE business_id = id)) AS location_count,
         array::len((SELECT id FROM user_business WHERE business_id = id)) AS staff_count
       FROM business WHERE id IN (
         SELECT VALUE business_id FROM user_business WHERE user_id = $userId
       )`,
      { userId }
    );

    return normalizeRecord<BusinessWithCounts[]>(businesses);
  });

const getBusinessSchema = z.object({
  business_id: z.string(),
});

export const getBusiness = createServerFn({ method: "GET" })
  .inputValidator(getBusinessSchema)
  .middleware([requireAuth])
  .handler(async ({ data, context }) => {
    const validated = getBusinessSchema.parse(data);
    const db = await getSurreal();
    const userId = toRecordId(context.session.user.id, "user");
    const businessId = toRecordId(validated.business_id, "business");

    const [businesses] = await db.query<[Business[]]>(
      `SELECT * FROM business
       WHERE id = $businessId
       AND id IN (
         SELECT VALUE business_id FROM user_business WHERE user_id = $userId
       )`,
      { businessId, userId }
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
  .inputValidator(deleteBusinessSchema)
  .middleware([requireAuth])
  .handler(async ({ data, context }) => {
    const validated = deleteBusinessSchema.parse(data);
    const db = await getSurreal();
    const userId = toRecordId(context.session.user.id, "user");
    const businessId = toRecordId(validated.business_id, "business");

    const [bizRows] = await db.query<[{ id: string }[]]>(
      `SELECT id FROM business WHERE id = $businessId AND owner_id = $userId`,
      { businessId, userId }
    );

    if (!bizRows[0]) {
      throw new Error("Not authorized to delete this business");
    }

    await db.query(
      `DELETE user_business WHERE business_id = $businessId;
       DELETE $businessId`,
      { businessId }
    );

    return { success: true };
  });
