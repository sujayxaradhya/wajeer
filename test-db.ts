import { resolve } from "node:path";

import { config } from "dotenv";
config({ path: resolve(process.cwd(), ".env") });
import { getSurreal } from "./packages/db/src/index";

async function test() {
  try {
    const db = await getSurreal();
    console.log("Connected to SurrealDB!");
    const res = await db.query("SELECT * FROM session LIMIT 1");
    console.log("Session query result:", res);
  } catch (error) {
    console.error("Error:", error);
  }
}
test();
