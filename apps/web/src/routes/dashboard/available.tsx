import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@wajeer/ui/components/button";
import { EmptyState } from "@wajeer/ui/components/empty-state";
import { SearchFilterBar } from "@wajeer/ui/components/search-filter-bar";
import { ShiftCard } from "@wajeer/ui/components/shift-card";
import { Skeleton } from "@wajeer/ui/components/skeleton";
import { cn } from "@wajeer/ui/lib/utils";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { getAvailableShifts } from "@/functions/available-shifts";
import { claimShift } from "@/functions/shifts";
import type { ShiftWithDetails } from "@/lib/types";

const skeletonKeys = [
  "skel-0",
  "skel-1",
  "skel-2",
  "skel-3",
  "skel-4",
  "skel-5",
];

function AvailableShiftsSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Skeleton className="h-10 flex-1 max-w-sm" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skeletonKeys.map((key) => (
          <Skeleton key={key} className="h-40" />
        ))}
      </div>
    </div>
  );
}

function AvailableShiftsPage() {
  const { data: shifts } = useSuspenseQuery<ShiftWithDetails[]>({
    queryKey: ["available-shifts"],
    queryFn: () => getAvailableShifts(),
  });
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const uniqueRoles = useMemo(
    () => [...new Set(shifts.map((s) => s.role))].toSorted(),
    [shifts]
  );

  const uniqueLocations = useMemo(
    () => [...new Set(shifts.map((s) => s.location_name))].toSorted(),
    [shifts]
  );

  const filteredShifts = useMemo(
    () =>
      shifts.filter((shift) => {
        const matchesSearch =
          !search ||
          shift.title.toLowerCase().includes(search.toLowerCase()) ||
          shift.role.toLowerCase().includes(search.toLowerCase()) ||
          shift.location_name.toLowerCase().includes(search.toLowerCase());

        const matchesRole = !roleFilter || shift.role === roleFilter;
        const matchesLocation =
          !locationFilter || shift.location_name === locationFilter;
        const matchesDate = !dateFilter || shift.date === dateFilter;

        return matchesSearch && matchesRole && matchesLocation && matchesDate;
      }),
    [shifts, search, roleFilter, locationFilter, dateFilter]
  );

  const handleClaim = useCallback(async (shiftId: string) => {
    setClaimingId(shiftId);
    try {
      await claimShift({ data: { shift_id: shiftId } });
      toast.success("Shift claimed — awaiting approval");
    } catch (error) {
      toast.error("Claim failed — try another shift", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setClaimingId(null);
    }
  }, []);

  const roleOptions = uniqueRoles.map((role) => ({
    label: role.charAt(0).toUpperCase() + role.slice(1),
    value: role,
  }));

  const locationOptions = uniqueLocations.map((loc) => ({
    label: loc,
    value: loc,
  }));

  const uniqueDates = useMemo(
    () => [...new Set(shifts.map((s) => s.date))].toSorted(),
    [shifts]
  );

  const dateOptions = uniqueDates.map((date) => ({
    label: new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
    value: date,
  }));

  const handleCardClick = useCallback(
    (shiftId: string) => {
      navigate({
        to: "/dashboard/shifts/$id",
        params: { id: shiftId },
      });
    },
    [navigate]
  );

  const handleQuickClaim = useCallback(
    (shiftId: string) => (e: React.MouseEvent) => {
      e.stopPropagation();
      handleClaim(shiftId);
    },
    [handleClaim]
  );

  if (!shifts?.length) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Available Shifts</h1>
          <p className="text-muted-foreground mt-1">
            Browse and claim open shifts from your connected businesses
          </p>
        </div>
        <EmptyState
          title="No shifts available"
          description="Check back soon — managers post shifts throughout the day"
          icon={
            <svg
              className="size-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Available Shifts</h1>
        <p className="text-muted-foreground mt-1">
          {shifts.length} {shifts.length === 1 ? "shift" : "shifts"} available
          to claim
        </p>
      </div>

      <SearchFilterBar
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Search by role, location...",
        }}
        filters={[
          {
            label: "All Roles",
            value: "role",
            options: [{ label: "All Roles", value: "" }, ...roleOptions],
            onChange: setRoleFilter,
          },
          {
            label: "All Locations",
            value: "location",
            options: [
              { label: "All Locations", value: "" },
              ...locationOptions,
            ],
            onChange: setLocationFilter,
          },
          {
            label: "All Dates",
            value: "date",
            options: [{ label: "All Dates", value: "" }, ...dateOptions],
            onChange: setDateFilter,
          },
        ]}
      />

      {filteredShifts.length === 0 ? (
        <EmptyState
          title="No matching shifts"
          description="Try adjusting your filters to see more results"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredShifts.map((shift) => (
            <ShiftCard
              key={shift.id}
              id={shift.id}
              title={shift.title}
              role={shift.role}
              date={new Date(shift.date).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              startTime={shift.start_time}
              endTime={shift.end_time}
              location={shift.location_name}
              hourlyRate={shift.hourly_rate ?? undefined}
              status={shift.status}
              claimsCount={shift.claims_count}
              onClick={() => handleCardClick(shift.id)}
              action={
                <Button
                  size="sm"
                  onClick={handleQuickClaim(shift.id)}
                  disabled={claimingId === shift.id}
                  className={cn(
                    claimingId === shift.id && "pointer-events-none opacity-50"
                  )}
                >
                  {claimingId === shift.id ? "Claiming..." : "Claim"}
                </Button>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/dashboard/available")({
  ssr: false,
  pendingComponent: AvailableShiftsSkeleton,
  component: AvailableShiftsPage,
});
