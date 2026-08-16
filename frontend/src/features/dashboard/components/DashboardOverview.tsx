import { CalendarClock, Home, ReceiptText, WalletCards } from "lucide-react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { eur } from "@shared/lib/utils";
import { SectionPanel } from "@shared/components/SectionPanel";
import { Table, Td, Th } from "@shared/components/ui/table";
import { YearRow } from "@features/dashboard/utils/dashboardMetrics";
import {
  KpiRow,
  MetricCard,
} from "./DashboardShared";
import {
  baseChartOptions,
  currentYear,
  fullMonthLabel,
} from "./DashboardConfig";

type ViewName =
  | "monthly"
  | "forecast"
  | "cashflow"
  | "arrears"
  | "occupancy";

export function DashboardOverview({
  rows,
  monthIncome,
  cashflow,
  arrears,
  occupancyRate,
  netAccrual,
  incomeCash,
  collectionRate,
  annual,
  topProperty,
  onOpen,
}: {
  rows: YearRow[];
  monthIncome: number;
  cashflow: number;
  arrears: number;
  occupancyRate: number;
  netAccrual: number;
  incomeCash: number;
  collectionRate: number;
  annual: { income: number; expenses: number; net: number; done: number };
  topProperty: { name: string; net: number } | null;
  onOpen: (view: ViewName) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
        <MetricCard
          delay={0}
          icon={<CalendarClock size={18} />}
          label="Incasso mese"
          value={eur.format(monthIncome)}
          tone="good"
          onClick={() => onOpen("monthly")}
        />
        <MetricCard
          delay={70}
          icon={<WalletCards size={18} />}
          label="Cassa netta"
          value={eur.format(cashflow)}
          tone={cashflow >= 0 ? "good" : "bad"}
          onClick={() => onOpen("cashflow")}
        />
        <MetricCard
          delay={140}
          icon={<ReceiptText size={18} />}
          label="Morosità"
          value={eur.format(arrears)}
          tone={arrears ? "bad" : "good"}
          onClick={() => onOpen("arrears")}
        />
        <MetricCard
          delay={210}
          icon={<Home size={18} />}
          label="Occupazione"
          value={`${occupancyRate}%`}
          onClick={() => onOpen("occupancy")}
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
        <BarPanel rows={rows} topProperty={topProperty} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <MonthlyTable rows={rows} year={currentYear} />
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
  const baseOptions = baseChartOptions();
  const sparkOptions: ApexOptions = {
    ...baseOptions,
    chart: { ...baseOptions.chart, sparkline: { enabled: true } },
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
  const baseOptions = baseChartOptions();
  const options: ApexOptions = {
    ...baseOptions,
    chart: { ...baseOptions.chart, stacked: false },
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

export function MonthlyTrendChart({ rows }: { rows: YearRow[] }) {
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

export function MonthlyTable({ rows, year }: { rows: YearRow[]; year: number }) {
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
