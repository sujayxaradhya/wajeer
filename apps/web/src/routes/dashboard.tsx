import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@wajeer/ui/components/sidebar";
import { TooltipProvider } from "@wajeer/ui/components/tooltip";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { getUser } from "@/functions/get-user";

function DashboardLayout() {
  return (
    <TooltipProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <Outlet />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async ({ location }) => {
    // Fetch session fresh instead of relying on stale context
    const { session } = await getUser();
    if (!session?.user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
    return { session };
  },
  component: DashboardLayout,
});
