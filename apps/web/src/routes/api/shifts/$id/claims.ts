import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@wajeer/auth";
import { getSurreal, normalizeRecord, toRecordId } from "@wajeer/db";

export const Route = createFileRoute("/api/shifts/$id/claims")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const session = await auth.api.getSession({
          headers: request.headers,
        });

        if (!session?.user) {
          return new Response("Unauthorized", { status: 401 });
        }

        const userId = toRecordId(session.user.id, "user");
        const shiftId = toRecordId(params.id, "shift");
        const db = await getSurreal();

        const [bizOwnerRows, ubRows] = await db.query<
          [{ id: string }[], { id: string }[]]
        >(
          `SELECT id FROM business
           WHERE id = (SELECT VALUE location_id.business_id FROM shift WHERE id = $shiftId)[0]
           AND owner_id = $userId;
           SELECT id FROM user_business
           WHERE business_id = (SELECT VALUE location_id.business_id FROM shift WHERE id = $shiftId)[0]
           AND user_id = $userId
           AND role IN ['owner', 'manager']`,
          { shiftId, userId }
        );

        if (!bizOwnerRows[0] && !ubRows[0]) {
          return new Response("Forbidden", { status: 403 });
        }

        const [claims] = await db.query<[Record<string, unknown>[]]>(
          `SELECT *,
             worker_id.name AS worker_name,
             worker_id.trust_score AS worker_trust_score
           FROM claim WHERE shift_id = $shiftId`,
          { shiftId }
        );

        return Response.json(normalizeRecord(claims));
      },
    },
  },
});
