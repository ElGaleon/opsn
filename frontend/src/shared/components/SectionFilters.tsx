import { ReactNode } from "react";

export function SectionFilters({ filters }: { filters?: ReactNode }) {
  if (!filters) return null;
  return (
    <div className="rounded-lg border border-emerald-950/10 bg-white/80 p-2 shadow-sm shadow-emerald-950/5 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
      {filters}
    </div>
  );
}
