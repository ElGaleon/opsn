import { ReactNode } from "react";
import { cn } from "@shared/lib/utils";

export function Stat({
  label,
  value,
  tone = "default",
  className,
}: {
  label: string;
  value: ReactNode;
  tone?: "default" | "good" | "bad";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-emerald-950/10 bg-white/95 p-3 shadow-sm shadow-emerald-950/5 sm:p-4",
        className,
      )}
    >
      <p className="truncate text-[11px] font-medium uppercase text-stone-500 sm:text-xs">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 truncate text-lg font-semibold leading-tight sm:mt-2 sm:text-xl",
          tone === "good" && "text-emerald-700",
          tone === "bad" && "text-amber-700",
          tone === "default" && "text-stone-950",
        )}
      >
        {value}
      </p>
    </div>
  );
}
