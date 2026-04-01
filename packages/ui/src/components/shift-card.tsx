import { Badge } from "@wajeer/ui/components/badge";
import { cn } from "@wajeer/ui/lib/utils";

const statusVariants: Record<string, { label: string; className: string }> = {
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

type ShiftCardProps = {
  id: string;
  title: string;
  role: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  hourlyRate?: number;
  status: string;
  claimsCount?: number;
  className?: string;
  onClick?: () => void;
  action?: React.ReactNode;
};

export function ShiftCard({
  title,
  role,
  date,
  startTime,
  endTime,
  location,
  hourlyRate,
  status,
  claimsCount,
  className,
  onClick,
  action,
}: Omit<ShiftCardProps, "id">) {
  const variant = statusVariants[status.toLowerCase()] ?? statusVariants.open;

  return (
    <div
      className={cn(
        "group rounded-lg border bg-card p-4 transition-all duration-normal motion-safe hover:shadow-md cursor-pointer",
        onClick && "hover:border-primary/50",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="secondary"
              className={cn("text-xs", variant?.className)}
            >
              {variant?.label}
            </Badge>
            {claimsCount !== undefined && claimsCount > 0 && (
              <Badge variant="outline" className="text-xs">
                {claimsCount} {claimsCount === 1 ? "claim" : "claims"}
              </Badge>
            )}
          </div>
          <h3 className="font-display font-semibold text-base truncate">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm capitalize">{role}</p>
        </div>
        {action}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <svg
            className="size-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg
            className="size-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            {startTime} - {endTime}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg
            className="size-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="truncate">{location}</span>
        </div>
        {hourlyRate && (
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <svg
              className="size-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>${hourlyRate.toFixed(2)}/hr</span>
          </div>
        )}
      </div>
    </div>
  );
}
