import { queryOptions } from "@tanstack/react-query";

import {
  getAvailableShifts,
  getMySchedule,
} from "@/functions/available-shifts";
import { getBusiness, getMyBusinesses } from "@/functions/business";
import { getDashboardStats, getMyShifts } from "@/functions/dashboard";
import { getBusinessLocations } from "@/functions/location";
import { getNotifications } from "@/functions/notifications";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: () => [...dashboardKeys.all, "stats"] as const,
  myShifts: () => [...dashboardKeys.all, "my-shifts"] as const,
};

export const shiftKeys = {
  all: ["shifts"] as const,
  available: () => [...shiftKeys.all, "available"] as const,
  schedule: () => [...shiftKeys.all, "schedule"] as const,
  detail: (id: string) => [...shiftKeys.all, "detail", id] as const,
};

export const businessKeys = {
  all: ["businesses"] as const,
  list: () => [...businessKeys.all, "list"] as const,
  detail: (id: string) => [...businessKeys.all, "detail", id] as const,
  locations: (businessId: string) =>
    [...businessKeys.all, "locations", businessId] as const,
};

export const notificationKeys = {
  all: ["notifications"] as const,
  list: () => [...notificationKeys.all, "list"] as const,
};

export const dashboardOptions = {
  stats: () =>
    queryOptions({
      queryKey: dashboardKeys.stats(),
      queryFn: () => getDashboardStats(),
      staleTime: 1000 * 60 * 2,
    }),

  myShifts: () =>
    queryOptions({
      queryKey: dashboardKeys.myShifts(),
      queryFn: () => getMyShifts(),
      staleTime: 1000 * 60 * 2,
    }),
};

export const shiftOptions = {
  available: () =>
    queryOptions({
      queryKey: shiftKeys.available(),
      queryFn: () => getAvailableShifts(),
      staleTime: 1000 * 30,
    }),

  schedule: () =>
    queryOptions({
      queryKey: shiftKeys.schedule(),
      queryFn: () => getMySchedule(),
      staleTime: 1000 * 60,
    }),
};

export const businessOptions = {
  list: () =>
    queryOptions({
      queryKey: businessKeys.list(),
      queryFn: () => getMyBusinesses(),
      staleTime: 1000 * 60 * 5,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: businessKeys.detail(id),
      queryFn: () => getBusiness({ data: { business_id: id } }),
      staleTime: 1000 * 60 * 5,
    }),

  locations: (businessId: string) =>
    queryOptions({
      queryKey: businessKeys.locations(businessId),
      queryFn: () =>
        getBusinessLocations({ data: { business_id: businessId } }),
      staleTime: 1000 * 60 * 5,
    }),
};

export const notificationOptions = {
  list: () =>
    queryOptions({
      queryKey: notificationKeys.list(),
      queryFn: () => getNotifications(),
      staleTime: 1000 * 30,
    }),
};
