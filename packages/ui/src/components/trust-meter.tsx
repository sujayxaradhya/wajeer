import { cn } from "@wajeer/ui/lib/utils";

type TrustMeterProps = {
  score: number;
  size?: number;
  label?: string;
  className?: string;
};

function getScoreColor(score: number) {
  if (score >= 0.8) {
    return "text-status-approved";
  }
  if (score >= 0.5) {
    return "text-status-claimed";
  }
  return "text-status-cancelled";
}

const circumference = 2 * Math.PI * 40;

export function TrustMeter({
  score,
  size = 48,
  label,
  className,
}: TrustMeterProps) {
  const clampedScore = Math.min(1, Math.max(0, score));
  const offset = circumference - clampedScore * circumference;
  const colorClass = getScoreColor(clampedScore);

  return (
    <div
      className={cn("relative inline-flex flex-col items-center", className)}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="-rotate-90"
      >
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/20"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn("transition-all duration-normal", colorClass)}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={cn("font-medium", colorClass)}
          style={{ fontSize: size * 0.25 }}
        >
          {(clampedScore * 100).toFixed(0)}%
        </span>
      </div>
      {label && (
        <span className="mt-1 text-xs text-muted-foreground">{label}</span>
      )}
    </div>
  );
}
