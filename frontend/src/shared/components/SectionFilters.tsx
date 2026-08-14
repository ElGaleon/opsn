import { ReactNode } from "react";
import { cn } from "@shared/lib/utils";

export function SectionFilters({
  filters,
  tone = "light",
}: {
  filters?: ReactNode;
  tone?: "light" | "dark";
}) {
  if (!filters) return null;
  return (
    <div
      className={cn(
        "rounded-lg border p-2 shadow-sm sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none",
        tone === "dark"
          ? "border-white/15 bg-white/10 shadow-black/10"
          : "border-emerald-950/10 bg-white/80 shadow-emerald-950/5",
      )}
    >
      {filters}
    </div>
  );
}
