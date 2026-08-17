import { Data } from "@app/types/app";
import { Owner, OwnerReport } from "@shared/lib/api";

export const ownerValues = (owner?: Owner) => ({
  first_name: owner?.first_name ?? "",
  last_name: owner?.last_name ?? "",
  tax_code: owner?.tax_code ?? "",
  contacts: owner?.contacts ?? "",
});

export function ownerLabel(data: Data, ownerId: string) {
  const owner = data.owners.find((item) => item.id === ownerId);
  return owner ? `${owner.first_name} ${owner.last_name}` : "Proprietario";
}

export function targetName(
  data: Data,
  propertyId?: string | null,
  unitId?: string | null,
) {
  if (unitId)
    return data.units.find((unit) => unit.id === unitId)?.name ?? "Unità";
  return (
    data.properties.find((property) => property.id === propertyId)?.name ??
    "Immobile"
  );
}

export function ownerBalanceStats(data: Data) {
  return {
    total: data.ownerReports.reduce(
      (sum, item) => sum + Number(item.owner_balance),
      0,
    ),
    credits: data.ownerReports
      .filter((item) => Number(item.owner_balance) < 0)
      .reduce((sum, item) => sum + Math.abs(Number(item.owner_balance)), 0),
    debts: data.ownerReports
      .filter((item) => Number(item.owner_balance) > 0)
      .reduce((sum, item) => sum + Number(item.owner_balance), 0),
  };
}

export function ownerBalanceLabel(balance: number) {
  if (balance > 0) return "Deve versare";
  if (balance < 0) return "Deve ricevere";
  return "In pari";
}

export function ownerBalanceAmount(balance: number) {
  return Math.abs(balance);
}

export function ownerBalanceTone(balance: number) {
  if (balance > 0) return "bad";
  if (balance < 0) return "good";
  return "default";
}

export function buildOwnerSettlements(reports: OwnerReport[]) {
  const debtors = reports
    .map((row) => ({ owner: row.owner, amount: Number(row.owner_balance) }))
    .filter((row) => row.amount > 0)
    .sort((a, b) => b.amount - a.amount);
  const creditors = reports
    .filter((row) => Number(row.owner_balance) < 0)
    .map((row) => ({
      owner: row.owner,
      amount: Math.abs(Number(row.owner_balance)),
    }))
    .sort((a, b) => b.amount - a.amount);
  const rows: { from: string; to: string; amount: number }[] = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const amount = Math.min(
      debtors[debtorIndex].amount,
      creditors[creditorIndex].amount,
    );
    rows.push({
      from: debtors[debtorIndex].owner,
      to: creditors[creditorIndex].owner,
      amount,
    });
    debtors[debtorIndex].amount -= amount;
    creditors[creditorIndex].amount -= amount;
    if (debtors[debtorIndex].amount < 0.01) debtorIndex += 1;
    if (creditors[creditorIndex].amount < 0.01) creditorIndex += 1;
  }

  return rows;
}

export function filterOwners(
  data: Data,
  search: string,
  balanceFilter: string,
) {
  return data.owners.filter((owner) => {
    const report = data.ownerReports.find((item) => item.owner_id === owner.id);
    const balance = Number(report?.owner_balance ?? 0);
    const text =
      `${owner.first_name} ${owner.last_name} ${owner.tax_code ?? ""}`.toLowerCase();
    return (
      text.includes(search.toLowerCase()) &&
      (balanceFilter === "all" ||
        (balanceFilter === "credit" ? balance < 0 : balance > 0))
    );
  });
}
