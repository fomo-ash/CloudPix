import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors border",
  {
    variants: {
      variant: {
        default:
          "border-[var(--color-steel)] text-[var(--color-fog)] bg-transparent",
        success:
          "border-[var(--color-status-success)]/30 text-[var(--color-status-success)] bg-transparent",
        warning:
          "border-[var(--color-status-warning)]/30 text-[var(--color-status-warning)] bg-transparent",
        error:
          "border-[var(--color-status-error)]/30 text-[var(--color-status-error)] bg-transparent",
        info: "border-[var(--color-status-info)]/30 text-[var(--color-status-info)] bg-transparent",
        processing:
          "border-[var(--color-status-processing)]/30 text-[var(--color-status-processing)] bg-transparent",
        outline:
          "border-[var(--color-steel)] text-[var(--color-fog)] bg-transparent",
        copper:
          "border-[var(--color-copper)]/30 text-[var(--color-copper)] bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
