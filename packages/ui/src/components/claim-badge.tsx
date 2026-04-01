import { Avatar, AvatarFallback } from "@wajeer/ui/components/avatar";
import { Badge } from "@wajeer/ui/components/badge";
import { cn } from "@wajeer/ui/lib/utils";

type ClaimBadgeProps = {
  workerName: string;
  trustScore?: number;
  reliability?: number;
  claimedAt?: string;
  className?: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getTrustColor(score?: number) {
  if (!score) {
    return "text-muted-foreground";
  }
  if (score >= 0.8) {
    return "text-status-approved";
  }
  if (score >= 0.5) {
    return "text-status-claimed";
  }
  return "text-status-cancelled";
}

export function ClaimBadge({
  workerName,
  trustScore,
  reliability,
  claimedAt,
  className,
}: ClaimBadgeProps) {
  return (
    <div
      className={cn("flex items-center gap-3 rounded-lg border p-3", className)}
    >
      <Avatar className="size-10">
        <AvatarFallback className="text-sm font-medium">
          {getInitials(workerName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{workerName}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {trustScore !== undefined && (
            <span className={cn("font-medium", getTrustColor(trustScore))}>
              {(trustScore * 100).toFixed(0)}% trust
            </span>
          )}
          {reliability !== undefined && (
            <span>{(reliability * 100).toFixed(0)}% reliable</span>
          )}
        </div>
      </div>
      {claimedAt && (
        <Badge variant="outline" className="text-xs">
          {claimedAt}
        </Badge>
      )}
    </div>
  );
}
