import { cn } from "@wajeer/ui/lib/utils";
import { Building2Icon, UsersIcon } from "lucide-react";

type BusinessCardProps = {
  id: string;
  name: string;
  ownerName: string;
  locationCount: number;
  staffCount: number;
  className?: string;
  onClick?: () => void;
};

export function BusinessCard({
  name,
  ownerName,
  locationCount,
  staffCount,
  className,
  onClick,
}: BusinessCardProps) {
  return (
    <div
      className={cn(
        "group rounded-lg border bg-card p-4 transition-all duration-normal motion-safe hover:shadow-md motion-safe hover:-translate-y-0.5 cursor-pointer",
        onClick && "hover:border-primary/50",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-base truncate">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground truncate">{ownerName}</p>
        </div>
        <Building2Icon className="size-5 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors" />
      </div>
      <div className="mt-3 flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Building2Icon className="size-4" />
          <span>
            {locationCount} {locationCount === 1 ? "location" : "locations"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <UsersIcon className="size-4" />
          <span>
            {staffCount} {staffCount === 1 ? "staff" : "staff"}
          </span>
        </div>
      </div>
    </div>
  );
}
