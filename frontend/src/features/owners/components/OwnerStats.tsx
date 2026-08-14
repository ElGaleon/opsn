import { Stat } from "@shared/components/Stat";
import { eur } from "@shared/lib/utils";

export function OwnerStats({
  total,
  credits,
  debts,
}: {
  total: number;
  credits: number;
  debts: number;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      <Stat label="Saldo totale" value={eur.format(total)} />
      <Stat label="Crediti" value={eur.format(credits)} tone="good" />
      <Stat label="Debiti" value={eur.format(debts)} tone="bad" />
    </div>
  );
}
