import { Building2, CircleDollarSign, DoorOpen, TrendingDown } from "lucide-react";
import { SummaryMetrics } from "@shared/components/SummaryMetrics";
import { eur } from "@shared/lib/utils";
import { MoneyStats } from "../types/propertyTypes";

export function PropertyStats({
  stats,
  unitCount,
  onUnitsClick,
}: {
  stats: MoneyStats;
  unitCount?: number;
  onUnitsClick?: () => void;
}) {
  return (
    <SummaryMetrics
      columns={unitCount === undefined ? "auto" : "four"}
      items={[
        {
          label: "Entrate",
          value: eur.format(stats.income),
          icon: <CircleDollarSign size={18} />,
        },
        {
          label: "Uscite",
          value: eur.format(stats.expenses),
          icon: <TrendingDown size={18} />,
        },
        {
          label: "Netto",
          value: eur.format(stats.net),
          tone: stats.net >= 0 ? "good" : "bad",
          icon: <Building2 size={18} />,
        },
        ...(unitCount === undefined
          ? []
          : [
              {
                label: "Unità",
                value: unitCount,
                hint: unitCount === 1 ? "unità registrata" : "unità registrate",
                icon: <DoorOpen size={18} />,
                onClick: onUnitsClick,
              },
            ]),
      ]}
    />
  );
}
