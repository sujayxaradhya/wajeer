"use client";

import { Link } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@wajeer/ui/components/sidebar";
import {
  CalendarIcon,
  BriefcaseIcon,
  ClockIcon,
  Building2Icon,
  UserIcon,
  BellIcon,
  LayoutDashboardIcon,
  Settings2Icon,
  PlusIcon,
} from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { authClient } from "@/lib/auth-client";

const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <LayoutDashboardIcon />,
  },
  {
    title: "My Shifts",
    url: "/dashboard/shifts",
    icon: <BriefcaseIcon />,
  },
  {
    title: "Available Shifts",
    url: "/dashboard/available",
    icon: <ClockIcon />,
  },
  {
    title: "Schedule",
    url: "/dashboard/schedule",
    icon: <CalendarIcon />,
  },
  {
    title: "Businesses",
    url: "/dashboard/businesses",
    icon: <Building2Icon />,
  },
];

const navSecondary = [
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: <UserIcon />,
  },
  {
    title: "Notifications",
    url: "/dashboard/notifications",
    icon: <BellIcon />,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: <Settings2Icon />,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = authClient.useSession();

  const user = session
    ? {
        name: session.user.name,
        email: session.user.email,
        avatar: session.user.image || "",
      }
    : {
        name: "Guest",
        email: "",
        avatar: "",
      };

  const role =
    session?.user && "role" in session.user
      ? (session.user.role as string)
      : undefined;

  const filteredNavMain = React.useMemo(
    () =>
      navMain.filter((item) => {
        if (role === "worker" && item.title === "Businesses") {
          return false;
        }
        if (
          role === "business" &&
          (item.title === "Available Shifts" || item.title === "Schedule")
        ) {
          return false;
        }
        return true;
      }),
    [role]
  );

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              asChild
            >
              <Link to="/dashboard">
                <PlusIcon className="size-5!" />
                <span className="text-base font-semibold">Wajeer</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} role={role} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
