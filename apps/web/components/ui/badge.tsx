import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-[var(--radius-full)] px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-accent-muted)] text-[var(--color-accent-hover)] border border-[var(--color-accent)]/20",
        success:
          "bg-[var(--color-status-success-muted)] text-[var(--color-status-success)] border border-[var(--color-status-success)]/20",
        warning:
          "bg-[var(--color-status-warning-muted)] text-[var(--color-status-warning)] border border-[var(--color-status-warning)]/20",
        error:
          "bg-[var(--color-status-error-muted)] text-[var(--color-status-error)] border border-[var(--color-status-error)]/20",
        info: "bg-[var(--color-status-info-muted)] text-[var(--color-status-info)] border border-[var(--color-status-info)]/20",
        processing:
          "bg-[var(--color-status-processing-muted)] text-[var(--color-status-processing)] border border-[var(--color-status-processing)]/20",
        outline:
          "border border-[var(--color-border)] text-[var(--color-text-secondary)]",
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
