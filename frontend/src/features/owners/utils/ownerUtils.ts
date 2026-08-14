import { Data } from "@app/types/app";
import { Owner } from "@shared/lib/api";

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
      .filter((item) => Number(item.owner_balance) > 0)
      .reduce((sum, item) => sum + Number(item.owner_balance), 0),
    debts: data.ownerReports
      .filter((item) => Number(item.owner_balance) < 0)
      .reduce((sum, item) => sum + Number(item.owner_balance), 0),
  };
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
        (balanceFilter === "credit" ? balance >= 0 : balance < 0))
    );
  });
}
