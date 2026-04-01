import { cn } from "@wajeer/ui/lib/utils";
import {
  BellIcon,
  CheckCircleIcon,
  ClockIcon,
  InfoIcon,
  AlertTriangleIcon,
  XCircleIcon,
} from "lucide-react";

const notificationTypeIcons: Record<string, typeof BellIcon> = {
  shift_claimed: ClockIcon,
  shift_approved: CheckCircleIcon,
  shift_posted: BellIcon,
  shift_cancelled: XCircleIcon,
  alert: AlertTriangleIcon,
  info: InfoIcon,
};

function formatRelativeTime(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) {
    return "Just now";
  }
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  return `${diffDays}d ago`;
}

type NotificationItemProps = {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
  onMarkRead?: (id: string) => void;
  onMarkUnread?: (id: string) => void;
  className?: string;
};

export function NotificationItem({
  id,
  type,
  title,
  body,
  read,
  createdAt,
  onMarkRead,
  onMarkUnread,
  className,
}: NotificationItemProps) {
  const Icon = notificationTypeIcons[type] ?? BellIcon;

  const handleClick = () => {
    if (read) {
      onMarkUnread?.(id);
    } else {
      onMarkRead?.(id);
    }
  };

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-lg border p-4 transition-colors cursor-pointer",
        !read && "bg-muted/30",
        "motion-safe hover:bg-muted/50",
        className
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
    >
      <div
        className={cn(
          "mt-0.5 shrink-0 rounded-full p-2",
          read ? "text-muted-foreground" : "text-primary"
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm font-medium truncate",
              !read && "text-foreground"
            )}
          >
            {title}
          </p>
          {!read && (
            <span className="shrink-0 size-2 rounded-full bg-primary mt-1.5" />
          )}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
          {body}
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          {formatRelativeTime(createdAt)}
        </p>
      </div>
    </div>
  );
}
