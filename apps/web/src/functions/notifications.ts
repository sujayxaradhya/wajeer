import { createServerFn } from "@tanstack/react-start";
import { getSurreal, normalizeRecord } from "@wajeer/db";
import type { Notification } from "@wajeer/db";
import { z } from "zod";

import { requireAuth } from "@/middleware/auth";

export const getNotifications = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const db = await getSurreal();
    const userId = context.session.user.id;

    const [notifications] = await db.query<[Notification[]]>(
      `SELECT * FROM notification WHERE user_id = type::record($userId) ORDER BY created_at DESC`,
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
    const userId = context.session.user.id;

    await db.query(
      `UPDATE notification SET read = true
       WHERE id = type::record($notifId) AND user_id = type::record($userId)`,
      { notifId: validated.notification_id, userId }
    );

    return { success: true };
  });

export const markNotificationUnread = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .handler(async ({ data, context }) => {
    const validated = markReadSchema.parse(data);
    const db = await getSurreal();
    const userId = context.session.user.id;

    await db.query(
      `UPDATE notification SET read = false
       WHERE id = type::record($notifId) AND user_id = type::record($userId)`,
      { notifId: validated.notification_id, userId }
    );

    return { success: true };
  });

export const markAllNotificationsRead = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const db = await getSurreal();
    const userId = context.session.user.id;

    await db.query(
      `UPDATE notification SET read = true
       WHERE user_id = type::record($userId) AND read = false`,
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

    const [rows] = await db.query<[Notification[]]>(
      `CREATE notification CONTENT {
         user_id: type::record($userId),
         type: $type,
         title: $title,
         body: $body,
         data: $notifData,
         read: false
       } RETURN *`,
      {
        userId: validated.user_id,
        type: validated.type,
        title: validated.title,
        body: validated.body,
        notifData: validated.data ?? {},
      }
    );

    return normalizeRecord<Notification>(rows[0]);
  }
);
