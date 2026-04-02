import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@wajeer/ui/components/alert-dialog";
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
import { useState } from "react";
import { toast } from "sonner";

import { approveClaim, rejectClaim } from "@/functions/claims";
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

function BusinessDashboard({
  data,
}: {
  data: Extract<
    Awaited<ReturnType<typeof getDashboardStats>>,
    { type: "business" }
  >;
}) {
  const queryClient = useQueryClient();
  const [pendingAction, setPendingAction] = useState<{
    claimId: string;
    action: "approve" | "reject";
  } | null>(null);

  const approveMutation = useMutation({
    mutationFn: (claimId: string) =>
      approveClaim({ data: { claim_id: claimId } }),
    onSuccess: () => {
      toast.success("Claim approved");
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setPendingAction(null);
    },
    onError: (error) => {
      toast.error("Failed to approve claim", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
      setPendingAction(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (claimId: string) =>
      rejectClaim({ data: { claim_id: claimId } }),
    onSuccess: () => {
      toast.success("Claim rejected");
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setPendingAction(null);
    },
    onError: (error) => {
      toast.error("Failed to reject claim", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
      setPendingAction(null);
    },
  });

  const handleAction = () => {
    if (!pendingAction) {
      return;
    }
    if (pendingAction.action === "approve") {
      approveMutation.mutate(pendingAction.claimId);
    } else {
      rejectMutation.mutate(pendingAction.claimId);
    }
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
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
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button asChild size="lg">
          <Link to="/dashboard/shifts/new">
            <Plus data-icon="inline-start" />
            Post Shift
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/dashboard/shifts">
            <ClipboardList data-icon="inline-start" />
            My Shifts
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
                    key={shift.id as string}
                    title={shift.title as string}
                    role={(shift.role as string) ?? "unknown"}
                    date={shift.date as string}
                    startTime={shift.start_time as string}
                    endTime={shift.end_time as string}
                    location={(shift.location_name as string) ?? ""}
                    status={
                      shift.status as
                        | "open"
                        | "filled"
                        | "completed"
                        | "cancelled"
                    }
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Action Required</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/dashboard/shifts">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.pendingClaims.length === 0 ? (
              <EmptyState
                title="No pending claims"
                description="Worker claims on your shifts will appear here"
                icon={<Handshake className="size-8" />}
              />
            ) : (
              <div className="flex flex-col gap-3">
                {data.pendingClaims.map((claim) => (
                  <div
                    key={claim.id as string}
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-3",
                      "hover:bg-muted/50 transition-colors"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-display font-medium truncate">
                        {claim.shift_title as string}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {claim.shift_date as string}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() =>
                          setPendingAction({
                            claimId: claim.id as string,
                            action: "approve",
                          })
                        }
                        disabled={
                          approveMutation.isPending || rejectMutation.isPending
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setPendingAction({
                            claimId: claim.id as string,
                            action: "reject",
                          })
                        }
                        disabled={
                          approveMutation.isPending || rejectMutation.isPending
                        }
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={!!pendingAction}
        onOpenChange={(open) => !open && setPendingAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.action === "approve"
                ? "Approve Claim"
                : "Reject Claim"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.action === "approve"
                ? "This will assign the worker to the shift. Continue?"
                : "This will reject the worker's claim. Continue?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              variant={
                pendingAction?.action === "reject" ? "destructive" : "default"
              }
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function WorkerDashboard({
  data,
}: {
  data: Extract<
    Awaited<ReturnType<typeof getDashboardStats>>,
    { type: "worker" }
  >;
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Available Shifts"
          value={data.availableShiftsCount}
          icon={<CalendarDays className="size-5" />}
        />
        <StatCard
          title="My Pending Claims"
          value={data.pendingClaimsCount}
          icon={<Clock className="size-5" />}
        />
        <StatCard
          title="Trust Score"
          value={`${data.trustScore}%`}
          icon={<Shield className="size-5" />}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button asChild size="lg">
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
            <CardTitle>My Claims</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/dashboard/schedule">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.myClaims.length === 0 ? (
              <EmptyState
                title="No pending claims"
                description="Claims you make on shifts will appear here"
                actionLabel="Find Shifts"
                onAction={() => window.location.assign("/dashboard/available")}
                icon={<Handshake className="size-8" />}
              />
            ) : (
              <div className="flex flex-col gap-3">
                {data.myClaims.map((claim) => (
                  <div
                    key={claim.id as string}
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-3",
                      "hover:bg-muted/50 transition-colors"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-display font-medium truncate">
                        {claim.shift_title as string}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {claim.shift_date as string}
                      </p>
                    </div>
                    <span className="text-muted-foreground text-sm capitalize ml-3">
                      {claim.status as string}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function DashboardPage() {
  const { data } = useSuspenseQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => getDashboardStats(),
  });
  const today = new Date();

  if (!data) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-display font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-muted-foreground text-sm">{formatDate(today)}</p>
      </div>

      {data.type === "business" ? (
        <BusinessDashboard data={data} />
      ) : (
        <WorkerDashboard data={data} />
      )}
    </div>
  );
}

export const Route = createFileRoute("/dashboard/")({
  ssr: false,
  pendingComponent: DashboardSkeleton,
  component: DashboardPage,
});
