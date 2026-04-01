import { createServerFn } from "@tanstack/react-start";
import { getSurreal, normalizeRecord, toRecordId } from "@wajeer/db";
import type { Notification } from "@wajeer/db";
import { z } from "zod";

import { requireAuth } from "@/middleware/auth";

export const getNotifications = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const db = await getSurreal();
    const userId = toRecordId(context.session.user.id, "user");

    const [notifications] = await db.query<[Notification[]]>(
      `SELECT * FROM notification WHERE user_id = $userId ORDER BY created_at DESC`,
      { userId }
    );

    return normalizeRecord<Notification[]>(notifications);
  });

const markReadSchema = z.object({
  notification_id: z.string(),
});

export const markNotificationRead = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .handler(async ({ data, context }) => {
    const validated = markReadSchema.parse(data);
    const db = await getSurreal();
    const userId = toRecordId(context.session.user.id, "user");
    const notifId = toRecordId(validated.notification_id, "notification");

    await db.query(
      `UPDATE notification SET read = true
       WHERE id = $notifId AND user_id = $userId`,
      { notifId, userId }
    );

    return { success: true };
  });

export const markNotificationUnread = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .handler(async ({ data, context }) => {
    const validated = markReadSchema.parse(data);
    const db = await getSurreal();
    const userId = toRecordId(context.session.user.id, "user");
    const notifId = toRecordId(validated.notification_id, "notification");

    await db.query(
      `UPDATE notification SET read = false
       WHERE id = $notifId AND user_id = $userId`,
      { notifId, userId }
    );

    return { success: true };
  });

export const markAllNotificationsRead = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const db = await getSurreal();
    const userId = toRecordId(context.session.user.id, "user");

    await db.query(
      `UPDATE notification SET read = true
       WHERE user_id = $userId AND read = false`,
      { userId }
    );

    return { success: true };
  });

export const createNotification = createServerFn({ method: "POST" }).handler(
  async ({ data }) => {
    const validated = z
      .object({
        user_id: z.string(),
        type: z.enum(["shift_posted", "claim_approved", "claim_rejected"]),
        title: z.string(),
        body: z.string(),
        data: z.record(z.unknown()).optional(),
      })
      .parse(data);
    const db = await getSurreal();
    const userId = toRecordId(validated.user_id, "user");

    const [rows] = await db.query<[Notification[]]>(
      `CREATE notification CONTENT {
         user_id: $userId,
         type: $type,
         title: $title,
         body: $body,
         data: $notifData,
         read: false
       } RETURN *`,
      {
        userId,
        type: validated.type,
        title: validated.title,
        body: validated.body,
        notifData: validated.data ?? {},
      }
    );

    return normalizeRecord<Notification>(rows[0]);
  }
);
