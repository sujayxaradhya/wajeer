import { resolve } from "node:path";

import { config } from "dotenv";
config({ path: resolve(process.cwd(), ".env") });
import { getSurreal } from "./packages/db/src/index";

async function test() {
  const db = await getSurreal();
  await db.query("DELETE FROM session");
  console.log("Sessions cleared");
}
test().catch(console.error);
