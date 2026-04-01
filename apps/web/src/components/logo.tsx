import { cn } from "@wajeer/ui/lib/utils";

const sizeClasses = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-4xl",
};

type LogoProps = {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

export function Logo({ size = "md", className }: LogoProps) {
  return (
    <span
      className={cn(
        "font-logo text-primary tracking-tight",
        sizeClasses[size],
        className
      )}
    >
      WAJEER
    </span>
  );
}
