import { env } from "@wajeer/env/server";
import { betterAuth } from "better-auth";

import { surrealAdapter } from "./surreal-adapter";

export function createAuth() {
  return betterAuth({
    database: surrealAdapter(),
    user: {
      fields: {
        emailVerified: "email_verified",
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
      additionalFields: {
        role: {
          type: "string",
          required: true,
          defaultValue: "worker",
        },
      },
    },
    session: {
      fields: {
        userId: "user_id",
        createdAt: "created_at",
        updatedAt: "updated_at",
        expiresAt: "expires_at",
        ipAddress: "ip_address",
        userAgent: "user_agent",
      },
    },
    account: {
      fields: {
        userId: "user_id",
        accountId: "account_id",
        providerId: "provider_id",
        accessToken: "access_token",
        refreshToken: "refresh_token",
        idToken: "id_token",
        accessTokenExpiresAt: "access_token_expires_at",
        refreshTokenExpiresAt: "refresh_token_expires_at",
        scope: "scope",
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
    },
    verification: {
      fields: {
        expiresAt: "expires_at",
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
    },
    emailVerification: {
      sendOnSignUp: false,
    },
    trustedOrigins: [env.CORS_ORIGIN],
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      minPasswordLength: 8,
      maxPasswordLength: 256,
      autoSignIn: true,
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    advanced: {
      defaultCookieAttributes: {
        path: "/",
        sameSite: "lax",
        secure: false,
      },
    },
    plugins: [],
  });
}

export const auth = createAuth();
