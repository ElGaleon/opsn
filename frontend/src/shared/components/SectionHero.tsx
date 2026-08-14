import { ReactNode } from "react";
import { cn } from "@shared/lib/utils";

export function SectionHero({
  title,
  actions,
  tone = "light",
}: {
  title: ReactNode;
  actions?: ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2 rounded-lg border p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:border-transparent sm:bg-transparent sm:p-0 sm:shadow-none",
        tone === "dark"
          ? "border-white/15 bg-white/10 shadow-black/10"
          : "border-emerald-950/10 bg-white/70 shadow-emerald-950/5",
      )}
    >
      <h2
        className={cn(
          "text-xl font-semibold sm:text-2xl",
          tone === "dark" ? "text-white" : "text-stone-950",
        )}
      >
        {title}
      </h2>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:flex-nowrap">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
