import { ReactNode } from "react";

export function SectionHero({
  title,
  actions,
}: {
  title: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex w-full flex-col gap-2 rounded-lg border border-emerald-950/10 bg-white/70 p-3 shadow-sm shadow-emerald-950/5 sm:flex-row sm:items-center sm:justify-between sm:bg-transparent sm:p-0 sm:shadow-none sm:border-transparent">
      <h2 className="text-xl font-semibold text-stone-950 sm:text-2xl">
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
