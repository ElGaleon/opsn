import { CalendarClock, Home, ReceiptText, TrendingUp, WalletCards } from "lucide-react";
import { useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Contract, Forecast, Movement, Unit } from "@shared/lib/api";
import { eur, formatDate } from "@shared/lib/utils";
import { SectionPanel } from "@shared/components/SectionPanel";
import { Table, Td, Th } from "@shared/components/ui/table";
import { arrearsAmount } from "@features/movements/utils/movementUtils";
import {
  buildOccupancyRows,
  buildYearRows,
} from "@features/dashboard/utils/dashboardMetrics";
import {
  DetailHeader,
  MetricCard,
} from "./DashboardShared";
import {
  baseChartOptions,
  currentYear,
  fullMonthLabel,
} from "./DashboardConfig";
import { MonthlyTable, MonthlyTrendChart } from "./DashboardOverview";

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

export function ForecastStatsDetail({
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
  const totals = rows.reduce(
    (sum, row) => ({
      incomeDue: sum.incomeDue + row.incomeDue,
      expenseDue: sum.expenseDue + row.expenseDue,
      incomeDone: sum.incomeDone + row.incomeDone,
      expenseDone: sum.expenseDone + row.expenseDone,
    }),
    { incomeDue: 0, expenseDue: 0, incomeDone: 0, expenseDone: 0 },
  );

  return (
    <div className="space-y-4">
      <DetailHeader
        title="Risultato previsto"
        subtitle="Entrate e uscite di competenza, mese per mese."
        year={year}
        years={years}
        onYearChange={setYear}
        onBack={onBack}
      />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        <MetricCard
          delay={0}
          icon={<TrendingUp size={18} />}
          label="Competenza netta"
          value={eur.format(totals.incomeDue - totals.expenseDue)}
          tone={totals.incomeDue >= totals.expenseDue ? "good" : "bad"}
        />
        <MetricCard
          delay={70}
          icon={<ReceiptText size={18} />}
          label="Entrate previste"
          value={eur.format(totals.incomeDue)}
          tone="good"
        />
        <MetricCard
          delay={140}
          icon={<CalendarClock size={18} />}
          label="Uscite previste"
          value={eur.format(totals.expenseDue)}
          tone="bad"
        />
        <MetricCard
          delay={210}
          icon={<WalletCards size={18} />}
          label="Margine previsto"
          value={
            totals.incomeDue
              ? `${Math.round(((totals.incomeDue - totals.expenseDue) / totals.incomeDue) * 100)}%`
              : "n.d."
          }
        />
      </div>
      <MonthlyTrendChart rows={rows} />
      <MonthlyTable rows={rows} year={year} />
    </div>
  );
}

export function CashflowStatsDetail({
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
  const totalIncome = rows.reduce((sum, row) => sum + row.incomeDone, 0);
  const totalExpenses = rows.reduce((sum, row) => sum + row.expenseDone, 0);
  const options: ApexOptions = {
    ...baseChartOptions(),
    colors: ["#087f5b"],
    stroke: { curve: "smooth", width: 3 },
  };

  return (
    <div className="space-y-4">
      <DetailHeader
        title="Cassa netta"
        subtitle="Solo movimenti effettivamente pagati o incassati."
        year={year}
        years={years}
        onYearChange={setYear}
        onBack={onBack}
      />
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <MetricCard
          delay={0}
          icon={<WalletCards size={18} />}
          label="Cassa netta"
          value={eur.format(totalIncome - totalExpenses)}
          tone={totalIncome >= totalExpenses ? "good" : "bad"}
        />
        <MetricCard
          delay={70}
          icon={<ReceiptText size={18} />}
          label="Incassato"
          value={eur.format(totalIncome)}
          tone="good"
        />
        <MetricCard
          delay={140}
          icon={<CalendarClock size={18} />}
          label="Pagato"
          value={eur.format(totalExpenses)}
          tone="bad"
        />
      </div>
      <SectionPanel title={`Andamento cassa ${year}`} className="motion-card">
        <Chart
          options={options}
          series={[
            {
              name: "Cassa netta",
              data: rows.map((row) => row.incomeDone - row.expenseDone),
            },
          ]}
          type="line"
          height={240}
        />
      </SectionPanel>
      <MonthlyTable rows={rows} year={year} />
    </div>
  );
}

export function ArrearsStatsDetail({
  movements,
  onBack,
}: {
  movements: Movement[];
  onBack: () => void;
}) {
  const unpaid = movements.filter(
    (movement) => movement.type === "income" && arrearsAmount(movement) > 0,
  );
  const years = [
    ...new Set([
      currentYear,
      ...unpaid
        .map((movement) =>
          Number((movement.due_date ?? movement.accrual_date).slice(0, 4)),
        )
        .filter(Boolean),
    ]),
  ].sort((a, b) => b - a);
  const [year, setYear] = useState(currentYear);
  const rows = Array.from({ length: 12 }, (_, index) => {
    const month = `${year}-${String(index + 1).padStart(2, "0")}`;
    return {
      month,
      amount: unpaid
        .filter(
          (movement) =>
            (movement.due_date ?? movement.accrual_date).slice(0, 7) === month,
        )
        .reduce((sum, movement) => sum + arrearsAmount(movement), 0),
    };
  });
  const total = rows.reduce((sum, row) => sum + row.amount, 0);
  const openCount = unpaid.filter((movement) =>
    (movement.due_date ?? movement.accrual_date).startsWith(String(year)),
  ).length;

  return (
    <div className="space-y-4">
      <DetailHeader
        title="Morosità"
        subtitle="Crediti aperti per mese e lista degli insoluti."
        year={year}
        years={years}
        onYearChange={setYear}
        onBack={onBack}
      />
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <MetricCard
          delay={0}
          icon={<ReceiptText size={18} />}
          label="Morosità anno"
          value={eur.format(total)}
          tone={total ? "bad" : "good"}
        />
        <MetricCard
          delay={70}
          icon={<CalendarClock size={18} />}
          label="Rate insolute"
          value={String(openCount)}
          tone={openCount ? "bad" : "good"}
        />
        <MetricCard
          delay={140}
          icon={<TrendingUp size={18} />}
          label="Mese peggiore"
          value={eur.format(Math.max(...rows.map((row) => row.amount), 0))}
          tone={total ? "bad" : "good"}
        />
      </div>
      <SectionPanel title={`Storico morosità ${year}`} className="motion-card">
        <Chart
          options={{
            ...baseChartOptions(),
            colors: ["#d97706"],
            plotOptions: { bar: { borderRadius: 8, columnWidth: "48%" } },
            stroke: { show: false },
          }}
          series={[{ name: "Morosità", data: rows.map((row) => row.amount) }]}
          type="bar"
          height={260}
        />
        <Table>
          <thead>
            <tr>
              <Th>Scadenza</Th>
              <Th>Descrizione</Th>
              <Th>Categoria</Th>
              <Th className="text-right">Importo</Th>
            </tr>
          </thead>
          <tbody>
            {unpaid
              .filter((movement) =>
                (movement.due_date ?? movement.accrual_date).startsWith(
                  String(year),
                ),
              )
              .map((movement) => (
                <tr key={movement.id}>
                  <Td>{formatDate(movement.due_date ?? movement.accrual_date)}</Td>
                  <Td>{movement.description}</Td>
                  <Td>{movement.category}</Td>
                  <Td className="text-right text-amber-700">
                    {eur.format(arrearsAmount(movement))}
                  </Td>
                </tr>
              ))}
          </tbody>
        </Table>
      </SectionPanel>
    </div>
  );
}

export function OccupancyStatsDetail({
  units,
  contracts,
  onBack,
}: {
  units: Unit[];
  contracts: Contract[];
  onBack: () => void;
}) {
  const contractYears = contracts
    .flatMap((contract) => [
      Number(contract.starts_on.slice(0, 4)),
      contract.ends_on ? Number(contract.ends_on.slice(0, 4)) : currentYear,
    ])
    .filter(Boolean);
  const years = [...new Set([currentYear, ...contractYears])].sort(
    (a, b) => b - a,
  );
  const [year, setYear] = useState(currentYear);
  const rows = buildOccupancyRows(year, units, contracts);
  const current = rows[new Date().getMonth()] ?? rows[0];
  const occupancyRate = units.length
    ? Math.round((current.rented / units.length) * 100)
    : 0;
  const options: ApexOptions = {
    ...baseChartOptions(),
    colors: ["#087f5b", "#d97706"],
    plotOptions: { bar: { borderRadius: 8, columnWidth: "48%" } },
    stroke: { show: false },
    tooltip: {
      theme: "light",
      y: { formatter: (value) => `${Math.round(Number(value))} unità` },
    },
    yaxis: {
      labels: {
        style: { colors: "#78716c" },
        formatter: (value) => String(Math.round(Number(value))),
      },
    },
  };

  return (
    <div className="space-y-4">
      <DetailHeader
        title="Situazione affitti"
        subtitle="Unità affittate e libere, con storico mensile."
        year={year}
        years={years}
        onYearChange={setYear}
        onBack={onBack}
      />
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <MetricCard
          delay={0}
          icon={<Home size={18} />}
          label="Affittate mese corrente"
          value={String(current.rented)}
          tone="good"
        />
        <MetricCard
          delay={70}
          icon={<Home size={18} />}
          label="Libere mese corrente"
          value={String(current.vacant)}
          tone={current.vacant ? "bad" : "good"}
        />
        <MetricCard
          delay={140}
          icon={<TrendingUp size={18} />}
          label="Occupazione"
          value={`${occupancyRate}%`}
          tone="good"
        />
      </div>
      <SectionPanel title={`Storico affitti ${year}`} className="motion-card">
        <Chart
          options={options}
          series={[
            { name: "Affittate", data: rows.map((row) => row.rented) },
            { name: "Libere", data: rows.map((row) => row.vacant) },
          ]}
          type="bar"
          height={300}
        />
        <Table>
          <thead>
            <tr>
              <Th>Mese</Th>
              <Th>Affittate</Th>
              <Th>Libere</Th>
              <Th>Occupazione</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.month}>
                <Td className="capitalize font-semibold">
                  {fullMonthLabel.format(new Date(`${row.month}-01T00:00:00`))}
                </Td>
                <Td className="text-emerald-700">{row.rented}</Td>
                <Td
                  className={row.vacant ? "text-amber-700" : "text-emerald-700"}
                >
                  {row.vacant}
                </Td>
                <Td>
                  {units.length
                    ? `${Math.round((row.rented / units.length) * 100)}%`
                    : "n.d."}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </SectionPanel>
    </div>
  );
}
