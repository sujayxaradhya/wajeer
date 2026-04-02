import { getSurreal, RecordId, Table } from "@wajeer/db";
import { createAdapterFactory } from "better-auth/adapters";

const operatorMap: Record<string, string> = {
  eq: "=",
  ne: "!=",
  gt: ">",
  gte: ">=",
  lt: "<",
  lte: "<=",
};

function parseRecordId(value: string): { table: string; id: string } | null {
  if (typeof value !== "string") {
    return null;
  }
  const colonIndex = value.indexOf(":");
  if (colonIndex === -1) {
    return null;
  }
  const table = value.slice(0, colonIndex);
  const id = value.slice(colonIndex + 1);
  if (!table || !id) {
    return null;
  }
  return { table, id };
}

function normalizeRecord<T>(record: unknown): T {
  if (record === null || record === undefined) {
    return record as T;
  }
  if (
    record instanceof RecordId ||
    (record &&
      typeof record === "object" &&
      record.constructor?.name === "RecordId")
  ) {
    return record.toString() as unknown as T;
  }
  if (record instanceof Date) {
    return record as unknown as T;
  }
  if (
    record &&
    typeof record === "object" &&
    record.constructor?.name === "DateTime"
  ) {
    return new Date(
      (record as { toString(): string }).toString()
    ) as unknown as T;
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

function escapeValue(value: unknown): string {
  if (value instanceof RecordId) {
    return escapeValue(value.toString());
  }
  if (typeof value === "string") {
    const escaped = value
      .replaceAll('"', '\\"')
      .replaceAll("\n", "\\n")
      .replaceAll("\r", "\\r");
    return `"${escaped}"`;
  }
  if (typeof value === "number") {
    return String(value);
  }
  if (value === null) {
    return "NONE";
  }
  if (value === true) {
    return "true";
  }
  if (value === false) {
    return "false";
  }
  if (value instanceof Date) {
    return `"${value.toISOString()}"`;
  }
  if (Array.isArray(value) || typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

function buildWhereClause(
  where: { field: string; value: unknown; operator?: string }[]
): string {
  return where
    .map((clause) => {
      const operator = operatorMap[clause.operator ?? "eq"] ?? "=";
      return `${clause.field} ${operator} ${escapeValue(clause.value)}`;
    })
    .join(" AND ");
}

export const surrealAdapter = () =>
  createAdapterFactory({
    config: {
      adapterId: "surrealdb",
      adapterName: "SurrealDB",
      usePlural: false,
      supportsJSON: true,
      supportsDates: true,
      supportsBooleans: true,
      supportsNumericIds: false,
    },
    adapter: () => ({
      create: async <T extends Record<string, unknown>>({
        model,
        data,
      }: {
        model: string;
        data: T;
      }): Promise<T> => {
        const db = await getSurreal();
        const result = await db.insert(new Table(model), data);
        const record = result[0];
        if (!record) {
          return data;
        }
        return normalizeRecord<T>(record);
      },
      findOne: async <T>({
        model,
        where,
      }: {
        model: string;
        where: { field: string; value: unknown; operator?: string }[];
      }): Promise<T | null> => {
        const db = await getSurreal();
        const idClause = where.find((w) => w.field === "id");
        if (
          idClause &&
          typeof idClause.value === "string" &&
          where.length === 1
        ) {
          const parsed = parseRecordId(idClause.value);
          const recordId = parsed
            ? new RecordId(parsed.table, parsed.id)
            : new RecordId(model, idClause.value);
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await db.select(recordId as any);
            return normalizeRecord<T>(result);
          } catch {
            return null;
          }
        }
        const conditions = buildWhereClause(where);
        const query = `SELECT * FROM ${model} WHERE ${conditions} LIMIT 1`;
        const results = await db.query<[T[]]>(query);
        const rows = results[0];
        if (Array.isArray(rows) && rows.length > 0) {
          return normalizeRecord<T>(rows[0]);
        }
        return null;
      },
      findMany: async <T>({
        model,
        where,
        limit,
        offset,
        sortBy,
      }: {
        model: string;
        where?: { field: string; value: unknown; operator?: string }[];
        limit: number;
        offset?: number;
        sortBy?: { field: string; direction: "asc" | "desc" };
      }): Promise<T[]> => {
        const db = await getSurreal();
        let query = `SELECT * FROM ${model}`;
        if (where && where.length > 0) {
          query += ` WHERE ${buildWhereClause(where)}`;
        }
        if (sortBy) {
          query += ` ORDER BY ${sortBy.field} ${sortBy.direction.toUpperCase()}`;
        }
        query += ` LIMIT ${limit}`;
        if (offset) {
          query += ` START ${offset}`;
        }
        const results = await db.query<[T[]]>(query);
        const rows = results[0];
        return Array.isArray(rows)
          ? (rows as T[]).map((r) => normalizeRecord<T>(r))
          : [];
      },
      update: async <T>({
        model,
        where,
        update,
      }: {
        model: string;
        where: { field: string; value: unknown; operator?: string }[];
        update: T;
      }): Promise<T | null> => {
        const db = await getSurreal();
        const idClause = where.find((w) => w.field === "id");
        if (
          idClause &&
          typeof idClause.value === "string" &&
          where.length === 1
        ) {
          const parsed = parseRecordId(idClause.value);
          const recordId = parsed
            ? new RecordId(parsed.table, parsed.id)
            : new RecordId(model, idClause.value);
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await (db.update(recordId as any) as any).merge(
              update as Record<string, unknown>
            );
            return normalizeRecord<T>(result);
          } catch {
            return null;
          }
        }
        const conditions = buildWhereClause(where);
        const setClause = Object.entries(update as Record<string, unknown>)
          .map(([key, val]) => `${key} = ${escapeValue(val)}`)
          .join(", ");
        const query = `UPDATE ${model} SET ${setClause} WHERE ${conditions}`;
        const results = await db.query<[T[]]>(query);
        const rows = results[0];
        if (Array.isArray(rows) && rows.length > 0) {
          return update;
        }
        return null;
      },
      updateMany: async ({
        model,
        where,
        update,
      }: {
        model: string;
        where: { field: string; value: unknown; operator?: string }[];
        update: Record<string, unknown>;
      }): Promise<number> => {
        const db = await getSurreal();
        const conditions = buildWhereClause(where);
        const setClause = Object.entries(update)
          .map(([key, val]) => `${key} = ${escapeValue(val)}`)
          .join(", ");
        const query = `UPDATE ${model} SET ${setClause} WHERE ${conditions}`;
        const results = await db.query<[Record<string, unknown>[]]>(query);
        const rows = results[0];
        return Array.isArray(rows) ? rows.length : 0;
      },
      delete: async ({
        model,
        where,
      }: {
        model: string;
        where: { field: string; value: unknown; operator?: string }[];
      }): Promise<void> => {
        const db = await getSurreal();
        const idClause = where.find((w) => w.field === "id");
        if (
          idClause &&
          typeof idClause.value === "string" &&
          where.length === 1
        ) {
          const parsed = parseRecordId(idClause.value);
          const recordId = parsed
            ? new RecordId(parsed.table, parsed.id)
            : new RecordId(model, idClause.value);
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await db.delete(recordId as any);
          } catch {}
          return;
        }
        const conditions = buildWhereClause(where);
        const query = `DELETE FROM ${model} WHERE ${conditions}`;
        await db.query(query);
      },
      deleteMany: async ({
        model,
        where,
      }: {
        model: string;
        where: { field: string; value: unknown; operator?: string }[];
      }): Promise<number> => {
        const db = await getSurreal();
        const conditions = buildWhereClause(where);
        const query = `DELETE FROM ${model} WHERE ${conditions}`;
        const results = await db.query<[Record<string, unknown>[]]>(query);
        const rows = results[0];
        return Array.isArray(rows) ? rows.length : 0;
      },
      count: async ({
        model,
        where,
      }: {
        model: string;
        where?: { field: string; value: unknown; operator?: string }[];
      }): Promise<number> => {
        const db = await getSurreal();
        let query = `SELECT count() AS count FROM ${model}`;
        if (where && where.length > 0) {
          query += ` WHERE ${buildWhereClause(where)}`;
        }
        query += ` GROUP ALL`;
        const results = await db.query<[{ count: number }[]]>(query);
        const rows = results[0];
        if (Array.isArray(rows) && rows.length > 0) {
          return Number(rows[0]?.count ?? 0);
        }
        return 0;
      },
    }),
  });
