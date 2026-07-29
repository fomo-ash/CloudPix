import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-steel)] disabled:pointer-events-none disabled:opacity-40 cursor-pointer",
  {
    variants: {
      variant: {
        /* White pill — highest emphasis, scarce resource */
        default:
          "bg-[var(--color-pure-white)] text-[var(--color-obsidian)] hover:bg-[var(--color-bone)] rounded-full",
        /* Ghost outline — secondary action */
        secondary:
          "bg-transparent text-[var(--color-paper-white)] border border-[var(--color-paper-white)] hover:bg-[var(--color-paper-white)]/5 rounded-full",
        /* Steel outline — tertiary, muted */
        outline:
          "border border-[var(--color-steel)] bg-transparent text-[var(--color-fog)] hover:text-[var(--color-bone)] hover:border-[var(--color-mist)] rounded-full",
        /* Ghost — no border, no fill */
        ghost:
          "text-[var(--color-fog)] hover:text-[var(--color-bone)] hover:bg-[var(--color-carbon)] rounded-[var(--radius-sm)]",
        /* Destructive */
        destructive:
          "bg-[var(--color-status-error)] text-white hover:bg-[var(--color-status-error)]/90 rounded-full",
      },
      size: {
        default: "h-9 px-5 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-11 px-8 text-[15px]",
        icon: "h-9 w-9 rounded-[var(--radius-sm)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
