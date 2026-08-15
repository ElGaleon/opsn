import { Data } from "@app/types/app";
import { Movement } from "@shared/lib/api";

export function ownerDisplayName(firstName?: string | null, lastName?: string | null) {
  return [firstName, lastName]
    .filter(Boolean)
    .join(" ")
    .replace(/\s*,\s*,\s*/g, " ")
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function ownerName(data: Data, ownerId?: string | null) {
  const owner = data.owners.find((item) => item.id === ownerId);
  return owner ? ownerDisplayName(owner.first_name, owner.last_name) : "";
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

export function movementTypeLabel(type?: string | null) {
  if (type === "income") return "Entrata";
  if (type === "expense") return "Uscita";
  if (type === "transfer") return "Trasferimento";
  return "—";
}

export function paymentStatusLabel(status?: string | null) {
  if (status === "paid") return "Pagato";
  if (status === "partial") return "Parziale";
  if (status === "unpaid") return "Non pagato";
  if (status === "open") return "Aperta";
  if (status === "done") return "Chiusa";
  return status || "—";
}

export function paymentStatusClass(status?: string | null) {
  if (status === "paid" || status === "done")
    return "border-0 bg-emerald-50 text-emerald-800";
  if (status === "partial")
    return "border-0 bg-amber-50 text-amber-800";
  if (status === "unpaid" || status === "open")
    return "border-0 bg-red-50 text-red-800";
  return "border-0 bg-stone-100 text-stone-700";
}

export function paidAmount(movement: Movement) {
  if (movement.status === "unpaid") return 0;
  return Number(movement.paid_amount ?? movement.amount);
}
