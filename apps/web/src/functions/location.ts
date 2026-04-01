import { createServerFn } from "@tanstack/react-start";
import { getSurreal, normalizeRecord } from "@wajeer/db";
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
    const userId = context.session.user.id;

    const [bizRows] = await db.query<[{ id: string }[]]>(
      `SELECT id FROM business WHERE id = type::record($businessId) AND owner_id = type::record($userId)`,
      { businessId: validated.business_id, userId }
    );

    if (!bizRows[0]) {
      throw new Error("Not authorized to create locations for this business");
    }

    const [rows] = await db.query<[Location[]]>(
      `CREATE location CONTENT {
         business_id: type::record($businessId),
         name: $name,
         address: $address
       } RETURN *`,
      {
        businessId: validated.business_id,
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
    const userId = context.session.user.id;

    const [memberRows] = await db.query<[{ id: string }[]]>(
      `SELECT id FROM user_business
       WHERE business_id = type::record($businessId) AND user_id = type::record($userId)`,
      { businessId: validated.business_id, userId }
    );

    if (!memberRows[0]) {
      throw new Error("Not authorized to view this business locations");
    }

    const [locations] = await db.query<[Location[]]>(
      `SELECT * FROM location WHERE business_id = type::record($businessId)`,
      { businessId: validated.business_id }
    );

    return normalizeRecord<Location[]>(locations);
  });

export const getLocation = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ data, context }) => {
    const validated = z.object({ location_id: z.string() }).parse(data);
    const db = await getSurreal();
    const userId = context.session.user.id;

    const [locations] = await db.query<[Location[]]>(
      `SELECT * FROM location
       WHERE id = type::record($locationId)
       AND business_id IN (
         SELECT VALUE business_id FROM user_business WHERE user_id = type::record($userId)
       )`,
      { locationId: validated.location_id, userId }
    );

    if (!locations[0]) {
      throw new Error("Location not found or not authorized");
    }
    return normalizeRecord<Location>(locations[0]);
  });
