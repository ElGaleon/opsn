import { ReactNode } from "react";
import { SectionHero } from "@shared/components/SectionHero";
import { SectionFilters } from "@shared/components/SectionFilters";
import { cn } from "@shared/lib/utils";

export function SectionPanel({
  title,
  actions,
  stats,
  filters,
  children,
  className,
  contentClassName,
  tone = "light",
  surface = "card",
}: {
  title: ReactNode;
  actions?: ReactNode;
  stats?: ReactNode;
  filters?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  tone?: "light" | "dark";
  surface?: "card" | "plain";
}) {
  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <SectionHero title={title} actions={actions} tone={tone}></SectionHero>
      {stats ? <div>{stats}</div> : null}
      <SectionFilters filters={filters} tone={tone}></SectionFilters>
      <div
        className={cn(
          surface === "card" && "rounded-lg border p-4 shadow-sm",
          surface === "card" &&
            (tone === "dark"
              ? "border-emerald-900 bg-emerald-800 shadow-emerald-950/10"
              : "border-emerald-950/10 bg-white/90 shadow-emerald-950/5"),
          className,
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
