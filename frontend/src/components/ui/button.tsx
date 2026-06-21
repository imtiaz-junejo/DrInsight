import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-semibold transition-all duration-[.22s] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-blue text-white hover:bg-blue-dark hover:-translate-y-px",
        outline: "border-2 border-white/60 bg-transparent text-white hover:bg-white/10 hover:border-white",
        white: "bg-white text-blue-dark font-bold hover:-translate-y-0.5 hover:shadow-lg",
        ghost: "bg-transparent text-gray-600 hover:bg-blue-light hover:text-blue",
        secondary: "bg-blue-light text-blue hover:bg-blue/10",
      },
      size: {
        default: "h-11 px-7 py-3",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        full: "h-12 w-full px-7",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
