import { Data } from "@app/types/app";

export function ownerName(data: Data, ownerId?: string | null) {
  const owner = data.owners.find((item) => item.id === ownerId);
  return owner ? `${owner.first_name} ${owner.last_name}` : "";
}

export function activeShares(data: Data, propertyId?: string, unitId?: string) {
  const today = new Date().toISOString().slice(0, 10);
  const valid = data.shares.filter(
    (share) =>
      share.valid_from <= today && (!share.valid_to || share.valid_to >= today),
  );
  const unitShares = unitId
    ? valid.filter((share) => share.unit_id === unitId)
    : [];
  if (unitShares.length) return unitShares;
  return valid.filter((share) => share.property_id === propertyId);
}

export function filterMovements(
  data: Data,
  search: string,
  typeFilter: string,
  statusFilter: string,
) {
  return data.movements.filter((movement) => {
    const property = data.properties.find(
      (item) => item.id === movement.property_id,
    );
    const unit = data.units.find((item) => item.id === movement.unit_id);
    const text =
      `${movement.description} ${movement.category} ${property?.name ?? ""} ${unit?.name ?? ""}`.toLowerCase();
    return (
      text.includes(search.toLowerCase()) &&
      (typeFilter === "all" || movement.type === typeFilter) &&
      (statusFilter === "all" || movement.status === statusFilter)
    );
  });
}
