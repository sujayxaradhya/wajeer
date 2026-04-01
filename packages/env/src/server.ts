import { resolve } from "node:path";

import { createEnv } from "@t3-oss/env-core";
import { config } from "dotenv";
import { z } from "zod";

// Load env vars explicitly from project root
// In Vite SSR, process.cwd() is the apps/web directory
const envPath = resolve(process.cwd(), "../../.env");
console.log("[ENV] Loading env from:", envPath);
const result = config({ path: envPath });
console.log(
  "[ENV] Loaded:",
  result.parsed ? Object.keys(result.parsed) : "No env vars loaded"
);

export const env = createEnv({
  server: {
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    CORS_ORIGIN: z.url(),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    SURREALDB_URL: z.url(),
    SURREALDB_HOST: z.string(),
    SURREALDB_NS: z.string(),
    SURREALDB_DB: z.string(),
    SURREALDB_USER: z.string(),
    SURREALDB_PASS: z.string(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
