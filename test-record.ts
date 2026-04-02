import { RecordId as ExternalRecordId } from "surrealdb";

import { getSurreal, RecordId } from "./packages/db/src/index";
async function test() {
  const { config } = await import("dotenv");
  const { resolve } = await import("node:path");
  config({ path: resolve(process.cwd(), ".env") });
  const db = await getSurreal();
  const res = await (db as any).query(
    "SELECT id, created_at FROM session LIMIT 1"
  );
  const { id } = res[0][0];
  const createdAt = res[0][0].created_at;
  console.log("Is id RecordId from src/index?:", id instanceof RecordId);
  console.log(
    "Is id RecordId from surrealdb?:",
    id instanceof ExternalRecordId
  );
  console.log(
    "id prototype name:",
    Object.getPrototypeOf(id)?.constructor?.name
  );
  console.log(
    "createdAt prototype name:",
    Object.getPrototypeOf(createdAt)?.constructor?.name
  );
}
test().catch(console.error);
