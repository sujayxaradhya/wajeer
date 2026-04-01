import { Table } from "surrealdb";

import { getSurreal } from "./index";
import type { Shift } from "./schema";

export type ShiftNotification = {
  action: "CREATE" | "DELETE" | "UPDATE";
  result: Shift;
};

export async function subscribeToLocationShifts(
  locationId: string,
  onNotification: (notification: ShiftNotification) => void
) {
  const db = await getSurreal();

  const subscription = await db.live<Shift>(new Table("shift")).where({
    toSQL: (ctx) =>
      `location_id = type::record('location', ${ctx.def(locationId)}) AND status = 'open'`,
  });

  (async () => {
    for await (const notification of subscription) {
      onNotification(notification as unknown as ShiftNotification);
    }
  })();

  return subscription;
}

export async function subscribeToShiftsForRoles(
  roles: string[],
  onNotification: (notification: ShiftNotification) => void
) {
  const db = await getSurreal();

  const subscription = await db.live<Shift>(new Table("shift")).where({
    toSQL: (ctx) => `role IN ${ctx.def(roles)} AND status = 'open'`,
  });

  (async () => {
    for await (const notification of subscription) {
      onNotification(notification as unknown as ShiftNotification);
    }
  })();

  return subscription;
}

export async function subscribeToShiftClaims(
  shiftId: string,
  onNotification: (notification: unknown) => void
) {
  const db = await getSurreal();

  const subscription = await db.live<Shift>(new Table("shift")).where({
    toSQL: (ctx) => `id = type::record('shift', ${ctx.def(shiftId)})`,
  });

  (async () => {
    for await (const notification of subscription) {
      onNotification(notification);
    }
  })();

  return subscription;
}

export async function closeSubscription(subscription: unknown) {
  if (
    subscription &&
    typeof subscription === "object" &&
    "kill" in subscription
  ) {
    await (subscription as { kill: () => Promise<void> }).kill();
  }
}
