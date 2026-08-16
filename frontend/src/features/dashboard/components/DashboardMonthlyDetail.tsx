import { ArrowLeft, CalendarClock, TrendingUp, WalletCards } from "lucide-react";
import { useState } from "react";
import { Forecast, Movement } from "@shared/lib/api";
import { eur } from "@shared/lib/utils";
import { SectionPanel } from "@shared/components/SectionPanel";
import { Button } from "@shared/components/ui/button";
import { Select } from "@shared/components/ui/select";
import { Table, Td, Th } from "@shared/components/ui/table";
import { buildYearRows } from "@features/dashboard/utils/dashboardMetrics";
import {
  MetricCard,
} from "./DashboardShared";
import { currentYear, fullMonthLabel } from "./DashboardConfig";

function movementYears(movements: Movement[]) {
  return [
    ...new Set([
      currentYear,
      ...movements
        .map((movement) =>
          Number((movement.payment_date ?? movement.accrual_date).slice(0, 4)),
        )
        .filter(Boolean),
    ]),
  ].sort((a, b) => b - a);
}

export function MonthlyStatsDetail({
  forecast,
  movements,
  onBack,
}: {
  forecast: Forecast | null;
  movements: Movement[];
  onBack: () => void;
}) {
  const years = movementYears(movements);
  const [year, setYear] = useState(currentYear);
  const rows = buildYearRows(
    year,
    year === currentYear ? (forecast?.months ?? []) : [],
    movements,
  );
  const previousRows = buildYearRows(year - 1, [], movements);
  const total = rows.reduce((sum, row) => sum + row.incomeDone, 0);
  const previousTotal = previousRows.reduce(
    (sum, row) => sum + row.incomeDone,
    0,
  );
  const delta = previousTotal
    ? Math.round(((total - previousTotal) / previousTotal) * 100)
    : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-stone-950">
            Statistiche mensili
          </h2>
          <p className="text-sm text-stone-500">
            Confronto incassi mese per mese e con gli anni precedenti.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
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

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <MetricCard
          delay={0}
          icon={<WalletCards size={18} />}
          label={`Incassato ${year}`}
          value={eur.format(total)}
          tone="good"
        />
        <MetricCard
          delay={70}
          icon={<CalendarClock size={18} />}
          label={`Incassato ${year - 1}`}
          value={eur.format(previousTotal)}
        />
        <MetricCard
          delay={140}
          icon={<TrendingUp size={18} />}
          label="Variazione annua"
          value={delta === null ? "n.d." : `${delta > 0 ? "+" : ""}${delta}%`}
          tone={delta !== null && delta < 0 ? "bad" : "good"}
        />
      </div>

      <SectionPanel
        title={`Comparazione mensile ${year}`}
        className="motion-card"
        surface="plain"
      >
        <Table>
          <thead>
            <tr>
              <Th>Mese</Th>
              <Th>Incassato</Th>
              <Th>{year - 1}</Th>
              <Th>Differenza</Th>
              <Th>Previsto</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const previous = previousRows[index]?.incomeDone ?? 0;
              const difference = row.incomeDone - previous;
              return (
                <tr key={row.month}>
                  <Td className="capitalize font-semibold">
                    {fullMonthLabel.format(
                      new Date(`${row.month}-01T00:00:00`),
                    )}
                  </Td>
                  <Td className="text-emerald-700">
                    {eur.format(row.incomeDone)}
                  </Td>
                  <Td>{eur.format(previous)}</Td>
                  <Td
                    className={
                      difference < 0 ? "text-amber-700" : "text-emerald-700"
                    }
                  >
                    {eur.format(difference)}
                  </Td>
                  <Td>{eur.format(row.incomeDue)}</Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </SectionPanel>
    </div>
  );
}
