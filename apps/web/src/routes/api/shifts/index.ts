import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@wajeer/auth";
import { getSurreal, normalizeRecord, toRecordId } from "@wajeer/db";

export const Route = createFileRoute("/api/shifts/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await auth.api.getSession({
          headers: request.headers,
        });

        if (!session?.user) {
          return new Response("Unauthorized", { status: 401 });
        }

        const url = new URL(request.url);
        const locationIdParam = url.searchParams.get("locationId");
        const status = url.searchParams.get("status");
        const role = url.searchParams.get("role");
        const userId = toRecordId(session.user.id, "user");

        const conditions: string[] = [
          `location_id IN (SELECT VALUE id FROM location WHERE business_id IN (SELECT VALUE business_id FROM user_business WHERE user_id = $userId))`,
        ];
        const params: Record<string, unknown> = { userId };

        if (locationIdParam) {
          conditions.push("location_id = $locationId");
          params.locationId = toRecordId(locationIdParam, "location");
        }
        if (status) {
          conditions.push("status = $status");
          params.status = status;
        }
        if (role) {
          conditions.push("role = $role");
          params.role = role;
        }

        const db = await getSurreal();
        const [shifts] = await db.query<[Record<string, unknown>[]]>(
          `SELECT * FROM shift WHERE ${conditions.join(" AND ")}`,
          params
        );

        return Response.json(normalizeRecord(shifts));
      },
    },
  },
});
