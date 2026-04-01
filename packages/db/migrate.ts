#!/usr/bin/env bun
/**
 * SurrealDB Migration Runner
 *
 * Usage:
 *   bun run --filter @wajeer/db migrate
 *   bun run packages/db/migrate.ts
 */

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { getSurreal } from "@wajeer/db";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrationFile(
  db: Awaited<ReturnType<typeof getSurreal>>,
  filePath: string
) {
  console.log(`Running migration: ${filePath}`);
  const sql = readFileSync(filePath, "utf8");

  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  for (const statement of statements) {
    if (statement.trim()) {
      try {
        await db.query(statement);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!message.includes("already exists")) {
          console.error(
            `Error executing statement:\n${statement.slice(0, 100)}...\n`
          );
          throw error;
        }
      }
    }
  }
}

async function main() {
  const db = await getSurreal();
  const migrationsDir = join(__dirname, "migrations");

  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".surql"))
    .toSorted(); // alphabetical = chronological (001-, 002-, ...)

  for (const file of files) {
    await runMigrationFile(db, join(migrationsDir, file));
  }

  console.log("All migrations completed successfully!");

  const tables = await db.query("INFO FOR DB");
  console.log(
    "\nTables:",
    Object.keys(
      (tables[0] as { result: { tables: Record<string, unknown> } }).result
        ?.tables || {}
    )
  );
}

main();
