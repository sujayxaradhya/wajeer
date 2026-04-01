#!/usr/bin/env bun
/**
 * Verify SurrealDB tables were created
 */

import { getSurreal } from "@wajeer/db";

async function main() {
  const db = await getSurreal();

  const result = await db.query("INFO FOR DB");
  console.log("Database info:", JSON.stringify(result, null, 2));

  const tables = await db.query("SHOW TABLES");
  console.log("\nTables:", JSON.stringify(tables, null, 2));
}

main();
