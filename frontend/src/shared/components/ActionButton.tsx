import { ComponentProps, ReactNode } from "react";
import { Button } from "@shared/components/ui/button";
import { cn } from "@shared/lib/utils";

export function ActionButton({
  icon,
  label,
  className,
  ...props
}: ComponentProps<typeof Button> & {
  icon: ReactNode;
  label: string;
}) {
  return (
    <Button
      aria-label={label}
      title={label}
      className={cn("h-9 w-9 px-0 sm:w-auto sm:px-3", className)}
      {...props}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}
