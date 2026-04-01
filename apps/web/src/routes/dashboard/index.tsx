import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@wajeer/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@wajeer/ui/components/card";
import { EmptyState } from "@wajeer/ui/components/empty-state";
import { ShiftCard } from "@wajeer/ui/components/shift-card";
import { Skeleton } from "@wajeer/ui/components/skeleton";
import { StatCard } from "@wajeer/ui/components/stat-card";
import { cn } from "@wajeer/ui/lib/utils";
import {
  CalendarDays,
  ClipboardList,
  Clock,
  Handshake,
  Plus,
  Search,
  Shield,
} from "lucide-react";

import { getDashboardStats } from "@/functions/dashboard";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`stat-${i}`} className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-2 h-8 w-16" />
              </div>
              <Skeleton className="size-5 rounded" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card py-4">
          <div className="px-4">
            <Skeleton className="h-5 w-28" />
          </div>
          <div className="px-4 mt-4">
            <div className="flex flex-col gap-3">
              {[0, 1, 2].map((key) => (
                <Skeleton key={`shift-${key}`} className="h-24 w-full" />
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card py-4">
          <div className="px-4">
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="px-4 mt-4">
            <div className="flex flex-col gap-3">
              {[0, 1, 2].map((key) => (
                <Skeleton key={`claim-${key}`} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardPage() {
  const { data } = useSuspenseQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => getDashboardStats(),
  });
  const today = new Date();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-display font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-muted-foreground text-sm">{formatDate(today)}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Shifts Posted"
          value={data.myShiftsCount}
          icon={<ClipboardList className="size-5" />}
        />
        <StatCard
          title="Pending Claims"
          value={data.pendingClaimsCount}
          icon={<Clock className="size-5" />}
        />
        <StatCard
          title="Available Shifts"
          value={data.availableShiftsCount}
          icon={<CalendarDays className="size-5" />}
        />
        <StatCard
          title="Trust Score"
          value={`${data.trustScore}%`}
          icon={<Shield className="size-5" />}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button asChild size="lg">
          <Link to="/dashboard/shifts/new">
            <Plus data-icon="inline-start" />
            Post Shift
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/dashboard/available">
            <Search data-icon="inline-start" />
            Browse Available
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/dashboard/schedule">
            <CalendarDays data-icon="inline-start" />
            View Schedule
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Shifts</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/dashboard/shifts">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.recentShifts.length === 0 ? (
              <EmptyState
                title="No shifts yet"
                description="Post your first shift to get started"
                actionLabel="Post Shift"
                onAction={() => window.location.assign("/dashboard/shifts/new")}
                icon={<ClipboardList className="size-8" />}
              />
            ) : (
              <div className="flex flex-col gap-3">
                {data.recentShifts.map((shift) => (
                  <ShiftCard
                    key={shift.id}
                    id={shift.id}
                    title={shift.title}
                    role={shift.role ?? "unknown"}
                    date={shift.date}
                    startTime={shift.start_time}
                    endTime={shift.end_time}
                    location={shift.location_name ?? ""}
                    status={shift.status}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Claims</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/dashboard/claims">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.pendingClaims.length === 0 ? (
              <EmptyState
                title="No pending claims"
                description="Claims you make on shifts will appear here"
                icon={<Handshake className="size-8" />}
              />
            ) : (
              <div className="flex flex-col gap-3">
                {data.pendingClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-3",
                      "hover:bg-muted/50 transition-colors"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-display font-medium truncate">
                        {claim.shift_title}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {claim.shift_date}
                      </p>
                    </div>
                    <span className="text-muted-foreground text-sm capitalize ml-3">
                      {claim.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/dashboard/")({
  ssr: false,
  pendingComponent: DashboardSkeleton,
  component: DashboardPage,
});
