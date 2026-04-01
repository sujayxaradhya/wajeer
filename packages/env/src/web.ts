import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_BETTER_AUTH_URL: z.url().optional(),
    VITE_SURREALDB_URL: z.url().optional(),
    VITE_SURREALDB_NS: z.string().optional(),
    VITE_SURREALDB_DB: z.string().optional(),
  },
  runtimeEnv: (import.meta as any).env,
  emptyStringAsUndefined: true,
});
