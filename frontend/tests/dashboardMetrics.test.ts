import assert from "node:assert/strict";
import {
  buildOccupancyRows,
  buildYearRows,
} from "../src/features/dashboard/utils/dashboardMetrics";
import { openAmount, paidAmount } from "../src/features/movements/utils/movementUtils";
import { Contract, Movement, Unit } from "../src/shared/lib/apiTypes";

const partial = {
  amount: "1000",
  paid_amount: "250",
  status: "partial",
} as Movement;

assert.equal(paidAmount(partial), 250);
assert.equal(openAmount(partial), 750);

const movements = [
  {
    id: "income-paid",
    type: "income",
    status: "paid",
    amount: "900",
    accrual_date: "2026-01-01",
    payment_date: "2026-01-10",
  },
  {
    id: "expense-paid",
    type: "expense",
    status: "paid",
    amount: "100",
    accrual_date: "2026-01-01",
    payment_date: "2026-01-12",
  },
  {
    id: "income-unpaid",
    type: "income",
    status: "unpaid",
    amount: "500",
    accrual_date: "2026-01-01",
  },
] as Movement[];

const rows = buildYearRows(
  2026,
  [{ month: "2026-01", income_due: "1200", expense_due: "200", net_due: "1000" }],
  movements,
);

assert.equal(rows[0].incomeDue, 1200);
assert.equal(rows[0].expenseDue, 200);
assert.equal(rows[0].incomeDone, 900);
assert.equal(rows[0].expenseDone, 100);
assert.equal(rows[1].incomeDone, 0);

const units = [
  { id: "u1", property_id: "p1" },
  { id: "u2", property_id: "p1" },
] as Unit[];
const contracts = [
  { unit_id: "u1", starts_on: "2026-01-15", ends_on: "2026-03-10" },
] as Contract[];
const occupancy = buildOccupancyRows(2026, units, contracts);

assert.deepEqual(
  occupancy.slice(0, 4).map((row) => [row.rented, row.vacant]),
  [
    [1, 1],
    [1, 1],
    [1, 1],
    [0, 2],
  ],
);
