import { createAuthClient } from "better-auth/react";

/**
 * Better Auth client configured for TanStack Start.
 *
 * The client is configured to work with TanStack Start's cookie-based session:
 * - Server uses `tanstackStartCookies()` plugin to set session cookies
 * - Client automatically includes credentials (cookies) in fetch requests
 * - Session is managed via cookies, not localStorage
 */
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BETTER_AUTH_URL,
  fetchOptions: {
    credentials: "include",
  },
});

export const { useSession } = authClient;
