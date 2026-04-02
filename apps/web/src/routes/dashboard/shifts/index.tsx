import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@wajeer/ui/components/button";
import { EmptyState } from "@wajeer/ui/components/empty-state";
import { Input } from "@wajeer/ui/components/input";
import { ShiftCard } from "@wajeer/ui/components/shift-card";
import { Skeleton } from "@wajeer/ui/components/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@wajeer/ui/components/tabs";
import { useState } from "react";

import { getMyShifts } from "@/functions/dashboard";

export const Route = createFileRoute("/dashboard/shifts/")({
  ssr: false,
  pendingComponent: ShiftsSkeleton,
  component: ShiftsListPage,
});

const statusTabs = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "claimed", label: "Claimed" },
  { value: "approved", label: "Approved" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

function ShiftsListPage() {
  const { data: shifts } = useSuspenseQuery({
    queryKey: ["my-shifts"],
    queryFn: () => getMyShifts(),
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = (shifts ?? []).filter((shift) => {
    const matchesStatus =
      statusFilter === "all" || shift.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      shift.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shift.location_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (!shifts?.length) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-semibold">My Shifts</h1>
          <Link to="/dashboard/shifts/new">
            <Button>Post Shift</Button>
          </Link>
        </div>
        <EmptyState
          title="No shifts yet"
          description="Post your first shift to start filling last-minute gaps. Workers will be notified instantly."
          actionLabel="Post Your First Shift"
          onAction={() => (window.location.href = "/dashboard/shifts/new")}
          icon={
            <svg
              className="size-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">My Shifts</h1>
        <Link to="/dashboard/shifts/new">
          <Button>Post Shift</Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={statusFilter}
          onValueChange={setStatusFilter}
          className="w-full sm:w-auto"
        >
          <TabsList className="w-full sm:w-auto">
            {statusTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Input
          placeholder="Search by title or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-72"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No shifts found"
          description="Try adjusting your search or filter criteria."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((shift) => (
            <Link
              key={shift.id}
              to="/dashboard/shifts/$id"
              params={{ id: String(shift.id ?? "").replace(/^shift:/, "") }}
            >
              <ShiftCard
                id={shift.id}
                title={shift.title || shift.role}
                role={shift.role}
                date={shift.date}
                startTime={shift.start_time}
                endTime={shift.end_time}
                location={shift.location_name ?? "Unknown"}
                hourlyRate={shift.hourly_rate ?? undefined}
                status={shift.status}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function ShiftsSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-9 w-28" />
      </div>
      <Skeleton className="h-10 w-full sm:w-72" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    </div>
  );
}
