import {
  ArrowLeft,
  ArrowUpRight,
  CalendarClock,
  Home,
  ReceiptText,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { ReactNode, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import {
  Contract,
  Forecast,
  Movement,
  Property,
  Summary,
  Unit,
} from "@shared/lib/api";
import { eur, formatDate } from "@shared/lib/utils";
import { MovementTable } from "@features/movements/components/MovementTable";
import { SectionPanel } from "@shared/components/SectionPanel";
import { Button } from "@shared/components/ui/button";
import { Select } from "@shared/components/ui/select";
import { Table, Td, Th } from "@shared/components/ui/table";
import { openAmount } from "@features/movements/utils/movementUtils";
import {
  buildExtraMetrics,
  buildOccupancyRows,
  buildYearRows,
  YearRow,
} from "@features/dashboard/utils/dashboardMetrics";

const currentYear = new Date().getFullYear();
const monthNames = Array.from({ length: 12 }, (_, index) =>
  new Intl.DateTimeFormat("it-IT", { month: "short" }).format(
    new Date(currentYear, index, 1),
  ),
);
const fullMonthLabel = new Intl.DateTimeFormat("it-IT", {
  month: "long",
  year: "numeric",
});

export function Dashboard({
  summary,
  properties,
  units,
  contracts,
  movements,
  forecast,
}: {
  summary: Summary | null;
  properties: Property[];
  units: Unit[];
  contracts: Contract[];
  movements: Movement[];
  forecast: Forecast | null;
}) {
  const [view, setView] = useState<
    "overview" | "monthly" | "forecast" | "cashflow" | "arrears" | "occupancy"
  >("overview");
  const rows = buildYearRows(currentYear, forecast?.months ?? [], movements);
  const arrears = Number(summary?.arrears ?? 0);
  const netAccrual = rows.reduce(
    (sum, row) => sum + row.incomeDue - row.expenseDue,
    0,
  );
  const cashflow = rows.reduce(
    (sum, row) => sum + row.incomeDone - row.expenseDone,
    0,
  );
  const incomeCash = rows.reduce((sum, row) => sum + row.incomeDone, 0);
  const monthIncome = rows[new Date().getMonth()]?.incomeDone ?? 0;
  const annual = rows.reduce(
    (total, row) => ({
      income: total.income + row.incomeDue,
      expenses: total.expenses + row.expenseDue,
      net: total.net + row.incomeDue - row.expenseDue,
      done: total.done + row.incomeDone - row.expenseDone,
    }),
    { income: 0, expenses: 0, net: 0, done: 0 },
  );
  const collectionRate = annual.income
    ? Math.min(100, Math.round((incomeCash / annual.income) * 100))
    : 0;
  const extra = buildExtraMetrics(
    properties,
    units,
    contracts,
    movements,
    rows,
    currentYear,
  );

  if (view === "monthly") {
    return (
      <MonthlyStatsDetail
        forecast={forecast}
        movements={movements}
        onBack={() => setView("overview")}
      />
    );
  }
  if (view === "forecast") {
    return (
      <ForecastStatsDetail
        forecast={forecast}
        movements={movements}
        onBack={() => setView("overview")}
      />
    );
  }
  if (view === "cashflow") {
    return (
      <CashflowStatsDetail
        forecast={forecast}
        movements={movements}
        onBack={() => setView("overview")}
      />
    );
  }
  if (view === "arrears") {
    return (
      <ArrearsStatsDetail
        movements={movements}
        onBack={() => setView("overview")}
      />
    );
  }
  if (view === "occupancy") {
    return (
      <OccupancyStatsDetail
        units={units}
        contracts={contracts}
        onBack={() => setView("overview")}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
        <MetricCard
          delay={0}
          icon={<CalendarClock size={18} />}
          label="Incasso mese"
          value={eur.format(monthIncome)}
          tone="good"
          onClick={() => setView("monthly")}
        />
        <MetricCard
          delay={70}
          icon={<WalletCards size={18} />}
          label="Cassa netta"
          value={eur.format(cashflow)}
          tone={cashflow >= 0 ? "good" : "bad"}
          onClick={() => setView("cashflow")}
        />
        <MetricCard
          delay={140}
          icon={<ReceiptText size={18} />}
          label="Morosità"
          value={eur.format(arrears)}
          tone={arrears ? "bad" : "good"}
          onClick={() => setView("arrears")}
        />
        <MetricCard
          delay={210}
          icon={<Home size={18} />}
          label="Occupazione"
          value={`${extra.occupancyRate}%`}
          onClick={() => setView("occupancy")}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.45fr]">
        <GrowthPanel
          netAccrual={netAccrual}
          incomeCash={incomeCash}
          collectionRate={collectionRate}
          rows={rows}
        />
        <MonthlyTrendChart rows={rows} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <AnnualPanel annual={annual} />
        <PerformancePanel rate={collectionRate} />
        <BarPanel rows={rows} topProperty={extra.topProperty} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <MonthlyTable rows={rows} year={currentYear} />
      </div>

      <div className="grid gap-4">
        <MovementTable movements={movements.slice(0, 6)} />
      </div>
    </div>
  );
}

function baseChartOptions(): ApexOptions {
  return {
    chart: {
      toolbar: { show: false },
      animations: {
        enabled: true,
        speed: 700,
        animateGradually: { enabled: true, delay: 90 },
        dynamicAnimation: { enabled: true, speed: 350 },
      },
      fontFamily: "Inter, ui-sans-serif, system-ui",
    },
    dataLabels: { enabled: false },
    grid: { borderColor: "#dfe9e1", strokeDashArray: 5 },
    legend: { show: false },
    stroke: { curve: "smooth", width: 3 },
    tooltip: {
      theme: "light",
      y: { formatter: (value) => eur.format(Number(value)) },
    },
    xaxis: {
      categories: monthNames,
      labels: { style: { colors: "#78716c" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: "#78716c" },
        formatter: (value) => eur.format(Number(value)),
      },
    },
    responsive: [
      {
        breakpoint: 640,
        options: {
          chart: { height: 190 },
          stroke: { width: 2 },
          yaxis: { labels: { show: false } },
        },
      },
    ],
  };
}

function MetricCard({
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

function MonthlyStatsDetail({
  forecast,
  movements,
  onBack,
}: {
  forecast: Forecast | null;
  movements: Movement[];
  onBack: () => void;
}) {
  const years = [
    ...new Set([
      currentYear,
      ...movements
        .map((movement) =>
          Number((movement.payment_date ?? movement.accrual_date).slice(0, 4)),
        )
        .filter(Boolean),
    ]),
  ].sort((a, b) => b - a);
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

function ForecastStatsDetail({
  forecast,
  movements,
  onBack,
}: {
  forecast: Forecast | null;
  movements: Movement[];
  onBack: () => void;
}) {
  const years = [
    ...new Set([
      currentYear,
      ...movements
        .map((movement) =>
          Number((movement.payment_date ?? movement.accrual_date).slice(0, 4)),
        )
        .filter(Boolean),
    ]),
  ].sort((a, b) => b - a);
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

function CashflowStatsDetail({
  forecast,
  movements,
  onBack,
}: {
  forecast: Forecast | null;
  movements: Movement[];
  onBack: () => void;
}) {
  const years = [
    ...new Set([
      currentYear,
      ...movements
        .map((movement) =>
          Number((movement.payment_date ?? movement.accrual_date).slice(0, 4)),
        )
        .filter(Boolean),
    ]),
  ].sort((a, b) => b - a);
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

function ArrearsStatsDetail({
  movements,
  onBack,
}: {
  movements: Movement[];
  onBack: () => void;
}) {
  const unpaid = movements.filter(
    (movement) => movement.type === "income" && openAmount(movement) > 0,
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
        .reduce((sum, movement) => sum + openAmount(movement), 0),
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
                    {eur.format(openAmount(movement))}
                  </Td>
                </tr>
              ))}
          </tbody>
        </Table>
      </SectionPanel>
    </div>
  );
}

function OccupancyStatsDetail({
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

function DetailHeader({
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

function GrowthPanel({
  netAccrual,
  incomeCash,
  collectionRate,
  rows,
}: {
  netAccrual: number;
  incomeCash: number;
  collectionRate: number;
  rows: YearRow[];
}) {
  const sparkOptions: ApexOptions = {
    ...baseChartOptions(),
    chart: { ...baseChartOptions().chart, sparkline: { enabled: true } },
    colors: ["#ffffff"],
    stroke: { curve: "smooth", width: 3 },
    tooltip: { enabled: false },
  };

  return (
    <SectionPanel title="Competenza e incassi" className="motion-card">
      <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
        <div className="rounded-lg bg-emerald-700 p-3 text-white sm:p-4">
          <p className="text-sm text-emerald-50/90">Competenza {currentYear}</p>
          <p className="mt-2 truncate text-lg font-semibold sm:mt-4 sm:text-2xl">
            {eur.format(netAccrual)}
          </p>
          <Chart
            options={sparkOptions}
            series={[
              {
                name: "Competenza",
                data: rows.map((row) => row.incomeDue - row.expenseDue),
              },
            ]}
            type="line"
            height={58}
          />
        </div>
        <div className="rounded-lg bg-lime-100 p-3 text-stone-900 sm:p-4">
          <p className="text-sm text-stone-600">Incasso {currentYear}</p>
          <p className="mt-2 truncate text-lg font-semibold sm:mt-4 sm:text-2xl">
            {eur.format(incomeCash)}
          </p>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white sm:mt-4 sm:h-3">
            <div
              className="h-full rounded-full bg-[repeating-linear-gradient(135deg,#087f5b_0_6px,transparent_6px_12px)] transition-all duration-700"
              style={{ width: `${collectionRate}%` }}
            />
          </div>
        </div>
      </div>
    </SectionPanel>
  );
}

function AnnualPanel({
  annual,
}: {
  annual: { income: number; expenses: number; net: number; done: number };
}) {
  return (
    <SectionPanel
      title={`Sintesi annuale ${currentYear}`}
      tone="dark"
      className="motion-card"
      contentClassName="space-y-4"
    >
      <KpiRow label="Entrate previste" value={annual.income} />
      <KpiRow label="Uscite previste" value={annual.expenses} />
      <KpiRow label="Netto previsto" value={annual.net} highlight />
      <KpiRow label="Netto effettuato" value={annual.done} />
    </SectionPanel>
  );
}

function PerformancePanel({ rate }: { rate: number }) {
  const options: ApexOptions = {
    chart: {
      sparkline: { enabled: true },
      animations: { enabled: true, speed: 800 },
    },
    colors: ["#087f5b"],
    fill: { colors: ["#087f5b"] },
    plotOptions: {
      radialBar: {
        startAngle: -110,
        endAngle: 110,
        hollow: { size: "62%" },
        track: { background: "#e5e7eb" },
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: 6,
            color: "#1c1917",
            fontSize: "28px",
            fontWeight: 700,
            formatter: (value) => `${Math.round(Number(value))}%`,
          },
        },
      },
    },
    stroke: { lineCap: "round" },
    responsive: [
      {
        breakpoint: 640,
        options: {
          chart: { height: 150 },
          plotOptions: {
            radialBar: {
              hollow: { size: "58%" },
              dataLabels: { value: { fontSize: "22px" } },
            },
          },
        },
      },
    ],
  };

  return (
    <SectionPanel title="Performance incassi" className="motion-card">
      <Chart options={options} series={[rate]} type="radialBar" height={180} />
      <p className="-mt-4 text-center text-sm text-stone-500">
        Obiettivo incassi
      </p>
    </SectionPanel>
  );
}

function BarPanel({
  rows,
  topProperty,
}: {
  rows: YearRow[];
  topProperty: { name: string; net: number } | null;
}) {
  const options: ApexOptions = {
    ...baseChartOptions(),
    chart: { ...baseChartOptions().chart, stacked: false },
    colors: ["#087f5b", "#c7f9b4"],
    fill: {
      opacity: 1,
      type: ["pattern", "solid"],
      pattern: {
        style: ["slantedLines", "verticalLines"],
        width: 6,
        height: 6,
        strokeWidth: 2,
      },
    },
    plotOptions: { bar: { borderRadius: 8, columnWidth: "48%" } },
    stroke: { show: false },
    yaxis: { show: false },
  };

  return (
    <SectionPanel title="Incassi vs previsto" className="motion-card">
      <Chart
        options={options}
        series={[
          { name: "Entrate", data: rows.map((row) => row.incomeDue) },
          { name: "Incassato", data: rows.map((row) => row.incomeDone) },
        ]}
        type="bar"
        height={210}
      />
      {topProperty ? (
        <p className="mt-2 text-sm text-stone-500">
          Miglior immobile:{" "}
          <span className="font-semibold text-emerald-700">
            {topProperty.name}
          </span>{" "}
          ({eur.format(topProperty.net)})
        </p>
      ) : null}
    </SectionPanel>
  );
}

function MonthlyTrendChart({ rows }: { rows: YearRow[] }) {
  const options: ApexOptions = {
    ...baseChartOptions(),
    colors: ["#087f5b", "#d97706", "#21b37b", "#f59e0b"],
  };

  return (
    <SectionPanel
      title="Andamento mensile"
      className="motion-card"
      actions={<CalendarClock size={18} className="text-emerald-700" />}
    >
      <Chart
        options={options}
        series={[
          { name: "Entrate previste", data: rows.map((row) => row.incomeDue) },
          { name: "Spese previste", data: rows.map((row) => row.expenseDue) },
          {
            name: "Entrate effettuate",
            data: rows.map((row) => row.incomeDone),
          },
          {
            name: "Spese effettuate",
            data: rows.map((row) => row.expenseDone),
          },
        ]}
        type="line"
        height={240}
      />
    </SectionPanel>
  );
}

function MonthlyTable({ rows, year }: { rows: YearRow[]; year: number }) {
  return (
    <SectionPanel
      title={`Dettaglio mensile ${year}`}
      className="motion-card"
      surface="plain"
    >
      <Table>
        <thead>
          <tr>
            <Th>Mese</Th>
            <Th>Entrate</Th>
            <Th>Uscite</Th>
            <Th>Incassato</Th>
            <Th>Pagato</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.month}>
              <Td className="capitalize">
                {fullMonthLabel.format(new Date(`${row.month}-01T00:00:00`))}
              </Td>
              <Td>{eur.format(row.incomeDue)}</Td>
              <Td>{eur.format(row.expenseDue)}</Td>
              <Td className="text-emerald-700">{eur.format(row.incomeDone)}</Td>
              <Td className="text-amber-700">{eur.format(row.expenseDone)}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </SectionPanel>
  );
}

function KpiRow({
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
