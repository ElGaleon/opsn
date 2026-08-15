import { ReactNode } from "react";
import { cn } from "@shared/lib/utils";

export type SummaryMetric = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: "default" | "good" | "bad";
  onClick?: () => void;
};

export function SummaryMetrics({
  items,
  columns = "auto",
}: {
  items: SummaryMetric[];
  columns?: "auto" | "four";
}) {
  return (
    <div
      className={cn(
        "grid gap-2 sm:gap-3",
        columns === "four"
          ? "grid-cols-2 xl:grid-cols-4"
          : "grid-cols-2 lg:grid-cols-3",
      )}
    >
      {items.map((item) => {
        const Comp = item.onClick ? "button" : "div";
        return (
        <Comp
          key={item.label}
          type={item.onClick ? "button" : undefined}
          onClick={item.onClick}
          className={cn(
            "rounded-lg border border-stone-200 bg-white p-3 text-left shadow-sm shadow-stone-950/5 sm:p-4",
            item.onClick && "transition hover:-translate-y-0.5 hover:border-emerald-700/25 hover:shadow-md",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[11px] font-medium uppercase text-stone-500 sm:text-xs">
                {item.label}
              </p>
              <p
                className={cn(
                  "mt-1 truncate text-xl font-semibold leading-tight sm:mt-2 sm:text-2xl",
                  item.tone === "good" && "text-emerald-700",
                  item.tone === "bad" && "text-amber-700",
                  (!item.tone || item.tone === "default") && "text-stone-950",
                )}
              >
                {item.value}
              </p>
            </div>
            {item.icon ? (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-stone-100 text-emerald-700">
                {item.icon}
              </div>
            ) : null}
          </div>
          {item.hint ? (
            <p className="mt-2 truncate text-xs text-stone-500">{item.hint}</p>
          ) : null}
        </Comp>
      )})}
    </div>
  );
}
