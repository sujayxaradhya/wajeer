import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@wajeer/ui/components/badge";
import { Calendar } from "@wajeer/ui/components/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@wajeer/ui/components/card";
import { EmptyState } from "@wajeer/ui/components/empty-state";
import { Skeleton } from "@wajeer/ui/components/skeleton";
import { CalendarDaysIcon, ClockIcon, MapPinIcon } from "lucide-react";
import { useState } from "react";

import { getMySchedule } from "@/functions/available-shifts";

export const Route = createFileRoute("/dashboard/schedule")({
  ssr: false,
  pendingComponent: ScheduleSkeleton,
  component: SchedulePage,
});

function SchedulePage() {
  const { data: schedule } = useSuspenseQuery({
    queryKey: ["my-schedule"],
    queryFn: () => getMySchedule(),
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const shiftsByDate = schedule?.reduce(
    (acc, shift) => {
      const { date } = shift;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(shift);
      return acc;
    },
    {} as Record<string, typeof schedule>
  );

  const selectedDateStr = selectedDate?.toISOString().split("T")[0];
  const selectedShifts = selectedDateStr ? shiftsByDate?.[selectedDateStr] : [];

  const statusColors: Record<string, string> = {
    approved: "bg-blue-500/20 text-blue-400",
    completed: "bg-zinc-500/20 text-zinc-400",
    cancelled: "bg-red-500/20 text-red-400",
  };

  const shiftDates = schedule?.map((s) => new Date(s.date)) ?? [];

  if (!schedule?.length) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <h1 className="font-display text-2xl font-bold">My Schedule</h1>
        <EmptyState
          title="No upcoming shifts"
          description="Claim some available shifts to see them here."
          actionLabel="Find Shifts"
          onAction={() => (window.location.href = "/dashboard/available")}
          icon={<CalendarDaysIcon className="size-12" />}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="font-display text-2xl font-bold">My Schedule</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={{
                hasShift: shiftDates,
              }}
              modifiersStyles={{
                hasShift: {
                  fontWeight: "bold",
                  backgroundColor: "hsl(var(--primary) / 0.1)",
                },
              }}
              className="w-full"
            />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">
              {selectedDate
                ? selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })
                : "Select a date"}
            </h2>
            {selectedShifts?.length > 0 && (
              <Badge variant="secondary">
                {selectedShifts.length} shift
                {selectedShifts.length > 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          {!selectedShifts?.length ? (
            <EmptyState
              title="No shifts on this date"
              description="Select a highlighted date to view your shifts."
            />
          ) : (
            <div className="flex flex-col gap-3">
              {selectedShifts.map((shift) => (
                <Card key={shift.id}>
                  <CardContent className="flex items-start justify-between gap-4 p-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {shift.title ?? shift.role}
                        </p>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${statusColors[shift.status] ?? ""}`}
                        >
                          {shift.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                        <ClockIcon className="size-4" />
                        <span>
                          {shift.start_time} - {shift.end_time}
                        </span>
                      </div>
                      {shift.location_name && (
                        <div className="flex items-center gap-1.5 text-muted-foreground/70 text-xs">
                          <MapPinIcon className="size-3.5" />
                          <span>{shift.location_name}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Card className="lg:hidden">
        <CardHeader>
          <CardTitle>All Upcoming Shifts</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {schedule.map((shift) => (
            <div
              key={shift.id}
              className="flex items-start justify-between gap-4 rounded-lg border p-3"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">
                    {shift.title ?? shift.role}
                  </p>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${statusColors[shift.status] ?? ""}`}
                  >
                    {shift.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-xs">
                  {shift.date} · {shift.start_time} - {shift.end_time}
                </p>
                {shift.location_name && (
                  <p className="text-muted-foreground/70 text-xs">
                    {shift.location_name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function ScheduleSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="font-display text-2xl font-bold">My Schedule</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <Skeleton className="h-80" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    </div>
  );
}
