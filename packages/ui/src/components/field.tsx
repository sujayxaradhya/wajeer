import { cn } from "@wajeer/ui/lib/utils";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";

const fieldGroupVariants = cva("flex", {
  defaultVariants: {
    spacing: 4,
  },
  variants: {
    spacing: {
      2: "gap-2",
      3: "gap-3",
      4: "gap-4",
      6: "gap-6",
    },
  },
});

const fieldVariants = cva("flex flex-col", {
  defaultVariants: {
    orientation: "vertical",
    spacing: 2,
  },
  variants: {
    orientation: {
      vertical: "flex-col",
      horizontal: "flex-row items-center gap-3",
    },
    spacing: {
      1: "gap-1",
      2: "gap-2",
      3: "gap-3",
    },
  },
});

function FieldGroup({
  className,
  spacing,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof fieldGroupVariants>) {
  return (
    <div
      className={cn(fieldGroupVariants({ spacing, className }))}
      {...props}
    />
  );
}

function Field({
  className,
  orientation,
  spacing,
  "data-invalid": dataInvalid,
  "data-disabled": dataDisabled,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof fieldVariants> & {
    "data-invalid"?: boolean;
    "data-disabled"?: boolean;
  }) {
  return (
    <div
      className={cn(
        fieldVariants({ orientation, spacing, className }),
        dataInvalid && "[&>label]:text-destructive [&>label]:text-destructive",
        dataDisabled &&
          "opacity-50 cursor-not-allowed [&>*]:pointer-events-none"
      )}
      data-invalid={dataInvalid}
      data-disabled={dataDisabled}
      {...props}
    />
  );
}

function FieldLabel({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p className={cn("text-muted-foreground text-xs", className)} {...props} />
  );
}

function FieldError({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-destructive text-xs font-medium", className)}
      {...props}
    />
  );
}

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return <fieldset className={cn("space-y-4", className)} {...props} />;
}

function FieldLegend({
  className,
  variant = "heading",
  ...props
}: React.ComponentProps<"legend"> & {
  variant?: "heading" | "label";
}) {
  return (
    <legend
      className={cn(
        variant === "heading" && "text-base font-semibold",
        variant === "label" && "text-sm font-medium"
      )}
      {...props}
    />
  );
}

export {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
};
