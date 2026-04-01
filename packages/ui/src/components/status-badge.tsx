import { Badge } from "@wajeer/ui/components/badge";
import { cn } from "@wajeer/ui/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  open: {
    label: "Open",
    className: "bg-status-open text-status-open-foreground",
  },
  claimed: {
    label: "Claimed",
    className: "bg-status-claimed text-status-claimed-foreground",
  },
  approved: {
    label: "Approved",
    className: "bg-status-approved text-status-approved-foreground",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-status-cancelled text-status-cancelled-foreground",
  },
  completed: {
    label: "Completed",
    className: "bg-status-completed text-status-completed-foreground",
  },
};

const sizeVariants: Record<string, string> = {
  sm: "text-xs",
  md: "text-sm",
};

type StatusBadgeProps = {
  status: "open" | "claimed" | "approved" | "cancelled" | "completed";
  size?: "sm" | "md";
  className?: string;
};

export function StatusBadge({
  status,
  size = "md",
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.open;

  return (
    <Badge
      variant="secondary"
      className={cn(
        "gap-1.5",
        config?.className,
        sizeVariants[size],
        className
      )}
    >
      <span className="inline-block size-1.5 rounded-full bg-current" />
      {config?.label}
    </Badge>
  );
}
