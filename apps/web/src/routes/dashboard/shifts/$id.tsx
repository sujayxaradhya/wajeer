import { useMutation, useQuery } from "@tanstack/react-query";
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
import { ClaimBadge } from "@wajeer/ui/components/claim-badge";
import { EmptyState } from "@wajeer/ui/components/empty-state";
import { Separator } from "@wajeer/ui/components/separator";
import { Skeleton } from "@wajeer/ui/components/skeleton";
import { StatusBadge } from "@wajeer/ui/components/status-badge";
import { useState } from "react";
import { toast } from "sonner";

import { getClaimsForShift, rejectClaim } from "@/functions/claims";
import { approveClaim, getShiftById } from "@/functions/shifts";
import type { ClaimWithDetails, ShiftWithDetails } from "@/lib/types";

function ShiftDetailPage() {
  const { id } = Route.useParams();
  const [pendingAction, setPendingAction] = useState<{
    claimId: string;
    action: "approve" | "reject";
  } | null>(null);

  const { data: shift, isLoading: shiftLoading } = useQuery<ShiftWithDetails>({
    queryKey: ["shift", id],
    queryFn: async () => {
      const res = await getShiftById({ data: { shift_id: id } });
      return res as unknown as ShiftWithDetails;
    },
  });

  const {
    data: claims,
    isLoading: claimsLoading,
    refetch: refetchClaims,
  } = useQuery<ClaimWithDetails[]>({
    queryKey: ["claims", id],
    queryFn: async () => {
      const res = await getClaimsForShift({ data: { shift_id: id } });
      return res as unknown as ClaimWithDetails[];
    },
    enabled: !!shift,
  });

  const approveMutation = useMutation({
    mutationFn: (claimId: string) =>
      approveClaim({ data: { claim_id: claimId } }),
    onSuccess: () => {
      toast.success("Claim approved");
      refetchClaims();
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
      refetchClaims();
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

  if (shiftLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!shift) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <h1 className="font-display text-xl font-bold">Shift Not Found</h1>
        <Card className="border-destructive/50">
          <CardContent className="p-4">
            <p className="text-destructive text-sm">
              Shift not found or not authorized
            </p>
            <Link to="/dashboard/shifts">
              <Button variant="outline" size="sm" className="mt-2">
                Back to Shifts
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStatusIndex = timelineSteps.findIndex(
    (s) => s.status === shift.status
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard/shifts">Back</Link>
          </Button>
          <h1 className="font-display text-2xl font-semibold">
            {shift.title || shift.role}
          </h1>
          <StatusBadge status={shift.status as StatusBadge["status"]} />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard/shifts/$id/edit" params={{ id: shift.id }}>
              Edit
            </Link>
          </Button>
          {shift.status === "open" && (
            <Button variant="destructive" size="sm">
              Cancel Shift
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        {timelineSteps.map((step, index) => {
          const isActive = index <= currentStatusIndex;
          const isCurrent = index === currentStatusIndex;
          return (
            <div key={step.status} className="flex items-center gap-1">
              <div
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                  isCurrent && "bg-primary text-primary-foreground",
                  isActive && !isCurrent && "bg-muted text-foreground",
                  !isActive && "text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    isCurrent && "bg-primary-foreground",
                    isActive && !isCurrent && "bg-foreground",
                    !isActive && "bg-muted-foreground"
                  )}
                />
                {step.label}
              </div>
              {index < timelineSteps.length - 1 && (
                <Separator
                  className={cn(
                    "w-4",
                    index < currentStatusIndex ? "bg-foreground" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Shift Details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground text-xs">Date</p>
                <p className="text-sm font-medium tabular-nums">{shift.date}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Time</p>
                <p className="text-sm font-medium tabular-nums">
                  {shift.start_time} - {shift.end_time}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Role</p>
                <p className="text-sm font-medium capitalize">{shift.role}</p>
              </div>
              {shift.hourly_rate && (
                <div>
                  <p className="text-muted-foreground text-xs">Hourly Rate</p>
                  <p className="text-sm font-medium tabular-nums">
                    ${shift.hourly_rate}/hr
                  </p>
                </div>
              )}
              <div className="col-span-2">
                <p className="text-muted-foreground text-xs">Location</p>
                <p className="text-sm font-medium">{shift.location_name}</p>
              </div>
            </div>
            {shift.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-muted-foreground text-xs">Notes</p>
                  <p className="text-sm">{shift.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Claims ({claims?.length ?? 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {claimsLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : (!claims?.length ? (
              <EmptyState
                title="No claims yet"
                description="Workers will be notified about this shift"
              />
            ) : (
              <div className="flex flex-col gap-3">
                {claims.map((claim) => (
                  <div
                    key={claim.id}
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <ClaimBadge
                      workerName={claim.worker_name}
                      trustScore={claim.worker_trust_score}
                      claimedAt={
                        claim.claimed_at
                          ? new Date(claim.claimed_at).toLocaleDateString()
                          : undefined
                      }
                    />
                    {claim.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() =>
                            setPendingAction({
                              claimId: claim.id,
                              action: "approve",
                            })
                          }
                          disabled={
                            approveMutation.isPending ||
                            rejectMutation.isPending
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setPendingAction({
                              claimId: claim.id,
                              action: "reject",
                            })
                          }
                          disabled={
                            approveMutation.isPending ||
                            rejectMutation.isPending
                          }
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                    {claim.status === "approved" && (
                      <StatusBadge status="approved" size="sm" />
                    )}
                    {claim.status === "rejected" && (
                      <StatusBadge status="cancelled" size="sm" />
                    )}
                  </div>
                ))}
              </div>
            ))}
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
    </div>
  );
}
