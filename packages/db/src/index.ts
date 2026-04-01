import { SurrealDbHttpDialect, SurrealKysely } from "kysely-surrealdb";
import { RecordId, Surreal, Table } from "surrealdb";

import type { Database } from "./schema";

export { RecordId, Table };

export type { Database } from "./schema";
export type {
  User,
  NewUser,
  Business,
  Location,
  UserBusiness,
  Shift,
  NewShift,
  Claim,
  Notification,
} from "./schema";

export function createKyselyConnection(config: {
  database: string;
  hostname: string;
  namespace: string;
  password: string;
  username: string;
}) {
  return new SurrealKysely<Database>({
    dialect: new SurrealDbHttpDialect({
      hostname: config.hostname,
      namespace: config.namespace,
      database: config.database,
      username: config.username,
      password: config.password,
      fetch: globalThis.fetch,
    }),
  });
}

export async function createSurrealConnection(config: {
  database: string;
  namespace: string;
  password: string;
  url: string;
  username: string;
}) {
  const db = new Surreal();
  await db.connect(config.url);
  await db.use({
    namespace: config.namespace,
    database: config.database,
  });
  await db.signin({
    username: config.username,
    password: config.password,
  });
  return db;
}

let kyselyInstance: SurrealKysely<Database> | null = null;
let surrealInstance: Surreal | null = null;

export async function getKysely(): Promise<SurrealKysely<Database>> {
  if (!kyselyInstance) {
    const { env } = await import("@wajeer/env/server");
    kyselyInstance = createKyselyConnection({
      hostname: env.SURREALDB_HOST,
      namespace: env.SURREALDB_NS,
      database: env.SURREALDB_DB,
      username: env.SURREALDB_USER,
      password: env.SURREALDB_PASS,
    });
  }
  return kyselyInstance;
}

export async function getSurreal(): Promise<Surreal> {
  if (!surrealInstance) {
    const { env } = await import("@wajeer/env/server");
    surrealInstance = await createSurrealConnection({
      url: env.SURREALDB_URL,
      namespace: env.SURREALDB_NS,
      database: env.SURREALDB_DB,
      username: env.SURREALDB_USER,
      password: env.SURREALDB_PASS,
    });
  }
  return surrealInstance;
}

export function resetConnections() {
  kyselyInstance = null;
  surrealInstance = null;
}

/**
 * Convert a string ID (e.g. "user:abc123" or just "abc123") into a
 * SurrealDB RecordId. Use this when binding query parameters instead
 * of `type::record()` casting in SurrealQL, because the SDK v2
 * auto-serializes string params matching `table:id` into RecordId
 * objects — making `type::record()` receive `[object Object]`.
 */
export function toRecordId(
  value: string,
  defaultTable?: string
): RecordId {
  const colonIdx = value.indexOf(":");
  if (colonIdx > 0) {
    const table = value.slice(0, colonIdx);
    const id = value.slice(colonIdx + 1);
    return new RecordId(table, id);
  }
  if (defaultTable) {
    return new RecordId(defaultTable, value);
  }
  throw new Error(
    `Cannot convert "${value}" to RecordId: no table prefix and no defaultTable provided`
  );
}

export function normalizeRecord<T>(record: unknown): T {
  if (record === null || record === undefined) {
    return record as T;
  }
  if (record instanceof RecordId) {
    return record.toString() as unknown as T;
  }
  if (Array.isArray(record)) {
    return record.map((item) => normalizeRecord(item)) as unknown as T;
  }
  if (typeof record === "object") {
    return Object.fromEntries(
      Object.entries(record as Record<string, unknown>).map(([k, v]) => [
        k,
        normalizeRecord(v),
      ])
    ) as T;
  }
  return record as T;
}
