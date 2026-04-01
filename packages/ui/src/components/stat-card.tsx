import { cn } from "@wajeer/ui/lib/utils";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import type { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: ReactNode;
  className?: string;
};

export function StatCard({
  title,
  value,
  description,
  trend,
  icon,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "group rounded-lg border bg-card p-4 transition-all duration-normal motion-safe hover:shadow-md motion-safe hover:-translate-y-0.5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground truncate">{title}</p>
          <p className="mt-1 text-2xl font-display font-semibold tracking-tight">
            {value}
          </p>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
          {trend && (
            <div
              className={cn(
                "mt-2 flex items-center gap-1 text-xs font-medium",
                trend.isPositive
                  ? "text-status-approved"
                  : "text-status-cancelled"
              )}
            >
              {trend.isPositive ? (
                <ArrowUpIcon className="size-3" />
              ) : (
                <ArrowDownIcon className="size-3" />
              )}
              <span>{trend.value}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
