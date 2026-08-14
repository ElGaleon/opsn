import { Stat } from "@shared/components/Stat";
import { eur } from "@shared/lib/utils";
import { MoneyStats } from "../types/propertyTypes";

export function PropertyStats({ stats }: { stats: MoneyStats }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      <Stat label="Entrate" value={eur.format(stats.income)} />
      <Stat label="Uscite" value={eur.format(stats.expenses)} />
      <Stat
        label="Netto"
        value={eur.format(stats.net)}
        tone={stats.net >= 0 ? "good" : "bad"}
      />
    </div>
  );
}
