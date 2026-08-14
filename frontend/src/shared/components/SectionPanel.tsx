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
}: {
  title: ReactNode;
  actions?: ReactNode;
  stats?: ReactNode;
  filters?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  tone?: "light" | "dark";
}) {
  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <SectionHero title={title} actions={actions} tone={tone}></SectionHero>
      {stats ? <div>{stats}</div> : null}
      <SectionFilters filters={filters} tone={tone}></SectionFilters>
      <div className={cn(className, contentClassName)}>{children}</div>
    </div>
  );
}
