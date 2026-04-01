import type { Shift } from "@wajeer/db/schema";

export type ShiftFilters = {
  locationId?: string;
  role?: string;
  status?: Shift["status"];
};

export const shiftKeys = {
  all: ["shifts"] as const,
  claims: (shiftId: string) => [...shiftKeys.all, "claims", shiftId] as const,
  detail: (id: string) => [...shiftKeys.all, "detail", id] as const,
  details: () => [...shiftKeys.all, "detail"] as const,
  list: (filters: ShiftFilters) => [...shiftKeys.lists(), filters] as const,
  lists: () => [...shiftKeys.all, "list"] as const,
};

export const userKeys = {
  all: ["users"] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
  trustScore: (id: string) => [...userKeys.all, "trustScore", id] as const,
};

export const businessKeys = {
  all: ["businesses"] as const,
  detail: (id: string) => [...businessKeys.all, "detail", id] as const,
  locations: (businessId: string) =>
    [...businessKeys.all, "locations", businessId] as const,
  workers: (locationId: string) =>
    [...businessKeys.all, "workers", locationId] as const,
};
