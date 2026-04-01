import type {
  Business as DbBusiness,
  Claim as DbClaim,
  Location as DbLocation,
  Notification as DbNotification,
  Shift as DbShift,
  User as DbUser,
  UserBusiness as DbUserBusiness,
} from "@wajeer/db";

export type Role =
  | "server"
  | "cook"
  | "host"
  | "bartender"
  | "dishwasher"
  | "other";

export type ShiftStatus =
  | "open"
  | "claimed"
  | "approved"
  | "cancelled"
  | "completed";

export type ClaimStatus = "pending" | "approved" | "rejected";

export type User = DbUser;

export type Business = DbBusiness;

export type Location = DbLocation;

export type UserBusiness = DbUserBusiness;

export type Shift = DbShift;

export type Claim = DbClaim;

export type Notification = DbNotification;

export type DashboardStats = {
  total_shifts: number;
  open_shifts: number;
  claimed_shifts: number;
  completed_shifts: number;
  total_earnings: number;
  pending_claims: number;
};

export type AvailableShiftFilter = {
  status?: ShiftStatus;
  role?: Role;
  location_id?: string;
  date_from?: string;
  date_to?: string;
};

export type BusinessWithDetails = DbBusiness & {
  location_count: number;
  staff_count: number;
};

export type LocationWithDetails = DbLocation & {
  shift_count: number;
};

export type ShiftWithDetails = DbShift & {
  location_name: string;
  claims_count: number;
};

export type ClaimWithDetails = DbClaim & {
  worker_name: string;
  worker_trust_score: number;
  shift_title: string;
  shift_date: string;
  shift_start_time: string;
  shift_end_time: string;
  location_name: string;
};

export type NotificationWithType = DbNotification & {
  type_label: string;
};
