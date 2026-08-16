import { useState } from "react";
import {
  Contract,
  Forecast,
  Movement,
  Property,
  Summary,
  Unit,
} from "@shared/lib/api";
import {
  buildExtraMetrics,
  buildYearRows,
} from "@features/dashboard/utils/dashboardMetrics";
import {
  ArrearsStatsDetail,
  CashflowStatsDetail,
  ForecastStatsDetail,
  OccupancyStatsDetail,
} from "@features/dashboard/components/DashboardDetails";
import { MonthlyStatsDetail } from "@features/dashboard/components/DashboardMonthlyDetail";
import { DashboardOverview } from "@features/dashboard/components/DashboardOverview";
import { currentYear } from "@features/dashboard/components/DashboardConfig";

type DashboardView =
  | "overview"
  | "monthly"
  | "forecast"
  | "cashflow"
  | "arrears"
  | "occupancy";

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
  const [view, setView] = useState<DashboardView>("overview");
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
  const backToOverview = () => setView("overview");

  if (view === "monthly") {
    return (
      <MonthlyStatsDetail
        forecast={forecast}
        movements={movements}
        onBack={backToOverview}
      />
    );
  }
  if (view === "forecast") {
    return (
      <ForecastStatsDetail
        forecast={forecast}
        movements={movements}
        onBack={backToOverview}
      />
    );
  }
  if (view === "cashflow") {
    return (
      <CashflowStatsDetail
        forecast={forecast}
        movements={movements}
        onBack={backToOverview}
      />
    );
  }
  if (view === "arrears") {
    return <ArrearsStatsDetail movements={movements} onBack={backToOverview} />;
  }
  if (view === "occupancy") {
    return (
      <OccupancyStatsDetail
        units={units}
        contracts={contracts}
        onBack={backToOverview}
      />
    );
  }

  return (
    <DashboardOverview
      rows={rows}
      monthIncome={monthIncome}
      cashflow={cashflow}
      arrears={arrears}
      occupancyRate={extra.occupancyRate}
      netAccrual={netAccrual}
      incomeCash={incomeCash}
      collectionRate={collectionRate}
      annual={annual}
      topProperty={extra.topProperty}
      onOpen={setView}
    />
  );
}
