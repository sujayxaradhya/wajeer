import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@wajeer/ui/components/select";
import { cn } from "@wajeer/ui/lib/utils";
import { SearchIcon } from "lucide-react";

type FilterOption = {
  label: string;
  value: string;
};

type FilterConfig = {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
};

type SearchFilterBarProps = {
  search: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  filters?: FilterConfig[];
  className?: string;
};

export function SearchFilterBar({
  search,
  filters,
  className,
}: SearchFilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="relative flex-1 max-w-sm">
        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search.value}
          onChange={(e) => search.onChange(e.currentTarget.value)}
          placeholder={search.placeholder ?? "Search..."}
          className="w-full rounded-lg border bg-background pl-9 pr-4 py-2 text-sm transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        />
      </div>
      {filters && filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <Select
              key={filter.value}
              onValueChange={(value: string | null) =>
                value && filter.onChange(value)
              }
            >
              <SelectTrigger className="w-fit min-w-32">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
      )}
    </div>
  );
}
