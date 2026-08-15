import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-700 text-white shadow-sm shadow-emerald-900/20 hover:bg-emerald-800",
        outline:
          "border border-emerald-950/10 bg-white/85 text-stone-800 hover:bg-emerald-50",
        ghost: "text-stone-700 hover:bg-emerald-50",
        destructive:
          "bg-red-600 text-white shadow-sm shadow-red-900/20 hover:bg-red-700",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Button({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant }), className)} {...props} />
  );
}
