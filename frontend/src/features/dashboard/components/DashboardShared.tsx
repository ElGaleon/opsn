import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { ReactNode } from "react";
import { eur } from "@shared/lib/utils";
import { Button } from "@shared/components/ui/button";
import { Select } from "@shared/components/ui/select";

export function MetricCard({
  icon,
  label,
  value,
  tone = "default",
  delay,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone?: "default" | "good" | "bad";
  delay: number;
  onClick?: () => void;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      className={`motion-card rounded-lg border border-emerald-950/10 bg-white/95 p-3 text-left shadow-sm shadow-emerald-950/5 sm:p-4 ${onClick ? "cursor-pointer transition hover:-translate-y-0.5 hover:border-emerald-700/30 hover:shadow-md" : ""}`}
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="rounded-md bg-emerald-50 p-1.5 text-emerald-700 sm:p-2">
          {icon}
        </div>
        <ArrowUpRight
          size={15}
          className={tone === "bad" ? "text-amber-600" : "text-emerald-700"}
        />
      </div>
      <p className="mt-2 truncate text-xs text-stone-500 sm:mt-4 sm:text-sm">
        {label}
      </p>
      <p
        className={`mt-1 truncate text-lg font-semibold sm:text-2xl ${tone === "good" ? "text-emerald-700" : tone === "bad" ? "text-amber-700" : "text-stone-950"}`}
      >
        {value}
      </p>
    </Comp>
  );
}

export function DetailHeader({
  title,
  subtitle,
  year,
  years,
  onYearChange,
  onBack,
}: {
  title: string;
  subtitle: string;
  year: number;
  years: number[];
  onYearChange: (year: number) => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl font-semibold text-stone-950">{title}</h2>
        <p className="text-sm text-stone-500">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <Select
          value={year}
          onChange={(event) => onYearChange(Number(event.target.value))}
        >
          {years.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft size={16} /> Dashboard
        </Button>
      </div>
    </div>
  );
}

export function KpiRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <p className="text-sm text-emerald-100">{label}</p>
      <p
        className={`text-xl font-semibold ${highlight ? "text-lime-200" : "text-white"}`}
      >
        {eur.format(value)}
      </p>
    </div>
  );
}
