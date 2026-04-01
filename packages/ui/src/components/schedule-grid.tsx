import { cn } from "@wajeer/ui/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback } from "react";

type Shift = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "open" | "claimed" | "approved" | "cancelled" | "completed";
  location: string;
};

type ScheduleGridProps = {
  shifts: Shift[];
  viewMode: "week" | "month";
  onShiftClick?: (shift: Shift) => void;
  className?: string;
};

const statusColors: Record<string, string> = {
  open: "bg-status-open text-status-open-foreground",
  claimed: "bg-status-claimed text-status-claimed-foreground",
  approved: "bg-status-approved text-status-approved-foreground",
  cancelled: "bg-status-cancelled text-status-cancelled-foreground",
  completed: "bg-status-completed text-status-completed-foreground",
};

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getWeekDays(referenceDate: Date): Date[] {
  const day = referenceDate.getDay();
  const start = new Date(referenceDate);
  start.setDate(start.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    return date;
  });
}

function getMonthDays(referenceDate: Date): Date[] {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay();
  const days: Date[] = [];
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - startOffset);
  const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7;
  for (let i = 0; i < totalCells; i += 1) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    days.push(date);
  }
  return days;
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function isSameMonth(date: Date, referenceDate: Date): boolean {
  return (
    date.getMonth() === referenceDate.getMonth() &&
    date.getFullYear() === referenceDate.getFullYear()
  );
}

function formatDate(date: Date): string {
  const parts = date.toISOString().split("T");
  return parts[0] ?? "";
}

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatWeekRange(dates: Date[]): string {
  const start = dates.at(0);
  const end = dates.at(6);
  if (!start || !end) {
    return "";
  }
  const startMonth = start.toLocaleDateString("en-US", { month: "short" });
  const endMonth = end.toLocaleDateString("en-US", { month: "short" });
  if (startMonth === endMonth) {
    return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${end.getFullYear()}`;
  }
  return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${end.getFullYear()}`;
}

function ShiftBar({
  shift,
  onClick,
  compact,
}: {
  shift: Shift;
  onClick?: (shift: Shift) => void;
  compact?: boolean;
}) {
  const colorClass = statusColors[shift.status] ?? statusColors.open;
  const handleClick = useCallback(() => {
    onClick?.(shift);
  }, [onClick, shift]);
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        onClick?.(shift);
      }
    },
    [onClick, shift]
  );

  return (
    <div
      className={cn(
        "rounded px-1.5 py-0.5 text-xs truncate cursor-pointer transition-all duration-normal motion-safe hover:opacity-80",
        colorClass,
        compact && "text-xs"
      )}
      onClick={handleClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      title={`${shift.title} (${shift.startTime} - ${shift.endTime})`}
    >
      {compact ? (
        <span className="truncate">{shift.title}</span>
      ) : (
        <div className="flex items-center gap-1">
          <span className="truncate font-medium">{shift.title}</span>
          <span className="opacity-75">
            {shift.startTime} - {shift.endTime}
          </span>
        </div>
      )}
    </div>
  );
}

function WeekView({
  shifts,
  onShiftClick,
}: {
  shifts: Shift[];
  onShiftClick?: (shift: Shift) => void;
}) {
  const weekDays = getWeekDays(new Date());

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="grid grid-cols-7 border-b">
        {dayNames.map((day) => (
          <div
            key={day}
            className="px-2 py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {weekDays.map((date) => {
          const dateStr = formatDate(date);
          const dayShifts = shifts.filter((s) => s.date === dateStr);
          const today = isToday(date);
          let dateNumberClass = "text-muted-foreground";
          if (today) {
            dateNumberClass =
              "flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground";
          }

          return (
            <div
              key={dateStr}
              className={cn(
                "min-h-24 border-r border-b p-1",
                today && "bg-primary/5"
              )}
            >
              <div className={cn("text-xs font-medium mb-1", dateNumberClass)}>
                {date.getDate()}
              </div>
              <div className="flex flex-col gap-1">
                {dayShifts.map((shift) => (
                  <ShiftBar
                    key={shift.id}
                    shift={shift}
                    onClick={onShiftClick}
                    compact
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthView({
  shifts,
  onShiftClick,
}: {
  shifts: Shift[];
  onShiftClick?: (shift: Shift) => void;
}) {
  const referenceDate = new Date();
  const monthDays = getMonthDays(referenceDate);

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="grid grid-cols-7 border-b">
        {dayNames.map((day) => (
          <div
            key={day}
            className="px-2 py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {monthDays.map((date) => {
          const dateStr = formatDate(date);
          const dayShifts = shifts.filter((s) => s.date === dateStr);
          const today = isToday(date);
          const currentMonth = isSameMonth(date, referenceDate);
          let dateNumberClass = "text-muted-foreground";
          if (today) {
            dateNumberClass =
              "flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground";
          } else if (!currentMonth) {
            dateNumberClass = "text-muted-foreground/40";
          }

          return (
            <div
              key={dateStr}
              className={cn(
                "min-h-20 border-r border-b p-1",
                today && "bg-primary/5",
                !currentMonth && "bg-muted/30"
              )}
            >
              <div className={cn("text-xs font-medium mb-1", dateNumberClass)}>
                {date.getDate()}
              </div>
              <div className="flex flex-col gap-1">
                {dayShifts.slice(0, 3).map((shift) => (
                  <ShiftBar
                    key={shift.id}
                    shift={shift}
                    onClick={onShiftClick}
                    compact
                  />
                ))}
                {dayShifts.length > 3 && (
                  <span className="text-xs text-muted-foreground px-1">
                    +{dayShifts.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ScheduleGrid({
  shifts,
  viewMode,
  onShiftClick,
  className,
}: ScheduleGridProps) {
  const currentDate = new Date();

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-lg">
          {viewMode === "week"
            ? formatWeekRange(getWeekDays(currentDate))
            : formatMonthYear(currentDate)}
        </h2>
        <div className="flex items-center gap-2">
          <ChevronLeft className="size-5 cursor-pointer text-muted-foreground hover:text-foreground" />
          <ChevronRight className="size-5 cursor-pointer text-muted-foreground hover:text-foreground" />
        </div>
      </div>

      {viewMode === "week" ? (
        <WeekView shifts={shifts} onShiftClick={onShiftClick} />
      ) : (
        <MonthView shifts={shifts} onShiftClick={onShiftClick} />
      )}
    </div>
  );
}
