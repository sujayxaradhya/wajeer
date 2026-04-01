import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "@wajeer/auth";

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const request = getRequest();
  const session = await auth.api.getSession({ headers: request.headers });
  return next({
    context: { session },
  });
});

export const requireAuth = createMiddleware().server(async ({ next }) => {
  const request = getRequest();
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    throw new Error("Unauthorized: No valid session");
  }

  return next({
    context: { session },
  });
});
