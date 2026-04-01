import { createServerFn } from "@tanstack/react-start";
import { getSurreal, normalizeRecord, toRecordId } from "@wajeer/db";
import type { Location } from "@wajeer/db";
import { z } from "zod";

import { requireAuth } from "@/middleware/auth";

const createLocationSchema = z.object({
  business_id: z.string(),
  name: z.string().min(1).max(100),
  address: z.string().min(1),
});

export const createLocation = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .handler(async ({ data, context }) => {
    const validated = createLocationSchema.parse(data);
    const db = await getSurreal();
    const userId = toRecordId(context.session.user.id, "user");
    const businessId = toRecordId(validated.business_id, "business");

    const [bizRows] = await db.query<[{ id: string }[]]>(
      `SELECT id FROM business WHERE id = $businessId AND owner_id = $userId`,
      { businessId, userId }
    );

    if (!bizRows[0]) {
      throw new Error("Not authorized to create locations for this business");
    }

    const [rows] = await db.query<[Location[]]>(
      `CREATE location CONTENT {
         business_id: $businessId,
         name: $name,
         address: $address
       } RETURN *`,
      {
        businessId,
        name: validated.name,
        address: validated.address,
      }
    );

    return normalizeRecord<Location>(rows[0]);
  });

const getBusinessLocationsSchema = z.object({
  business_id: z.string(),
});

export const getBusinessLocations = createServerFn({ method: "GET" })
  .inputValidator(getBusinessLocationsSchema)
  .middleware([requireAuth])
  .handler(async ({ data, context }) => {
    const validated = getBusinessLocationsSchema.parse(data);
    const db = await getSurreal();
    const userId = toRecordId(context.session.user.id, "user");
    const businessId = toRecordId(validated.business_id, "business");

    const [memberRows] = await db.query<[{ id: string }[]]>(
      `SELECT id FROM user_business
       WHERE business_id = $businessId AND user_id = $userId`,
      { businessId, userId }
    );

    if (!memberRows[0]) {
      throw new Error("Not authorized to view this business locations");
    }

    const [locations] = await db.query<[Location[]]>(
      `SELECT * FROM location WHERE business_id = $businessId`,
      { businessId }
    );

    return normalizeRecord<Location[]>(locations);
  });

export const getLocation = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ data, context }) => {
    const validated = z.object({ location_id: z.string() }).parse(data);
    const db = await getSurreal();
    const userId = toRecordId(context.session.user.id, "user");
    const locationId = toRecordId(validated.location_id, "location");

    const [locations] = await db.query<[Location[]]>(
      `SELECT * FROM location
       WHERE id = $locationId
       AND business_id IN (
         SELECT VALUE business_id FROM user_business WHERE user_id = $userId
       )`,
      { locationId, userId }
    );

    if (!locations[0]) {
      throw new Error("Location not found or not authorized");
    }
    return normalizeRecord<Location>(locations[0]);
  });
