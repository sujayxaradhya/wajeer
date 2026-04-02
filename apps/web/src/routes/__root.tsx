import { QueryClientProvider } from "@tanstack/react-query";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { Toaster } from "@wajeer/ui/components/sonner";
import { lazy, Suspense } from "react";

import { RouteError, NotFoundError } from "../components/error-boundaries";
import { getUser } from "../functions/get-user";
import { queryClient } from "../lib/query-client";
import { SurrealProvider } from "../lib/surreal-provider";

import appCss from "../index.css?url";

const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null
    : lazy(() =>
        import("@tanstack/react-router-devtools").then((m) => ({
          default: m.TanStackRouterDevtools,
        }))
      );

type RouterContext = {
  session: { user: { id: string; name: string; email: string } } | null;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Shift Marketplace" },
      {
        name: "description",
        content:
          "Fill last-minute staffing gaps instantly. Workers pick up extra shifts on their terms.",
      },
      { property: "og:title", content: "Shift Marketplace" },
      {
        property: "og:description",
        content:
          "Post the shift. Your team claims it. Fill last-minute staffing gaps instantly.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "canonical", href: "https://wajeer.com" },
    ],
  }),

  beforeLoad: async () => {
    const { session } = await getUser();
    return { session: session ?? null };
  },

  errorComponent: ({ error }) => <RouteError error={error as Error} />,
  notFoundComponent: () => <NotFoundError />,

  shellComponent: RootShell,
  component: RootComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <SurrealProvider>
            <Suspense fallback={<GlobalLoading />}>{children}</Suspense>
            <Toaster richColors />
            {process.env.NODE_ENV !== "production" && (
              <Suspense>
                <TanStackRouterDevtools position="bottom-right" />
              </Suspense>
            )}
            <Scripts />
          </SurrealProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}

function GlobalLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

function RootComponent() {
  return <Outlet />;
}
