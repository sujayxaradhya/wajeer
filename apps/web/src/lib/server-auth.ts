import { getRequest } from "@tanstack/react-start/server";
import { auth } from "@wajeer/auth";
import { RecordId } from "@wajeer/db";

function normalizeUserId(value: unknown): string | null {
  if (!value) return null;

  if (typeof value === "string") return value;

  if (value instanceof RecordId) {
    return value.toString();
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if ("tb" in record && "id" in record) {
      const table = record.tb;
      const id = record.id;
      if (
        typeof table === "string" &&
        (typeof id === "string" || typeof id === "number")
      ) {
        return `${table}:${id}`;
      }
    }
  }

  return null;
}

export async function getAuthenticatedUserId(): Promise<string> {
  const request = getRequest();
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    throw new Error("Unauthorized: No valid session");
  }

  const userId =
    normalizeUserId(session.user.id) ??
    normalizeUserId((session as Record<string, unknown>).session?.userId);

  if (!userId) {
    throw new Error("Unauthorized: Could not resolve user ID");
  }

  return userId;
}