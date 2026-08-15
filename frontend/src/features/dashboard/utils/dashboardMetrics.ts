import {
  Contract,
  Forecast,
  Movement,
  Property,
  Unit,
} from "@shared/lib/api";

export type YearRow = {
  month: string;
  incomeDue: number;
  expenseDue: number;
  incomeDone: number;
  expenseDone: number;
};
export type OccupancyRow = { month: string; rented: number; vacant: number };

export function buildYearRows(
  year: number,
  months: Forecast["months"],
  movements: Movement[],
): YearRow[] {
  const forecastByMonth = new Map(months.map((row) => [row.month, row]));
  return Array.from({ length: 12 }, (_, index) => {
    const month = `${year}-${String(index + 1).padStart(2, "0")}`;
    const forecastRow = forecastByMonth.get(month);
    const done = movements.reduce(
      (total, movement) => {
        const movementMonth = (
          movement.payment_date ?? movement.accrual_date
        ).slice(0, 7);
        if (
          movementMonth !== month ||
          movement.status === "unpaid" ||
          movement.type === "transfer"
        )
          return total;
        const amount = Number(
          movement.status === "partial"
            ? (movement.paid_amount ?? 0)
            : movement.amount,
        );
        if (movement.type === "income") total.income += amount;
        if (movement.type === "expense") total.expenses += amount;
        return total;
      },
      { income: 0, expenses: 0 },
    );
    return {
      month,
      incomeDue: Number(forecastRow?.income_due ?? 0),
      expenseDue: Number(forecastRow?.expense_due ?? 0),
      incomeDone: done.income,
      expenseDone: done.expenses,
    };
  });
}

export function countRentedUnits(
  units: Unit[],
  contracts: Contract[],
  date: string,
) {
  const activeUnitIds = new Set(
    contracts
      .filter(
        (contract) =>
          contract.starts_on <= date &&
          (!contract.ends_on || contract.ends_on >= date),
      )
      .map((contract) => contract.unit_id),
  );
  return units.filter((unit) => activeUnitIds.has(unit.id)).length;
}

export function buildOccupancyRows(
  year: number,
  units: Unit[],
  contracts: Contract[],
): OccupancyRow[] {
  return Array.from({ length: 12 }, (_, index) => {
    const firstDay = `${year}-${String(index + 1).padStart(2, "0")}-01`;
    const lastDay = `${year}-${String(index + 1).padStart(2, "0")}-${String(new Date(year, index + 1, 0).getDate()).padStart(2, "0")}`;
    const activeUnitIds = new Set(
      contracts
        .filter(
          (contract) =>
            contract.starts_on <= lastDay &&
            (!contract.ends_on || contract.ends_on >= firstDay),
        )
        .map((contract) => contract.unit_id),
    );
    const rented = units.filter((unit) => activeUnitIds.has(unit.id)).length;
    return {
      month: firstDay.slice(0, 7),
      rented,
      vacant: Math.max(0, units.length - rented),
    };
  });
}

export function buildExtraMetrics(
  properties: Property[],
  units: Unit[],
  contracts: Contract[],
  movements: Movement[],
  rows: YearRow[],
  year: number,
) {
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const in180Days = new Date(today);
  in180Days.setDate(today.getDate() + 180);
  const annual = rows.reduce(
    (total, row) => ({
      income: total.income + row.incomeDue,
      expenses: total.expenses + row.expenseDue,
      net: total.net + row.incomeDue - row.expenseDue,
    }),
    { income: 0, expenses: 0, net: 0 },
  );
  const purchaseValue = properties.reduce(
    (sum, property) => sum + Number(property.purchase_value),
    0,
  );
  const paidWithDelay = movements.filter(
    (movement) =>
      movement.payment_date &&
      movement.due_date &&
      movement.status !== "unpaid" &&
      movement.type !== "transfer",
  );
  const avgDelay = paidWithDelay.length
    ? Math.round(
        paidWithDelay.reduce(
          (sum, movement) =>
            sum +
            Math.max(
              0,
              (Date.parse(movement.payment_date!) -
                Date.parse(movement.due_date!)) /
                86400000,
            ),
          0,
        ) / paidWithDelay.length,
      )
    : 0;
  const activeUnits = countRentedUnits(units, contracts, todayIso);
  const expiringContracts = contracts.filter(
    (contract) =>
      contract.ends_on &&
      contract.ends_on >= todayIso &&
      contract.ends_on <= in180Days.toISOString().slice(0, 10),
  ).length;
  const propertyNet = properties
    .map((property) => ({
      name: property.name,
      net: movements
        .filter(
          (movement) =>
            movement.accrual_date.startsWith(String(year)) &&
            movement.property_id === property.id &&
            movement.type !== "transfer",
        )
        .reduce(
          (sum, movement) =>
            sum +
            Number(movement.amount) * (movement.type === "income" ? 1 : -1),
          0,
        ),
    }))
    .sort((a, b) => b.net - a.net)[0];

  return {
    occupancyRate: units.length
      ? Math.round((activeUnits / units.length) * 100)
      : 0,
    avgDelay,
    expenseRatio: annual.income
      ? Math.round((annual.expenses / annual.income) * 100)
      : 0,
    netYield: purchaseValue ? (annual.net / purchaseValue) * 100 : 0,
    expiringContracts,
    topProperty: propertyNet ?? null,
  };
}
