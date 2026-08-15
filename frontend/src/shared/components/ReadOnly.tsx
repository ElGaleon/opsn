import { ReactNode } from "react";

export function ReadOnly({
  label,
  value,
}: {
  label: string;
  value?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-emerald-950/10 bg-white/90 p-3 shadow-sm shadow-emerald-950/5">
      <p className="text-xs font-medium text-stone-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-stone-950">
        {value || "-"}
      </p>
    </div>
  );
}
