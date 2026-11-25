import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-brand-navy text-brand-cream hover:bg-brand-navy-deep",
        secondary:
          "bg-transparent text-brand-navy border border-brand-navy/25 hover:border-brand-navy hover:bg-brand-navy/[0.04]",
        /** Superfícies claras (paper/card) — texto ink legível */
        ghost:
          "bg-transparent text-ink border border-ink/20 hover:bg-ink/[0.04] hover:border-ink/35",
        /** Superfícies escuras (navy/ink) — texto paper/cream */
        ghostDark:
          "bg-transparent text-brand-cream border border-brand-cream/40 hover:bg-brand-cream/10",
        outline:
          "border border-brand-navy/20 bg-transparent text-brand-ink hover:border-mata hover:text-mata",
        cream:
          "bg-brand-cream text-brand-navy border border-brand-navy/10 hover:bg-white",
        link: "text-latossolo underline-offset-4 hover:underline",
        accent:
          "bg-transparent text-latossolo border border-latossolo/40 hover:bg-latossolo/5",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-sm px-3 text-xs",
        lg: "h-12 rounded-sm px-8 text-base",
        icon: "h-10 w-10",
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
