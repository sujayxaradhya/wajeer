import type { ColumnType, Generated, JSONColumnType } from "kysely";

export type Database = {
  account: AccountTable;
  business: BusinessTable;
  claim: ClaimTable;
  location: LocationTable;
  notification: NotificationTable;
  session: SessionTable;
  shift: ShiftTable;
  user: UserTable;
  user_business: UserBusinessTable;
  verification: VerificationTable;
};

export type UserTable = {
  created_at: ColumnType<Date, string | undefined, never>;
  email: string;
  // Better Auth stores emailVerified as boolean (false = unverified, true = verified)
  email_verified: boolean | null;
  id: Generated<string>;
  image: string | null;
  name: string;
  password_hash: string | null;
  roles: string[];
  trust_score: number;
  updated_at: ColumnType<Date, string, string>;
};

export type BusinessTable = {
  created_at: ColumnType<Date, string | undefined, never>;
  id: Generated<string>;
  name: string;
  owner_id: string;
};

export type LocationTable = {
  address: string;
  business_id: string;
  created_at: ColumnType<Date, string | undefined, never>;
  id: Generated<string>;
  name: string;
};

export type UserBusinessTable = {
  business_id: string;
  id: Generated<string>;
  invited_at: ColumnType<Date, string | undefined, never>;
  joined_at: ColumnType<Date, string | undefined, never>;
  location_id: string | null;
  reliability: number;
  role: "manager" | "owner" | "worker";
  trust_score: number;
  user_id: string;
};

export type ShiftTable = {
  created_at: ColumnType<Date, string | undefined, never>;
  date: string;
  end_time: string;
  hourly_rate: number | null;
  id: Generated<string>;
  location_id: string;
  notes: string | null;
  posted_by: string;
  role: string;
  start_time: string;
  status: "approved" | "cancelled" | "claimed" | "completed" | "open";
  title: string;
  updated_at: ColumnType<Date, string, string>;
};

export type ClaimTable = {
  claimed_at: ColumnType<Date, string | undefined, never>;
  id: Generated<string>;
  responded_at: ColumnType<Date, string, string> | null;
  shift_id: string;
  status: "approved" | "pending" | "rejected";
  worker_id: string;
};

export type NotificationTable = {
  body: string;
  created_at: ColumnType<Date, string | undefined, never>;
  data: JSONColumnType<Record<string, unknown>>;
  id: Generated<string>;
  read: boolean;
  title: string;
  type: "claim_approved" | "claim_rejected" | "shift_posted";
  user_id: string;
};

export type SessionTable = {
  created_at: Date;
  expires_at: Date;
  id: Generated<string>;
  ip_address: string | null;
  token: string;
  updated_at: Date;
  user_agent: string | null;
  user_id: string;
};

export type AccountTable = {
  access_token: string | null;
  access_token_expires_at: Date | null;
  account_id: string;
  created_at: Date;
  id: Generated<string>;
  id_token: string | null;
  // Better Auth stores the bcrypt-hashed password on the account record (credential provider)
  password: string | null;
  provider_id: string;
  refresh_token: string | null;
  refresh_token_expires_at: Date | null;
  scope: string | null;
  updated_at: Date;
  user_id: string;
};

export type VerificationTable = {
  created_at: Date;
  expires_at: Date;
  id: Generated<string>;
  identifier: string;
  updated_at: Date;
  value: string;
};

export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type Business = Selectable<BusinessTable>;
export type Location = Selectable<LocationTable>;
export type UserBusiness = Selectable<UserBusinessTable>;
export type Shift = Selectable<ShiftTable>;
export type NewShift = Insertable<ShiftTable>;
export type Claim = Selectable<ClaimTable>;
export type Notification = Selectable<NotificationTable>;

type Selectable<T> = {
  [K in keyof T]: T[K] extends ColumnType<infer S, infer _I, infer _U>
    ? S
    : T[K];
};

type Insertable<T> = {
  [K in keyof T]: T[K] extends ColumnType<infer _S, infer I, infer _U>
    ? I
    : T[K];
};
