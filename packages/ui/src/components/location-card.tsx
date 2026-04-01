import { Badge } from "@wajeer/ui/components/badge";
import { cn } from "@wajeer/ui/lib/utils";
import { MapPin } from "lucide-react";
import { useCallback } from "react";

type LocationCardProps = {
  id: string;
  name: string;
  address: string;
  shiftCount: number;
  className?: string;
  onClick?: () => void;
};

export function LocationCard({
  name,
  address,
  shiftCount,
  className,
  onClick,
}: LocationCardProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        onClick?.();
      }
    },
    [onClick]
  );

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
      onKeyDown={onClick ? handleKeyDown : undefined}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-base truncate">
            {name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0" />
            <span className="truncate">{address}</span>
          </div>
        </div>
        <Badge
          variant="secondary"
          className="text-xs bg-status-open text-status-open-foreground"
        >
          {shiftCount} {shiftCount === 1 ? "shift" : "shifts"}
        </Badge>
      </div>
    </div>
  );
}
